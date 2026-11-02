import { AppraisalCriterion } from '../types';

export const APPRAISAL_CRITERIA: AppraisalCriterion[] = [
  {
    id: 'crit-exec',
    category: 'Core Execution',
    title: 'Job Competence & Execution Quality',
    description:
      'Performs core responsibilities with precision, respects operational SOPs, meets delivery deadlines, and maintains high standards of output.',
    anchors: {
      1: 'Unsatisfactory - Frequent errors, struggles with basic SOPs',
      2: 'Developing - Needs supervision, occasionally misses deadlines',
      3: 'Proficient - Consistently delivers reliable, quality work independently',
      4: 'Exceeds - High velocity, anticipates workflow bottlenecks',
      5: 'Exceptional - Gold standard of execution, sets benchmarks for organization',
    },
  },
  {
    id: 'crit-collab',
    category: 'Inter-Departmental Impact',
    title: 'Cross-Functional Collaboration & Teamwork',
    description:
      'Coordinates constructively with other units (e.g. Operations, USPC, QA, Facilities, IT), actively assists colleagues, and breaks down departmental friction.',
    anchors: {
      1: 'Unsatisfactory - Siloed, uncooperative, creates friction across units',
      2: 'Developing - Reluctant to support outside immediate team scope',
      3: 'Proficient - Collaborative, supportive partner across departments',
      4: 'Exceeds - Bridges gaps proactively, unblocks cross-team issues',
      5: 'Exceptional - Role model for organizational unity and peer empowerment',
    },
  },
  {
    id: 'crit-comm',
    category: 'Communication',
    title: 'Communication, Listening & Responsiveness',
    description:
      'Communicates clearly, answers operational requests promptly, handles peer feedback maturely, and provides transparent status updates.',
    anchors: {
      1: 'Unsatisfactory - Unresponsive, vague, or defensive under feedback',
      2: 'Developing - Inconsistent communications or delayed handoffs',
      3: 'Proficient - Clear, concise, respectful, and prompt in coordination',
      4: 'Exceeds - Articulate, proactive in status reporting and alignment',
      5: 'Exceptional - Master communicator, inspires trust across all ranks',
    },
  },
  {
    id: 'crit-integrity',
    category: 'Operational Discipline',
    title: 'Integrity, Security & Punctuality',
    description:
      'Demonstrates honesty, adheres to company ethics, respects physical/data security protocols, and maintains punctuality and attendance.',
    anchors: {
      1: 'Unsatisfactory - Disregards security/attendance rules, erratic reliability',
      2: 'Developing - Occasional lapses in protocol adherence or punctuality',
      3: 'Proficient - Dependable, trustworthy, and fully compliant with regulations',
      4: 'Exceeds - Highly disciplined, vigilant about safety and compliance',
      5: 'Exceptional - Absolute ethical benchmark, champions organizational security',
    },
  },
  {
    id: 'crit-problem',
    category: 'Initiative',
    title: 'Problem Solving & Operational Initiative',
    description:
      'Remains composed under operational pressure, identifies root causes of delays, and proposes practical solutions to enhance efficiency.',
    anchors: {
      1: 'Unsatisfactory - Passively waits for orders, overwhelmed by hiccups',
      2: 'Developing - Identifies issues but rarely suggests practical remedies',
      3: 'Proficient - Resolves day-to-day problems pragmatically and calmly',
      4: 'Exceeds - Solves complex escalations, streamlines procedures',
      5: 'Exceptional - Visionary troubleshooter, turns challenges into systemic gains',
    },
  },
];
