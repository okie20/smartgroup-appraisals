import {
  Person,
  DepartmentCluster,
  AllocatedGroup,
  GroupingConfig,
  AllocationStats,
  isPersonSupervisor,
  getPersonFacility,
} from '../types';
import { findMatchingAnnexARule, evaluatePanelCompliance } from '../data/annexASpecifications';
import {
  getDesignatedSupervisorForReviewee,
  matchSupervisorPerson,
  DesignatedSupervisorResult,
} from './supervisorRules';


/**
 * People who should ONLY appear on review panels for supervisors/managers —
 * not on panels for regular front-line staff.
 * Alex Baguma (Head of Operations) reviews fellow managers and named supervisors
 * per the document, but should NOT be pulled into panels for receptionists,
 * enrolment operators, customer care reps, etc.
 */
const MANAGEMENT_ONLY_REVIEWERS: string[] = ['baguma'];

/**
 * Returns true if this reviewer is restricted to management/supervisor panels only.
 */
function isManagementOnlyReviewer(reviewer: Person): boolean {
  const nameLower = reviewer.name.toLowerCase().replace(/[^a-z]/g, '');
  return MANAGEMENT_ONLY_REVIEWERS.some((fragment) => nameLower.includes(fragment));
}

/**
 * Regional facility supervisors who are ONLY allowed to evaluate staff
 * from their own branch. They must NOT appear on panels for staff at
 * other facilities, even during workload-balancing passes.
 *
 * Head-office managers (e.g. Alex Baguma, PC) are NOT listed here because
 * they legitimately oversee cross-facility staff per the appraisal document.
 */
const REGIONAL_FACILITY_SUPERVISORS: { nameFragment: string; facility: string }[] = [
  { nameFragment: 'tumusiime', facility: 'Jinja' },
  { nameFragment: 'nairima',   facility: 'Mbale' },
  { nameFragment: 'atine',     facility: 'Gulu' },
  { nameFragment: 'nimaro',    facility: 'Arua' },
  { nameFragment: 'laker',     facility: 'Arua' },
  { nameFragment: 'sserunjoji', facility: 'Fort Portal' },
  { nameFragment: 'sserunjogi', facility: 'Fort Portal' },
  { nameFragment: 'birungi',   facility: 'Mbarara' },
];

/**
 * Returns the facility this person is restricted to evaluating (if any).
 * Regional facility supervisors may only sit on panels for their own branch.
 * Returns null for everyone else (no restriction).
 */
function getReviewerFacilityRestriction(reviewer: Person): string | null {
  const nameLower = reviewer.name.toLowerCase().replace(/[^a-z]/g, '');
  for (const entry of REGIONAL_FACILITY_SUPERVISORS) {
    if (nameLower.includes(entry.nameFragment)) {
      return entry.facility;
    }
  }
  return null;
}

/**
 * Hard eligibility check: can `reviewer` sit on the review panel for `reviewee`?
 * Enforces three rules:
 * 1. Non-supervisors only evaluate within their own facility
 * 2. Regional facility supervisors only evaluate their own branch
 * 3. Management-only reviewers (e.g. Alex Baguma) only sit on supervisor/manager panels
 */
function canReviewerEvaluate(reviewer: Person, reviewee: Person): boolean {
  // Rule 1 (existing): non-supervisors only evaluate within their own facility
  if (!isPersonSupervisor(reviewee)) {
    if (getPersonFacility(reviewer) !== getPersonFacility(reviewee)) {
      return false;
    }
  }

  // Rule 2 (existing): regional facility supervisors only evaluate their own branch
  const restriction = getReviewerFacilityRestriction(reviewer);
  if (restriction !== null && restriction !== getPersonFacility(reviewee)) {
    return false;
  }

  // Rule 3 (new): management-only reviewers only sit on supervisor/manager panels
  if (isManagementOnlyReviewer(reviewer) && !isPersonSupervisor(reviewee)) {
    return false;
  }

  return true;
}

/**
 * Seeded pseudo-random number generator (Mulberry32)
 */
