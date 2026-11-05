import { APPRAISAL_CRITERIA } from '../data/appraisalRubric';
import { supabase } from '../supabaseClient';

const STORAGE_KEY = 'smartgroup_appraisal_submissions_v1';

// ─── Local Storage (fast cache) ─────────────────────────────────────────────

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

// ─── Supabase sync ───────────────────────────────────────────────────────────

/**
 * Upsert a single submission to Supabase.
 * Works for both drafts and final submissions — uses upsert so re-saving
 * a draft doesn't create duplicates.
 */
export async function upsertAppraisalToSupabase(submission: AppraisalSubmission): Promise<void> {
  const { error } = await supabase
    .from('appraisals')
    .upsert(
      [
        {
          id: submission.id,
          reviewer_id: submission.reviewerId,
          reviewee_id: submission.revieweeId,
          group_id: submission.groupId,
          is_self_appraisal: submission.isSelfAppraisal ?? false,
          ratings: submission.ratings,
          feedback_strengths: submission.feedback.strengths,
          feedback_improvements: submission.feedback.improvements,
          feedback_specific_observation: submission.feedback.specificObservation,
          status: submission.status,
          updated_at: submission.updatedAt,
          submitted_at: submission.submittedAt ?? null,
          annex_rule_title: submission.annexRuleTitle ?? null,
          annex_slot_name: submission.annexSlotName ?? null,
        },
      ],
      { onConflict: 'id' }
    );

  if (error) {
    console.error('Supabase upsert error:', error.message);
    throw error;
  }
}

/**
 * Load all submissions from Supabase and merge them into local storage.
 * Called once on app mount so the UI reflects any submissions made on
 * other devices or sessions.
 */
export async function syncAppraisalsFromSupabase(): Promise<Record<string, AppraisalSubmission>> {
  try {
    const { data, error } = await supabase
      .from('appraisals')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Supabase load error:', error.message);
      return loadAppraisalsFromStorage(); // fall back to local cache
    }

    if (!data || data.length === 0) return loadAppraisalsFromStorage();

    // Map Supabase rows back to AppraisalSubmission shape
    const fromCloud: Record<string, AppraisalSubmission> = {};
    for (const row of data) {
      const submission: AppraisalSubmission = {
        id: row.id,
        reviewerId: row.reviewer_id,
        revieweeId: row.reviewee_id,
        groupId: row.group_id,
        isSelfAppraisal: row.is_self_appraisal ?? false,
        ratings: row.ratings ?? {},
        feedback: {
          strengths: row.feedback_strengths ?? '',
          improvements: row.feedback_improvements ?? '',
          specificObservation: row.feedback_specific_observation ?? '',
        },
        status: row.status ?? 'draft',
        updatedAt: row.updated_at ?? new Date().toISOString(),
        submittedAt: row.submitted_at ?? undefined,
        annexRuleTitle: row.annex_rule_title ?? undefined,
        annexSlotName: row.annex_slot_name ?? undefined,
      };
      fromCloud[getAppraisalKey(row.reviewer_id, row.reviewee_id)] = submission;
    }

    // Merge: cloud wins over local cache for the same key
    const local = loadAppraisalsFromStorage();
    const merged = { ...local, ...fromCloud };
    saveAppraisalsToStorage(merged); // update local cache with latest cloud data
    return merged;
  } catch (err) {
    console.error('Unexpected error syncing from Supabase:', err);
    return loadAppraisalsFromStorage();
  }
}

// ─── Mock seed (demo data) ───────────────────────────────────────────────────

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

  for (const group of groups) {
    if (added >= count) break;
    const reviewee = people.find((p) => p.id === group.revieweeId);
    if (!reviewee) continue;

    for (const reviewerId of group.memberIds) {
      if (added >= count) break;
      const key = getAppraisalKey(reviewerId, group.revieweeId);
      if (updated[key]) continue;

      const isSubmitted = Math.random() > 0.15;
      const baseRating = 3 + Math.floor(Math.random() * 3);

      const ratings: Record<string, number> = {};
      for (const crit of APPRAISAL_CRITERIA) {
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
