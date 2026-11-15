export type FacilityLocation =
  | 'Kampala'
  | 'Mbarara'
  | 'Jinja'
  | 'Gulu'
  | 'Mbale'
  | 'Arua'
  | 'Fort Portal';

export const ALL_FACILITIES: FacilityLocation[] = [
  'Kampala',
  'Mbarara',
  'Jinja',
  'Gulu',
  'Mbale',
  'Arua',
  'Fort Portal',
];

export interface Person {
  id: string;
  name: string;
  department: string;
  role: string;
  email: string;
  facility?: FacilityLocation;
  isSupervisor?: boolean;
}

export const isPersonSupervisor = (p: Person): boolean => {
  if (typeof p.isSupervisor === 'boolean') return p.isSupervisor;
  const roleLower = (p.role || '').toLowerCase();
  return (
    roleLower.includes('manager') ||
    roleLower.includes('supervisor') ||
    roleLower.includes('lead') ||
    roleLower.includes('coordinator') ||
    roleLower.includes('head') ||
    roleLower.includes('controller') ||
    roleLower.includes('director')
  );
};

export const getPersonFacility = (p: Person): FacilityLocation => {
  return p.facility || 'Kampala';
};


export interface DepartmentCluster {
  id: string;
  name: string;
  color: string;
  departments: string[];
}

export interface AllocatedGroup {
  id: string;
  number: number;
  name: string;
  revieweeId: string;
  primaryDepartment: string;
  clusterId: string;
  memberIds: string[];
  leadId?: string;
  designatedSupervisorId?: string;
  designatedSupervisorName?: string;
  designatedSupervisorRole?: string;
  designatedSupervisorReason?: string;
}

export interface AllocationStats {
  totalPeople: number;
  groupCount: number;
  avgGroupSize: number;
  minGroupSize: number;
  maxGroupSize: number;
  avgReviewsPerPerson: number;
  minReviewsPerPerson: number;
  maxReviewsPerPerson: number;
  peopleWithZeroReviews: number;
  sameDeptPercent: number;
  closeClusterPercent: number;
  crossDeptPercent: number;
  annexARolesCount?: number;
  annexACompliantCount?: number;
  avgAnnexACompliance?: number;
}

export interface GroupingConfig {
  targetGroupSize: number;
  minGroupSize: number;
  maxGroupSize: number;
  sameDeptWeight: number;
  randomSeed: number;
}

// ── Legacy criterion type (kept for rubric editor / seed compat) ─────────────
export interface AppraisalCriterion {
  id: string;
  category: string;
  title: string;
  description: string;
  anchors: {
    1: string;
    2: string;
    3: string;
    4: string;
    5: string;
  };
}

// ── New 1-10 performance rating item ─────────────────────────────────────────
export type RelationshipType = 'Manager / Supervisor' | 'Peer / Colleague' | 'Direct Report';

export interface PerformanceRatingItem {
  /** e.g. "time-keeping" */
  id: string;
  /** e.g. "Time Keeping (Punctuality)" */
  title: string;
  /** Section label shown as a sub-header, e.g. "SECTION B" */
  section?: string;
  /** Multi-line guidance shown beneath the title */
  description: string;
  /** Left-end label for the scale, e.g. "Always late" */
  lowLabel: string;
  /** Right-end label, e.g. "Always on time" */
  highLabel: string;
  /** Whether this item is only shown when evaluating a supervisor */
  supervisorOnly?: boolean;
  /** Free-text comment is optional by default; set true to make it required */
  commentRequired?: boolean;
}

// ── Submission shape ──────────────────────────────────────────────────────────
export interface AppraisalFeedback {
  /** legacy compat */
  strengths: string;
  improvements: string;
  specificObservation: string;
}

export interface AppraisalSubmission {
  id: string;
  reviewerId: string;
  revieweeId: string;
  groupId: string;
  isSelfAppraisal?: boolean;

  // Section A — demographics (captured inside the form)
  relationship?: RelationshipType;

  // Section B — 1-10 ratings keyed by PerformanceRatingItem.id
  ratings: Record<string, number>;
  // comments per rating item, keyed by PerformanceRatingItem.id
  ratingComments: Record<string, string>;

  // Section C — key achievements
  keyAchievements: string;

  // Section D — final comment
  finalComment: string;

  // Legacy feedback block (kept for backwards compat with seeded data)
  feedback: AppraisalFeedback;

  status: 'draft' | 'submitted';
  updatedAt: string;
  submittedAt?: string;
  annexRuleTitle?: string;
  annexSlotName?: string;
}

export type AppMode = 'admin' | 'portal';

export type UserSession =
  | { type: 'admin'; username: string }
  | { type: 'employee'; person: Person };
