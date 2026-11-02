import { AppraisalSubmission, Person, AllocatedGroup } from '../types';
import { APPRAISAL_CRITERIA } from '../data/appraisalRubric';

const STORAGE_KEY = 'smartgroup_appraisal_submissions_v1';

export function loadAppraisalsFromStorage(): Record<string, AppraisalSubmission> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse appraisal submissions from storage', e);
    return {};
  }
}

export function saveAppraisalsToStorage(submissions: Record<string, AppraisalSubmission>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(submissions));
  } catch (e) {
    console.error('Failed to save appraisal submissions to storage', e);
  }
}

export function getAppraisalKey(reviewerId: string, revieweeId: string): string {
  return `${reviewerId}__${revieweeId}`;
}

export function getAppraisalSubmission(
  submissions: Record<string, AppraisalSubmission>,
  reviewerId: string,
  revieweeId: string
): AppraisalSubmission | undefined {
  return submissions[getAppraisalKey(reviewerId, revieweeId)];
}

export function calculateAverageRating(ratings: Record<string, number>): number {
  const values = Object.values(ratings).filter((v) => typeof v === 'number' && v > 0);
  if (values.length === 0) return 0;
  const sum = values.reduce((acc, curr) => acc + curr, 0);
  return Number((sum / values.length).toFixed(1));
}

/**
 * Seed realistic mock appraisals for demonstration and testing of the HR tracking interface
 */
export function seedRealisticAppraisals(
  people: Person[],
  groups: AllocatedGroup[],
  count: number = 60
): Record<string, AppraisalSubmission> {
  const current = loadAppraisalsFromStorage();
  const updated: Record<string, AppraisalSubmission> = { ...current };

  const sampleStrengths = [
    'Outstanding work ethic and meticulous attention to detail during peak operational shifts.',
    'Consistently proactive in unblocking cross-departmental bottlenecks between Operations and IT.',
    'Exceptional communicator who remains calm and reassuring even during high-stress audits.',
    'Very dependable with equipment and adheres strictly to safety and facility security SOPs.',
    'Always punctual, responsive on radio/mobile, and willing to mentor junior team members.',
    'Provides thorough and accurate documentation that makes audit trails seamless.',
  ];

  const sampleImprovements = [
    'Could provide earlier advance notice when unexpected equipment downtime or delays occur.',
    'Encouraged to speak up more in joint inter-departmental briefings with senior managers.',
    'Recommend further cross-training on automated digital inventory and reporting tools.',
    'Can delegate minor routine tasks more readily to maintain focus on strategic items.',
  ];

  const sampleObservations = [
    'From our departmental perspective, coordination has improved markedly over the last quarter.',
    'Smooth handover during shift changeover; consistently accurate logbook entries.',
    'Constructive partner in resolving field escalations swiftly.',
  ];

  let added = 0;
  const now = new Date();

  // Iterate over groups and their reviewers
  for (const group of groups) {
    if (added >= count) break;
    const reviewee = people.find((p) => p.id === group.revieweeId);
    if (!reviewee) continue;

    for (const reviewerId of group.memberIds) {
      if (added >= count) break;
      const key = getAppraisalKey(reviewerId, group.revieweeId);
      if (updated[key]) continue; // don't overwrite existing

      const isSubmitted = Math.random() > 0.15; // 85% submitted, 15% draft
      const baseRating = 3 + Math.floor(Math.random() * 3); // 3, 4, or 5

      const ratings: Record<string, number> = {};
      for (const crit of APPRAISAL_CRITERIA) {
        // slight jitter
        const jitter = Math.random() > 0.7 ? (Math.random() > 0.5 ? 1 : -1) : 0;
        ratings[crit.id] = Math.max(1, Math.min(5, baseRating + jitter));
      }

      const submissionDate = new Date(now.getTime() - Math.random() * 7 * 86400000);

      updated[key] = {
        id: key,
        reviewerId,
        revieweeId: group.revieweeId,
        groupId: group.id,
        isSelfAppraisal: false,
        ratings,
        feedback: {
          strengths: sampleStrengths[Math.floor(Math.random() * sampleStrengths.length)],
          improvements: sampleImprovements[Math.floor(Math.random() * sampleImprovements.length)],
          specificObservation: sampleObservations[Math.floor(Math.random() * sampleObservations.length)],
        },
        status: isSubmitted ? 'submitted' : 'draft',
        updatedAt: submissionDate.toISOString(),
        submittedAt: isSubmitted ? submissionDate.toISOString() : undefined,
      };

      added++;
    }
  }

  saveAppraisalsToStorage(updated);
  return updated;
}
