import { AppraisalSubmission, Person, AllocatedGroup } from '../types';
import { loadPerformanceRatings } from '../data/performanceRatings';
import { supabase, supabaseConfigured } from '../supabaseClient';

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

export async function upsertAppraisalToSupabase(submission: AppraisalSubmission): Promise<void> {
  if (!supabaseConfigured) return; // silently skip if not configured
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
          relationship: submission.relationship ?? null,
          ratings: submission.ratings,
          rating_comments: submission.ratingComments ?? {},
          key_achievements: submission.keyAchievements ?? '',
          final_comment: submission.finalComment ?? '',
          feedback_strengths: submission.feedback?.strengths ?? '',
          feedback_improvements: submission.feedback?.improvements ?? '',
          feedback_specific_observation: submission.feedback?.specificObservation ?? '',
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

export async function syncAppraisalsFromSupabase(): Promise<Record<string, AppraisalSubmission>> {
  if (!supabaseConfigured) return loadAppraisalsFromStorage(); // fall back to local
  try {
    const { data, error } = await supabase
      .from('appraisals')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Supabase load error:', error.message);
      return loadAppraisalsFromStorage();
    }

    if (!data || data.length === 0) return loadAppraisalsFromStorage();

    const fromCloud: Record<string, AppraisalSubmission> = {};
    for (const row of data) {
      const submission: AppraisalSubmission = {
        id: row.id,
        reviewerId: row.reviewer_id,
        revieweeId: row.reviewee_id,
        groupId: row.group_id,
        isSelfAppraisal: row.is_self_appraisal ?? false,
        relationship: row.relationship ?? undefined,
        ratings: row.ratings ?? {},
        ratingComments: row.rating_comments ?? {},
        keyAchievements: row.key_achievements ?? '',
        finalComment: row.final_comment ?? '',
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

    const local = loadAppraisalsFromStorage();
    const merged = { ...local, ...fromCloud };
    saveAppraisalsToStorage(merged);
    return merged;
  } catch (err) {
    console.error('Unexpected error syncing from Supabase:', err);
    return loadAppraisalsFromStorage();
  }
}

// ─── Mock seed (demo data) ───────────────────────────────────────────────────

export function seedRealisticAppraisals(
  people: Person[],
  groups: AllocatedGroup[],
  count: number = 60
): Record<string, AppraisalSubmission> {
  const current = loadAppraisalsFromStorage();
  const updated: Record<string, AppraisalSubmission> = { ...current };

  const perfItems = loadPerformanceRatings();

  const sampleAchievements = [
    'Reduced errors at the verification desk from 10% to 2%. Trained 3 new staff on the intake process. Received positive client feedback in August.',
    'Maintained good performance throughout the period. Led queue management during the peak month of October.',
    'No major achievement noted. Maintained consistent performance and attendance standards.',
    'Received zero customer complaints this quarter. Assisted in onboarding 5 new colleagues and cross-trained in two departments.',
    'Led the team during supervisor absence without disruption. Received commendation from department head for handling the annual audit.',
  ];

  const sampleFinalComments = [
    'Recommend for consideration in the next leadership programme. Consistently goes above and beyond.',
    'Needs coaching on time management and communication with external clients.',
    'No specific recommendation at this time. Good overall contributor.',
    'Suggest pairing with a senior colleague for mentorship to accelerate growth.',
    '',
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
      const baseRating = 5 + Math.floor(Math.random() * 5); // 5-9 on 1-10 scale

      const ratings: Record<string, number> = {};
      for (const item of perfItems) {
        const jitter = Math.random() > 0.6 ? (Math.random() > 0.5 ? 1 : -1) : 0;
        ratings[item.id] = Math.max(1, Math.min(10, baseRating + jitter));
      }

      const ratingComments: Record<string, string> = {};
      // Add a comment for about 60% of items
      for (const item of perfItems) {
        if (Math.random() > 0.4) {
          ratingComments[item.id] = '';
        }
      }

      const achievements = sampleAchievements[Math.floor(Math.random() * sampleAchievements.length)];
      const finalComment = sampleFinalComments[Math.floor(Math.random() * sampleFinalComments.length)];
      const submissionDate = new Date(now.getTime() - Math.random() * 7 * 86400000);

      const relationships = ['Manager / Supervisor', 'Peer / Colleague', 'Direct Report'] as const;

      updated[key] = {
        id: key,
        reviewerId,
        revieweeId: group.revieweeId,
        groupId: group.id,
        isSelfAppraisal: false,
        relationship: relationships[Math.floor(Math.random() * relationships.length)],
        ratings,
        ratingComments,
        keyAchievements: achievements,
        finalComment,
        feedback: {
          strengths: achievements,
          improvements: finalComment,
          specificObservation: '',
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
