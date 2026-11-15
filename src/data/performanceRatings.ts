import { PerformanceRatingItem } from '../types';

const PERF_RATINGS_KEY = 'appraisal_performance_ratings_v1';
const SUPERVISOR_RATINGS_KEY = 'appraisal_supervisor_ratings_v1';

// ── Standard ratings (shown for every reviewee) ───────────────────────────────

export const DEFAULT_PERFORMANCE_RATINGS: PerformanceRatingItem[] = [
  {
    id: 'time-keeping',
    title: 'Time Keeping (Punctuality)',
    section: 'SECTION B: PERFORMANCE RATINGS',
    description: 'Does he/she report for work and meetings on time?',
    lowLabel: 'Always late',
    highLabel: 'Always on time',
    supervisorOnly: false,
  },
  {
    id: 'attendance',
    title: 'Attendance',
    description: 'Is he/she present at work and does he/she inform when absent?',
    lowLabel: 'Often absent',
    highLabel: 'Very reliable',
    supervisorOnly: false,
  },
  {
    id: 'teamwork',
    title: 'Teamwork',
    description: 'Does he/she help colleagues, share information and respect others?',
    lowLabel: 'Does not work well with others',
    highLabel: 'Excellent team player',
    supervisorOnly: false,
  },
  {
    id: 'customer-care-internal',
    title: 'Customer Care – Internal (Fellow Staff)',
    description: 'How does he/she treat fellow staff?',
    lowLabel: 'Rude / Not helpful',
    highLabel: 'Very helpful',
    supervisorOnly: false,
  },
  {
    id: 'customer-care-external',
    title: 'Customer Care – External (Clients)',
    description: 'How does he/she treat external clients?',
    lowLabel: 'Rude / Not helpful',
    highLabel: 'Very helpful',
    supervisorOnly: false,
  },
  {
    id: 'professionalism',
    title: 'Professionalism & Discipline',
    description:
      'Does he/she follow company rules, dress well and stay calm under pressure?',
    lowLabel: 'Unprofessional',
    highLabel: 'Role model',
    supervisorOnly: false,
  },
];

// ── Supervisor-only ratings (shown only when reviewee is a supervisor/manager) ─

export const DEFAULT_SUPERVISOR_RATINGS: PerformanceRatingItem[] = [
  {
    id: 'sup-leadership',
    title: 'Leadership & Direction',
    section: 'SECTION B2: SUPERVISOR-SPECIFIC RATINGS',
    description:
      'Does this supervisor set clear goals, give proper direction and inspire the team?',
    lowLabel: 'Poor leadership',
    highLabel: 'Exceptional leader',
    supervisorOnly: true,
  },
  {
    id: 'sup-delegation',
    title: 'Delegation & Task Management',
    description:
      'Does he/she assign tasks fairly and follow up to ensure completion?',
    lowLabel: 'Poor delegation',
    highLabel: 'Excellent delegator',
    supervisorOnly: true,
  },
  {
    id: 'sup-feedback',
    title: 'Staff Development & Feedback',
    description:
      'Does he/she provide constructive feedback, mentor staff and support their growth?',
    lowLabel: 'No coaching given',
    highLabel: 'Outstanding mentor',
    supervisorOnly: true,
  },
  {
    id: 'sup-decision',
    title: 'Decision Making Under Pressure',
    description:
      'Does he/she make sound decisions quickly when faced with operational challenges?',
    lowLabel: 'Poor decision-making',
    highLabel: 'Excellent under pressure',
    supervisorOnly: true,
  },
  {
    id: 'sup-fairness',
    title: 'Fairness & Impartiality',
    description:
      'Does he/she treat all team members fairly, without favouritism or bias?',
    lowLabel: 'Perceived bias / unfair',
    highLabel: 'Completely fair and consistent',
    supervisorOnly: true,
  },
];

// ── Persistence helpers ───────────────────────────────────────────────────────

export function loadPerformanceRatings(): PerformanceRatingItem[] {
  try {
    const raw = localStorage.getItem(PERF_RATINGS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as PerformanceRatingItem[];
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch { /* ignore */ }
  return DEFAULT_PERFORMANCE_RATINGS;
}

export function savePerformanceRatings(items: PerformanceRatingItem[]): void {
  localStorage.setItem(PERF_RATINGS_KEY, JSON.stringify(items));
}

export function resetPerformanceRatings(): void {
  localStorage.removeItem(PERF_RATINGS_KEY);
}

export function loadSupervisorRatings(): PerformanceRatingItem[] {
  try {
    const raw = localStorage.getItem(SUPERVISOR_RATINGS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as PerformanceRatingItem[];
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch { /* ignore */ }
  return DEFAULT_SUPERVISOR_RATINGS;
}

export function saveSupervisorRatings(items: PerformanceRatingItem[]): void {
  localStorage.setItem(SUPERVISOR_RATINGS_KEY, JSON.stringify(items));
}

export function resetSupervisorRatings(): void {
  localStorage.removeItem(SUPERVISOR_RATINGS_KEY);
}