function createRng(seed: number) {
  let s = seed | 0;
  return function () {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Shuffle array in-place using RNG
 */
function shuffle<T>(array: T[], rng: () => number): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Get cluster id for a department
 */
export function getClusterForDepartment(dept: string, clusters: DepartmentCluster[]): DepartmentCluster | undefined {
  return clusters.find((c) => c.departments.includes(dept));
}

/**
 * Affinity check between two departments
 */
export function getAffinityType(
  deptA: string,
  deptB: string,
  clusters: DepartmentCluster[]
): 'same_dept' | 'close_cluster' | 'cross_dept' {
  if (deptA === deptB) return 'same_dept';
  const clusterA = getClusterForDepartment(deptA, clusters);
  const clusterB = getClusterForDepartment(deptB, clusters);
  if (clusterA && clusterB && clusterA.id === clusterB.id) {
    return 'close_cluster';
  }
  return 'cross_dept';
}

export interface GroupAllocationResult {
  groups: AllocatedGroup[];
  revieweeToGroupMap: Record<string, string>; // reviewee personId -> groupId
  memberReviewAssignmentsMap: Record<string, string[]>; // reviewer personId -> array of groupIds where they review
  memberToGroupMap: Record<string, string>; // personId -> their reviewee groupId (for backwards compatibility)
  stats: AllocationStats;
}

/**
 * Core review group allocation engine:
 * 1. Annex A Specification Integration:
 *    - For the 18 designated functions, review panels are constructed prioritizing the exact
 *      prescribed 7 appraisers (Line Supervisor, USPC rep, Facility Supervisor reps, Operations reps,
 *      Customer Care reps, Technical team rep, etc.) as mandated in Annex A.
 * 2. Reciprocal Peer Participation Guarantee:
 *    - Every employee in the roster is an "Employee Being Reviewed" with a dedicated review group allocated to them.
 *    - The reviewee is NOT part of the group's reviewing panel (no self-review).
 *    - Every employee also actively serves on ~7 panels reviewing their peers (100% reciprocal participation, 0 employees left out).
 * 3. Workload Smoothing:
 *    - Balanced reviewer distribution across all staff.
 */
export function generateAllocations(
  people: Person[],
  clusters: DepartmentCluster[],
  config: GroupingConfig
): GroupAllocationResult {
  if (people.length === 0) {
    return {
      groups: [],
      revieweeToGroupMap: {},
      memberReviewAssignmentsMap: {},
      memberToGroupMap: {},
      stats: {
        totalPeople: 0,
        groupCount: 0,
        avgGroupSize: 0,
        minGroupSize: 0,
        maxGroupSize: 0,
        avgReviewsPerPerson: 0,
        minReviewsPerPerson: 0,
        maxReviewsPerPerson: 0,
        peopleWithZeroReviews: 0,
        sameDeptPercent: 0,
        closeClusterPercent: 0,
        crossDeptPercent: 0,
        annexARolesCount: 0,
        annexACompliantCount: 0,
        avgAnnexACompliance: 0,
      },
    };
  }

  const rng = createRng(config.randomSeed);
  const total = people.length;

  // Review panel target size (e.g. 7 reviewers per employee as specified in Annex A)
  const targetSize = Math.min(Math.max(1, total - 1), Math.max(3, config.targetGroupSize));

  // Map for fast person lookup
  const peopleMap = new Map<string, Person>(people.map((p) => [p.id, p]));

  // Track how many times each person has been assigned to a review group
  const reviewCounts: Record<string, number> = {};
  people.forEach((p) => {
    reviewCounts[p.id] = 0;
  });

  // Track group assignments: revieweeId -> array of reviewer person IDs
  const groupMembersMap: Record<string, string[]> = {};

  // Randomize iteration order of reviewees so assignment order does not bias
  const shuffledReviewees = shuffle([...people], rng);

  // Map tracking mandatory designated supervisors for each reviewee
  const mandatorySupervisorMap: Record<
    string,
    { supervisorPerson: Person; result: DesignatedSupervisorResult }
  > = {};

  // PASS 1: Mandatory Supervisor Placement + Annex A & Facility Scoped Initial Allocation
  for (const reviewee of shuffledReviewees) {
    const isRevieweeSupervisor = isPersonSupervisor(reviewee);
    const revieweeFacility = getPersonFacility(reviewee);

    // Look up designated supervisor for reviewee
    const supRule = getDesignatedSupervisorForReviewee(reviewee);
    let designatedSupervisorPerson: Person | null = null;
    if (supRule) {
      designatedSupervisorPerson = matchSupervisorPerson(supRule.supervisorName, people, reviewee.id);
      if (designatedSupervisorPerson) {
        mandatorySupervisorMap[reviewee.id] = {
          supervisorPerson: designatedSupervisorPerson,
          result: supRule,
        };
      }
    }

    // Eligible peer reviewers are all colleagues EXCEPT the reviewee themselves
    let candidates = people.filter((p) => p.id !== reviewee.id);

    // Exclude designated supervisor from general candidate pool to prevent duplication
    if (designatedSupervisorPerson) {
      candidates = candidates.filter((p) => p.id !== designatedSupervisorPerson!.id);
    }

    // CRITICAL FACILITY RULES:
    // 1. Non-supervisors: reviewers must come from the same facility.
    // 2. Regional facility supervisors (Tumusiime, Nairima, Atine, Nimaro/Laker,
    //    Sserunjogi, Birungi) may ONLY evaluate staff from their own branch.
    {
      const eligible = candidates.filter((p) => canReviewerEvaluate(p, reviewee));
      if (eligible.length > 0) {
        candidates = eligible;
      }
    }

    const annexRule = findMatchingAnnexARule(reviewee.role, reviewee.department);
    const selectedReviewerIds: string[] = [];

    // SLOT 1: ALWAYS insert the mandatory supervisor first if designated!
    if (designatedSupervisorPerson) {
      selectedReviewerIds.push(designatedSupervisorPerson.id);
      reviewCounts[designatedSupervisorPerson.id] = (reviewCounts[designatedSupervisorPerson.id] || 0) + 1;
    }

    if (annexRule) {
      // Reviewee has an Annex A rule! Fill slots according to prescribed requirements
      const remainingCandidates = [...candidates];

      for (const req of annexRule.requirements) {
        let neededForThisSlot = req.targetCount;

        // If the mandatory supervisor already satisfies a supervisor/line manager requirement, decrement needed
        if (
          designatedSupervisorPerson &&
          (req.label.toLowerCase().includes('supervisor') ||
            req.label.toLowerCase().includes('line') ||
            req.roleOrDeptDescription.toLowerCase().includes('supervisor'))
        ) {
          neededForThisSlot = Math.max(0, neededForThisSlot - 1);
        }

        if (neededForThisSlot <= 0) continue;

        // Sort remaining candidates by how well they match this specific slot, workload, and facility affinity
        const slotScored = remainingCandidates.map((cand) => {
          const matchScore = req.matchScore(cand, reviewee);
          const loadPenalty = (reviewCounts[cand.id] || 0) * 4.5;
          const jitter = rng() * 3;
          // Extra preference if same facility
          const facilityBonus = getPersonFacility(cand) === revieweeFacility ? 8 : 0;
          return { cand, score: matchScore * 12 - loadPenalty + jitter + facilityBonus, matchScore };
        });

        // Filter to those with positive match score if possible
        const validMatches = slotScored.filter((s) => s.matchScore > 0);
        validMatches.sort((a, b) => b.score - a.score);

        const toTake = validMatches.slice(0, neededForThisSlot);
        for (const item of toTake) {
          selectedReviewerIds.push(item.cand.id);
          reviewCounts[item.cand.id] = (reviewCounts[item.cand.id] || 0) + 1;
          const idx = remainingCandidates.findIndex((c) => c.id === item.cand.id);
          if (idx !== -1) remainingCandidates.splice(idx, 1);
        }
      }

      // If any slots remain unfilled up to targetSize, fill from best general candidates
      if (selectedReviewerIds.length < targetSize) {
        const stillNeeded = targetSize - selectedReviewerIds.length;
        const generalScored = remainingCandidates.map((cand) => {
          const aff = getAffinityType(reviewee.department, cand.department, clusters);
          const affScore = aff === 'same_dept' ? 35 : aff === 'close_cluster' ? 20 : 5;
          const loadPenalty = (reviewCounts[cand.id] || 0) * 6;
          const facilityBonus = getPersonFacility(cand) === revieweeFacility ? 15 : 0;
          return { cand, score: affScore - loadPenalty + facilityBonus + rng() * 4 };
        });
        generalScored.sort((a, b) => b.score - a.score);
        const fillers = generalScored.slice(0, stillNeeded);
        for (const item of fillers) {
          selectedReviewerIds.push(item.cand.id);
          reviewCounts[item.cand.id] = (reviewCounts[item.cand.id] || 0) + 1;
        }
      }

      groupMembersMap[reviewee.id] = selectedReviewerIds.slice(0, targetSize);
    } else {
      // General reviewee: score candidates based on department affinity, facility, and current workload
      const remainingNeeded = targetSize - selectedReviewerIds.length;
      if (remainingNeeded > 0) {
        const scoredCandidates = candidates.map((candidate) => {
          const affinity = getAffinityType(reviewee.department, candidate.department, clusters);

          let affinityScore = 5;
          if (affinity === 'same_dept') {
            affinityScore = 45;
          } else if (affinity === 'close_cluster') {
            affinityScore = 25;
          }

          // Heavy facility alignment for non-supervisors
          const isSameFacility = getPersonFacility(candidate) === revieweeFacility;
          const facilityWeight = !isRevieweeSupervisor ? (isSameFacility ? 60 : -500) : (isSameFacility ? 10 : 0);

          const currentLoad = reviewCounts[candidate.id] || 0;
          const loadPenalty = currentLoad * 7.0;
          const jitter = rng() * 5;

          const finalScore = affinityScore + facilityWeight - loadPenalty + jitter;
          return { candidate, score: finalScore };
        });

        scoredCandidates.sort((a, b) => b.score - a.score);
        const chosenReviewers = scoredCandidates.slice(0, remainingNeeded).map((sc) => sc.candidate.id);

        chosenReviewers.forEach((revId) => {
          selectedReviewerIds.push(revId);
          reviewCounts[revId] = (reviewCounts[revId] || 0) + 1;
        });
      }

      groupMembersMap[reviewee.id] = selectedReviewerIds.slice(0, targetSize);
    }
  }

  // PASS 2: Local optimization passes (simulated annealing / smart swaps)
  // Swaps a reviewer in one group with another eligible candidate to boost Annex A or affinity
  const optIterations = Math.min(2500, total * 15);
  for (let it = 0; it < optIterations; it++) {
    const revIdx = Math.floor(rng() * shuffledReviewees.length);
    const reviewee = shuffledReviewees[revIdx];
    const currentMembers = groupMembersMap[reviewee.id];
    if (!currentMembers || currentMembers.length === 0) continue;

    const annexRule = findMatchingAnnexARule(reviewee.role, reviewee.department);

    // Pick a reviewer inside this group to potentially replace (protect the mandatory supervisor from being swapped out!)
    const designatedSupId = mandatorySupervisorMap[reviewee.id]?.supervisorPerson.id;
    const swappableIndices = currentMembers
      .map((id, idx) => ({ id, idx }))
      .filter((item) => item.id !== designatedSupId);

    if (swappableIndices.length === 0) continue;
    const chosenItem = swappableIndices[Math.floor(rng() * swappableIndices.length)];
    const mIdx = chosenItem.idx;
    const currentReviewerId = chosenItem.id;
    const currentReviewer = peopleMap.get(currentReviewerId);
    if (!currentReviewer) continue;

    // Pick an eligible candidate not currently in this group and not the reviewee
    let candidatePool = people.filter(
      (p) => p.id !== reviewee.id && !currentMembers.includes(p.id)
    );

    // Respect facility rules: non-supervisor same-facility rule + regional supervisor restriction
    candidatePool = candidatePool.filter((p) => canReviewerEvaluate(p, reviewee));

    if (candidatePool.length === 0) continue;

    const candidate = candidatePool[Math.floor(rng() * candidatePool.length)];

    let scoreDelta = 0;

    if (annexRule) {
      // Evaluate Annex A score difference
      const curAnnexScore = annexRule.requirements.reduce(
        (max, req) => Math.max(max, req.matchScore(currentReviewer, reviewee)),
        0
      );
      const candAnnexScore = annexRule.requirements.reduce(
        (max, req) => Math.max(max, req.matchScore(candidate, reviewee)),
        0
      );
      scoreDelta = (candAnnexScore - curAnnexScore) * 15;
    } else {
      const curAff = getAffinityType(reviewee.department, currentReviewer.department, clusters);
      const candAff = getAffinityType(reviewee.department, candidate.department, clusters);
      const getScore = (aff: string) => (aff === 'same_dept' ? 25 : aff === 'close_cluster' ? 14 : 2);
      scoreDelta = getScore(candAff) - getScore(curAff);
    }

    const curRevCount = reviewCounts[currentReviewerId] || 0;
    const candRevCount = reviewCounts[candidate.id] || 0;
    const workloadImprovement = (curRevCount - candRevCount) * 5;

    if (scoreDelta + workloadImprovement > 0) {
      currentMembers[mIdx] = candidate.id;
      reviewCounts[currentReviewerId] = Math.max(0, curRevCount - 1);
      reviewCounts[candidate.id] = candRevCount + 1;
    }
  }

  // PASS 3: STRICT RECIPROCITY & PARTICIPATION GUARANTEE:
  // Ensure 100% of employees are assigned to review peers in other groups.
  // No employee is left with 0 reviews; workload stays tightly balanced near targetSize.
  if (total > targetSize) {
    const minReviewsTarget = Math.max(1, Math.min(targetSize, Math.floor(targetSize * 0.75)));

    // Deficit resolution pass: swap under-assigned people into groups with high-review members
    let deficitAttempts = 0;
    while (deficitAttempts < 700) {
      deficitAttempts++;
      const underAssigned = people.filter((p) => (reviewCounts[p.id] || 0) < minReviewsTarget);
      if (underAssigned.length === 0) break;

      underAssigned.sort((a, b) => (reviewCounts[a.id] || 0) - (reviewCounts[b.id] || 0));
      const underPerson = underAssigned[0];
      const uCount = reviewCounts[underPerson.id] || 0;

      // Find an eligible group where underPerson is not the reviewee and not already a member,
      // and if reviewee r is a non-supervisor, underPerson must belong to the same facility;
      // also regional facility supervisors may only review their own branch.
      const eligibleReviewees = shuffledReviewees.filter((r) => {
        if (r.id === underPerson.id || groupMembersMap[r.id].includes(underPerson.id)) return false;
        if (!canReviewerEvaluate(underPerson, r)) return false;
        return true;
      });

      if (eligibleReviewees.length === 0) break;

      let bestSwap: { revieweeId: string; memberToReplaceId: string; score: number } | null = null;

      for (const r of eligibleReviewees) {
        const rAnnex = findMatchingAnnexARule(r.role, r.department);
        const members = groupMembersMap[r.id];
        const designatedSupId = mandatorySupervisorMap[r.id]?.supervisorPerson.id;

        for (const mId of members) {
          if (mId === designatedSupId) continue; // NEVER swap out designated mandatory supervisor!
          const mCount = reviewCounts[mId] || 0;
          if (mCount > uCount + 1) {
            const memberPerson = peopleMap.get(mId);
            if (!memberPerson) continue;

            // If r has an Annex A rule and this member satisfies a specific slot that underPerson does not, avoid breaking it
            let annexProtectionPenalty = 0;
            if (rAnnex) {
              const mScore = rAnnex.requirements.reduce((max, req) => Math.max(max, req.matchScore(memberPerson, r)), 0);
              const uScore = rAnnex.requirements.reduce((max, req) => Math.max(max, req.matchScore(underPerson, r)), 0);
              if (mScore > 0 && uScore === 0) {
                annexProtectionPenalty = 20;
              }
            }

            const curAff = getAffinityType(r.department, memberPerson.department, clusters);
            const newAff = getAffinityType(r.department, underPerson.department, clusters);
            const affDiff =
              (newAff === 'same_dept' ? 2 : newAff === 'close_cluster' ? 1 : 0) -
              (curAff === 'same_dept' ? 2 : curAff === 'close_cluster' ? 1 : 0);

            const score = (mCount - uCount) * 10 + affDiff - annexProtectionPenalty;
            if (!bestSwap || score > bestSwap.score) {
              bestSwap = { revieweeId: r.id, memberToReplaceId: mId, score };
            }
          }
        }
      }

      if (bestSwap) {
        const members = groupMembersMap[bestSwap.revieweeId];
        const idx = members.indexOf(bestSwap.memberToReplaceId);
        if (idx !== -1) {
          members[idx] = underPerson.id;
          reviewCounts[bestSwap.memberToReplaceId] = Math.max(0, (reviewCounts[bestSwap.memberToReplaceId] || 0) - 1);
          reviewCounts[underPerson.id] = uCount + 1;
        }
      } else {
        break;
      }
    }

    // Workload smoothing pass: balance reviews so max - min <= 3
    for (let s = 0; s < 500; s++) {
      let minP = people[0];
      let maxP = people[0];
      let minC = reviewCounts[minP.id] || 0;
      let maxC = reviewCounts[maxP.id] || 0;

      for (const p of people) {
        const c = reviewCounts[p.id] || 0;
        if (c < minC) {
          minC = c;
          minP = p;
        }
        if (c > maxC) {
          maxC = c;
          maxP = p;
        }
      }

      if (maxC - minC <= 3) break;

      const groupToSwap = shuffledReviewees.find(
        (r) =>
          r.id !== minP.id &&
          groupMembersMap[r.id].includes(maxP.id) &&
          !groupMembersMap[r.id].includes(minP.id) &&
          mandatorySupervisorMap[r.id]?.supervisorPerson.id !== maxP.id &&
          canReviewerEvaluate(minP, r) // enforce facility restriction on incoming reviewer
      );

      if (groupToSwap) {
        const members = groupMembersMap[groupToSwap.id];
        const idx = members.indexOf(maxP.id);
        if (idx !== -1) {
          members[idx] = minP.id;
          reviewCounts[maxP.id]--;
          reviewCounts[minP.id]++;
        }
      } else {
        break;
      }
    }
  }

  // Construct AllocatedGroup records for EVERY person in the roster (1 group per employee being reviewed)
  const revieweeToGroupMap: Record<string, string> = {};
  const memberReviewAssignmentsMap: Record<string, string[]> = {};
  people.forEach((p) => {
    memberReviewAssignmentsMap[p.id] = [];
  });

  const groups: AllocatedGroup[] = people.map((reviewee, idx) => {
    const groupId = `group-${idx + 1}`;
    const rawMembers = groupMembersMap[reviewee.id] || [];
    const supInfo = mandatorySupervisorMap[reviewee.id];

    // Sort reviewers by department then name for clean scanning in the UI
    const sortedMemberPeople = rawMembers
      .map((id) => peopleMap.get(id))
      .filter(Boolean) as Person[];

    sortedMemberPeople.sort((a, b) => {
      // Prioritize same department as reviewee first
      const affA = a.department === reviewee.department ? 0 : 1;
      const affB = b.department === reviewee.department ? 0 : 1;
      if (affA !== affB) return affA - affB;
      if (a.department !== b.department) return a.department.localeCompare(b.department);
      return a.name.localeCompare(b.name);
    });

    let finalMemberIds: string[] = [];
    if (supInfo && rawMembers.includes(supInfo.supervisorPerson.id)) {
      const otherPeers = sortedMemberPeople.filter((p) => p.id !== supInfo.supervisorPerson.id);
      finalMemberIds = [supInfo.supervisorPerson.id, ...otherPeers.map((p) => p.id)];
    } else {
      finalMemberIds = sortedMemberPeople.map((p) => p.id);
    }

    revieweeToGroupMap[reviewee.id] = groupId;
    finalMemberIds.forEach((revId) => {
      if (!memberReviewAssignmentsMap[revId]) {
        memberReviewAssignmentsMap[revId] = [];
      }
      memberReviewAssignmentsMap[revId].push(groupId);
    });

    const cluster = getClusterForDepartment(reviewee.department, clusters);

    return {
      id: groupId,
      number: idx + 1,
      name: `Review Panel #${idx + 1}`,
      revieweeId: reviewee.id,
      primaryDepartment: reviewee.department,
      clusterId: cluster?.id || 'cluster-general',
      memberIds: finalMemberIds,
      leadId: finalMemberIds[0],
      designatedSupervisorId: supInfo?.supervisorPerson.id,
      designatedSupervisorName: supInfo?.supervisorPerson.name,
      designatedSupervisorRole: supInfo?.result.supervisorRole,
      designatedSupervisorReason: supInfo?.result.reason,
    };
  });

  // Calculate statistics across all review pairs (Reviewer -> Employee Being Reviewed)
  let sameDeptPairs = 0;
  let closeClusterPairs = 0;
  let crossDeptPairs = 0;
  let totalReviewPairs = 0;

  for (const group of groups) {
    const reviewee = peopleMap.get(group.revieweeId);
    if (!reviewee) continue;

    for (const mId of group.memberIds) {
      const reviewer = peopleMap.get(mId);
      if (!reviewer) continue;

      totalReviewPairs++;
      const aff = getAffinityType(reviewee.department, reviewer.department, clusters);
      if (aff === 'same_dept') {
        sameDeptPairs++;
      } else if (aff === 'close_cluster') {
        closeClusterPairs++;
      } else {
        crossDeptPairs++;
      }
    }
  }

  const groupSizes = groups.map((g) => g.memberIds.length);
  const minGroupSize = groupSizes.length > 0 ? Math.min(...groupSizes) : 0;
  const maxGroupSize = groupSizes.length > 0 ? Math.max(...groupSizes) : 0;
  const avgGroupSize = groupSizes.length > 0 ? totalReviewPairs / groups.length : 0;
  const avgReviewsPerPerson = total > 0 ? totalReviewPairs / total : 0;

  // Reviewer counts per person
  const allReviewCounts = people.map((p) => memberReviewAssignmentsMap[p.id]?.length || 0);
  const minReviewsPerPerson = allReviewCounts.length > 0 ? Math.min(...allReviewCounts) : 0;
  const maxReviewsPerPerson = allReviewCounts.length > 0 ? Math.max(...allReviewCounts) : 0;
  const peopleWithZeroReviews = allReviewCounts.filter((c) => c === 0).length;

  // Annex A compliance calculations across all groups
  let annexARolesCount = 0;
  let annexACompliantCount = 0;
  let totalAnnexAComplianceScore = 0;

  for (const group of groups) {
    const reviewee = peopleMap.get(group.revieweeId);
    if (!reviewee) continue;
    const rule = findMatchingAnnexARule(reviewee.role, reviewee.department);
    if (rule) {
      annexARolesCount++;
      const panelMembers = group.memberIds.map((id) => peopleMap.get(id)).filter(Boolean) as Person[];
      const compliance = evaluatePanelCompliance(reviewee, panelMembers, rule);
      totalAnnexAComplianceScore += compliance.complianceRate;
      if (compliance.complianceRate >= 85) {
        annexACompliantCount++;
      }
    }
  }

  const avgAnnexACompliance =
    annexARolesCount > 0 ? Math.round(totalAnnexAComplianceScore / annexARolesCount) : 0;

  const stats: AllocationStats = {
    totalPeople: total,
    groupCount: groups.length,
    avgGroupSize: Number(avgGroupSize.toFixed(1)),
    minGroupSize,
    maxGroupSize,
    avgReviewsPerPerson: Number(avgReviewsPerPerson.toFixed(1)),
    minReviewsPerPerson,
    maxReviewsPerPerson,
    peopleWithZeroReviews,
    sameDeptPercent: totalReviewPairs > 0 ? Math.round((sameDeptPairs / totalReviewPairs) * 100) : 0,
    closeClusterPercent: totalReviewPairs > 0 ? Math.round((closeClusterPairs / totalReviewPairs) * 100) : 0,
    crossDeptPercent: totalReviewPairs > 0 ? Math.round((crossDeptPairs / totalReviewPairs) * 100) : 0,
    annexARolesCount,
    annexACompliantCount,
    avgAnnexACompliance,
  };

  return {
    groups,
    revieweeToGroupMap,
    memberReviewAssignmentsMap,
    memberToGroupMap: revieweeToGroupMap,
    stats,
  };
}
