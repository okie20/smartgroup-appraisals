import { Person } from '../types';

export interface AppraiserRequirement {
  id: string;
  label: string; // Display label from Annex A (e.g. "Customer Care rep (2)")
  targetCount: number; // e.g. 2
  roleOrDeptDescription: string;
  matchScore: (reviewer: Person, reviewee: Person) => number;
}

export interface AnnexARule {
  id: string;
  orderNumber: number;
  functionTitle: string; // e.g. "Communications Manager"
  department: string; // Primary department
  originalAppraisersText: string;
  requirements: AppraiserRequirement[];
  aliases: string[];
}

export interface PanelComplianceResult {
  rule: AnnexARule;
  totalRequired: number; // always 7
  matchedCount: number;
  complianceRate: number; // 0 - 100%
  isCompliant: boolean;
  slots: {
    requirementId: string;
    label: string;
    targetCount: number;
    assignedMembers: Person[];
    isFulfilled: boolean;
  }[];
}

// Helper match functions
const isSupervisorOrLeadership = (p: Person) =>
  /coordinator|manager|supervisor|head|lead|director/i.test(p.role);

const matchesDept = (p: Person, ...keywords: string[]) => {
  const text = `${p.department} ${p.role}`.toLowerCase();
  return keywords.some((k) => text.includes(k.toLowerCase()));
};

export const ANNEX_A_RULES: AnnexARule[] = [
  {
    id: 'annex-01',
    orderNumber: 1,
    functionTitle: 'Communications Manager',
    department: 'Communications & PR',
    originalAppraisersText:
      'Line supervisor; Customer Care rep (2); Call Centre rep; USPC rep; Security rep; Project Coordinator',
    aliases: ['communications manager', 'comm manager', 'head of communications', 'comms manager'],
    requirements: [
      {
        id: 'r1-1',
        label: 'Line Supervisor / Project Coordinator',
        targetCount: 1,
        roleOrDeptDescription: 'Project Coordinator or Executive Supervisor',
        matchScore: (rev) =>
          matchesDept(rev, 'Project Coordinator', 'Executive', 'Project Coordination') ? 10 : 0,
      },
      {
        id: 'r1-2',
        label: 'Customer Care rep (2)',
        targetCount: 2,
        roleOrDeptDescription: 'Customer Care Department representatives',
        matchScore: (rev) =>
          matchesDept(rev, 'Customer Care') && !matchesDept(rev, 'Call Centre') ? 8 : 0,
      },
      {
        id: 'r1-3',
        label: 'Call Centre rep',
        targetCount: 1,
        roleOrDeptDescription: 'Call Centre specialist or agent',
        matchScore: (rev) => matchesDept(rev, 'Call Centre') ? 8 : 0,
      },
      {
        id: 'r1-4',
        label: 'USPC rep',
        targetCount: 1,
        roleOrDeptDescription: 'USPC Liaison or Project Representative',
        matchScore: (rev) => matchesDept(rev, 'USPC') ? 8 : 0,
      },
      {
        id: 'r1-5',
        label: 'Security rep',
        targetCount: 1,
        roleOrDeptDescription: 'Security Coordinator or Security Officer',
        matchScore: (rev) => matchesDept(rev, 'Security') ? 8 : 0,
      },
      {
        id: 'r1-6',
        label: 'Project Coordinator',
        targetCount: 1,
        roleOrDeptDescription: 'Project Coordinator or PA to PC',
        matchScore: (rev) =>
          matchesDept(rev, 'Project Coordinator', 'PA to PC', 'Coordination') ? 8 : 0,
      },
    ],
  },
  {
    id: 'annex-02',
    orderNumber: 2,
    functionTitle: 'Customer Care Supervisor',
    department: 'Customer Care & Call Centre',
    originalAppraisersText:
      'Line supervisor; Facility Supervisors\' rep (2); Security rep; Call Centre rep; Customer Care rep; Reception rep',
    aliases: ['customer care supervisor', 'cc supervisor', 'customer service supervisor'],
    requirements: [
      {
        id: 'r2-1',
        label: 'Line Supervisor',
        targetCount: 1,
        roleOrDeptDescription: 'Operations or Executive Supervisor',
        matchScore: (rev) =>
          isSupervisorOrLeadership(rev) && !matchesDept(rev, 'Customer Care') ? 8 : 0,
      },
      {
        id: 'r2-2',
        label: 'Facility Supervisors\' rep (2)',
        targetCount: 2,
        roleOrDeptDescription: 'Facility Supervision Department representatives',
        matchScore: (rev) => matchesDept(rev, 'Facility') ? 8 : 0,
      },
      {
        id: 'r2-3',
        label: 'Security rep',
        targetCount: 1,
        roleOrDeptDescription: 'Security Department representative',
        matchScore: (rev) => matchesDept(rev, 'Security') ? 8 : 0,
      },
      {
        id: 'r2-4',
        label: 'Call Centre rep',
        targetCount: 1,
        roleOrDeptDescription: 'Call Centre representative',
        matchScore: (rev) => matchesDept(rev, 'Call Centre') ? 8 : 0,
      },
      {
        id: 'r2-5',
        label: 'Customer Care rep',
        targetCount: 1,
        roleOrDeptDescription: 'Customer Care peer representative',
        matchScore: (rev) =>
          matchesDept(rev, 'Customer Care') && !matchesDept(rev, 'Supervisor', 'Reception') ? 8 : 0,
      },
      {
        id: 'r2-6',
        label: 'Reception rep',
        targetCount: 1,
        roleOrDeptDescription: 'Reception / Front Desk representative',
        matchScore: (rev) => matchesDept(rev, 'Reception', 'Front Desk') ? 8 : 0,
      },
    ],
  },
  {
    id: 'annex-03',
    orderNumber: 3,
    functionTitle: 'Facility Supervisor',
    department: 'Facility Supervision',
    originalAppraisersText:
      'Supervisor; Facility Supervisor rep; operators (3); Customer Care; Technical team rep',
    aliases: ['facility supervisor', 'facility manager', 'site supervisor'],
    requirements: [
      {
        id: 'r3-1',
        label: 'Supervisor',
        targetCount: 1,
        roleOrDeptDescription: 'Field Operations Manager or Head of Operations',
        matchScore: (rev) =>
          matchesDept(rev, 'Operations Manager', 'Head of Operations', 'Project Coordinator') ? 10 : 0,
      },
      {
        id: 'r3-2',
        label: 'Facility Supervisor rep',
        targetCount: 1,
        roleOrDeptDescription: 'Colleague Facility Supervisor peer',
        matchScore: (rev) => matchesDept(rev, 'Facility Supervisor') ? 8 : 0,
      },
      {
        id: 'r3-3',
        label: 'Operators (3)',
        targetCount: 3,
        roleOrDeptDescription: 'Operations or Enrolment Operators supervised',
        matchScore: (rev) =>
          matchesDept(rev, 'Operator', 'Enrolment', 'Mobile Enrolment') ? 8 : 0,
      },
      {
        id: 'r3-4',
        label: 'Customer Care',
        targetCount: 1,
        roleOrDeptDescription: 'Customer Care representative',
        matchScore: (rev) => matchesDept(rev, 'Customer Care', 'Call Centre') ? 8 : 0,
      },
      {
        id: 'r3-5',
        label: 'Technical team rep',
        targetCount: 1,
        roleOrDeptDescription: 'Technical or IT Support representative',
        matchScore: (rev) => matchesDept(rev, 'Technical', 'IT', 'System Support') ? 8 : 0,
      },
    ],
  },
  {
    id: 'annex-04',
    orderNumber: 4,
    functionTitle: 'Field Operations Manager',
    department: 'Operations & Field Services',
    originalAppraisersText:
      'Line supervisor; Facility Supervisor rep (3); Customer Care rep; Quality Assurance rep; Admin rep',
    aliases: ['field operations manager', 'operations manager', 'field ops manager'],
    requirements: [
      {
        id: 'r4-1',
        label: 'Line supervisor',
        targetCount: 1,
        roleOrDeptDescription: 'Head of Operations or Project Coordinator',
        matchScore: (rev) =>
          matchesDept(rev, 'Head of Operations', 'Project Coordinator') ? 10 : 0,
      },
      {
        id: 'r4-2',
        label: 'Facility Supervisor rep (3)',
        targetCount: 3,
        roleOrDeptDescription: 'Facility Supervisors reporting to field ops',
        matchScore: (rev) => matchesDept(rev, 'Facility Supervisor') ? 8 : 0,
      },
      {
        id: 'r4-3',
        label: 'Customer Care rep',
        targetCount: 1,
        roleOrDeptDescription: 'Customer Care representative',
        matchScore: (rev) => matchesDept(rev, 'Customer Care') ? 8 : 0,
      },
      {
        id: 'r4-4',
        label: 'Quality Assurance rep',
        targetCount: 1,
        roleOrDeptDescription: 'Quality Assurance representative',
        matchScore: (rev) => matchesDept(rev, 'Quality Assurance', 'QA') ? 8 : 0,
      },
      {
        id: 'r4-5',
        label: 'Admin rep',
        targetCount: 1,
        roleOrDeptDescription: 'Project Admin or Administration team member',
        matchScore: (rev) => matchesDept(rev, 'Admin', 'Administration') ? 8 : 0,
      },
    ],
  },
  {
    id: 'annex-05',
    orderNumber: 5,
    functionTitle: 'Head of Operations',
    department: 'Operations & Field Services',
    originalAppraisersText:
      'Line supervisor; Team members supervised (3); Technical Team rep; Finance rep; USPC rep',
    aliases: ['head of operations', 'operations director', 'head operations'],
    requirements: [
      {
        id: 'r5-1',
        label: 'Line supervisor',
        targetCount: 1,
        roleOrDeptDescription: 'Project Coordinator',
        matchScore: (rev) => matchesDept(rev, 'Project Coordinator') ? 10 : 0,
      },
      {
        id: 'r5-2',
        label: 'Team members supervised (3)',
        targetCount: 3,
        roleOrDeptDescription: 'Field Operations / Mobile Enrolment staff supervised',
        matchScore: (rev) =>
          matchesDept(rev, 'Operations', 'Enrolment', 'Field') &&
          !matchesDept(rev, 'Head of Operations') ? 8 : 0,
      },
      {
        id: 'r5-3',
        label: 'Technical Team rep',
        targetCount: 1,
        roleOrDeptDescription: 'Technical Team or IT Coordinator',
        matchScore: (rev) => matchesDept(rev, 'Technical', 'IT') ? 8 : 0,
      },
      {
        id: 'r5-4',
        label: 'Finance rep',
        targetCount: 1,
        roleOrDeptDescription: 'Finance or Accounts representative',
        matchScore: (rev) => matchesDept(rev, 'Finance', 'Account') ? 8 : 0,
      },
      {
        id: 'r5-5',
        label: 'USPC rep',
        targetCount: 1,
        roleOrDeptDescription: 'USPC Liaison representative',
        matchScore: (rev) => matchesDept(rev, 'USPC') ? 8 : 0,
      },
    ],
  },
  {
    id: 'annex-06',
    orderNumber: 6,
    functionTitle: 'IT Coordinator',
    department: 'Technical & IT Support',
    originalAppraisersText:
      'Line supervisor; Technical Team reps (3); Production rep; Admin rep; Security rep',
    aliases: ['it coordinator', 'head of it', 'it manager', 'information technology coordinator'],
    requirements: [
      {
        id: 'r6-1',
        label: 'Line supervisor',
        targetCount: 1,
        roleOrDeptDescription: 'System Support Manager or Project Coordinator',
        matchScore: (rev) =>
          matchesDept(rev, 'Project Coordinator', 'Head of Operations') ? 10 : 0,
      },
      {
        id: 'r6-2',
        label: 'Technical Team reps (3)',
        targetCount: 3,
        roleOrDeptDescription: 'Technical Team members supervised',
        matchScore: (rev) =>
          matchesDept(rev, 'Technical', 'System Support', 'Network') &&
          !matchesDept(rev, 'IT Coordinator') ? 8 : 0,
      },
      {
        id: 'r6-3',
        label: 'Production rep',
        targetCount: 1,
        roleOrDeptDescription: 'Production / Hardware / Enrolment Systems rep',
        matchScore: (rev) => matchesDept(rev, 'Production', 'Stock') ? 8 : 0,
      },
      {
        id: 'r6-4',
        label: 'Admin rep',
        targetCount: 1,
        roleOrDeptDescription: 'Project Admin representative',
        matchScore: (rev) => matchesDept(rev, 'Admin') ? 8 : 0,
      },
      {
        id: 'r6-5',
        label: 'Security rep',
        targetCount: 1,
        roleOrDeptDescription: 'Security Coordinator or Security Officer',
        matchScore: (rev) => matchesDept(rev, 'Security') ? 8 : 0,
      },
    ],
  },
  {
    id: 'annex-07',
    orderNumber: 7,
    functionTitle: 'Mobile Enrolment',
    department: 'Operations & Field Services',
    originalAppraisersText:
      'Line supervisor; Operations reps (3); Technical Team rep; Quality Assurance rep; Customer Care rep',
    aliases: ['mobile enrolment', 'mobile enrollment officer', 'mobile enrolment lead', 'enrolment officer'],
    requirements: [
      {
        id: 'r7-1',
        label: 'Line supervisor',
        targetCount: 1,
        roleOrDeptDescription: 'Field Operations Manager or Head of Operations',
        matchScore: (rev) =>
          matchesDept(rev, 'Operations Manager', 'Head of Operations') ? 10 : 0,
      },
      {
        id: 'r7-2',
        label: 'Operations reps (3)',
        targetCount: 3,
        roleOrDeptDescription: 'Operations department colleagues / operators',
        matchScore: (rev) =>
          matchesDept(rev, 'Operations', 'Operator') &&
          !matchesDept(rev, 'Operations Manager') ? 8 : 0,
      },
      {
        id: 'r7-3',
        label: 'Technical Team rep',
        targetCount: 1,
        roleOrDeptDescription: 'Technical / IT support specialist',
        matchScore: (rev) => matchesDept(rev, 'Technical', 'IT', 'System Support') ? 8 : 0,
      },
      {
        id: 'r7-4',
        label: 'Quality Assurance rep',
        targetCount: 1,
        roleOrDeptDescription: 'Quality Assurance representative',
        matchScore: (rev) => matchesDept(rev, 'Quality Assurance', 'QA') ? 8 : 0,
      },
      {
        id: 'r7-5',
        label: 'Customer Care rep',
        targetCount: 1,
        roleOrDeptDescription: 'Customer Care representative',
        matchScore: (rev) => matchesDept(rev, 'Customer Care', 'Call Centre') ? 8 : 0,
      },
    ],
  },
  {
    id: 'annex-08',
    orderNumber: 8,
    functionTitle: 'PA to PC',
    department: 'Project Coordination & Support',
    originalAppraisersText:
      'Line supervisor; Head of Operations; Team member supervised; Accounts rep; USPC rep; Admin rep; Customer Care rep',
    aliases: ['pa to pc', 'personal assistant to project coordinator', 'pa to the project coordinator', 'assistant to pc'],
    requirements: [
      {
        id: 'r8-1',
        label: 'Line supervisor (Project Coordinator)',
        targetCount: 1,
        roleOrDeptDescription: 'Project Coordinator',
        matchScore: (rev) => matchesDept(rev, 'Project Coordinator') ? 10 : 0,
      },
      {
        id: 'r8-2',
        label: 'Head of Operations',
        targetCount: 1,
        roleOrDeptDescription: 'Head of Operations',
        matchScore: (rev) => matchesDept(rev, 'Head of Operations') ? 10 : 0,
      },
      {
        id: 'r8-3',
        label: 'Team member supervised / Driver',
        targetCount: 1,
        roleOrDeptDescription: 'Project Driver or Coordination assistant',
        matchScore: (rev) => matchesDept(rev, 'Driver', 'Coordination') ? 8 : 0,
      },
      {
        id: 'r8-4',
        label: 'Accounts rep',
        targetCount: 1,
        roleOrDeptDescription: 'Accounts or Finance representative',
        matchScore: (rev) => matchesDept(rev, 'Accounts', 'Finance') ? 8 : 0,
      },
      {
        id: 'r8-5',
        label: 'USPC rep',
        targetCount: 1,
        roleOrDeptDescription: 'USPC Liaison representative',
        matchScore: (rev) => matchesDept(rev, 'USPC') ? 8 : 0,
      },
      {
        id: 'r8-6',
        label: 'Admin rep',
        targetCount: 1,
        roleOrDeptDescription: 'Project Admin representative',
        matchScore: (rev) => matchesDept(rev, 'Admin') ? 8 : 0,
      },
      {
        id: 'r8-7',
        label: 'Customer Care rep',
        targetCount: 1,
        roleOrDeptDescription: 'Customer Care representative',
        matchScore: (rev) => matchesDept(rev, 'Customer Care') ? 8 : 0,
      },
    ],
  },
  {
    id: 'annex-09',
    orderNumber: 9,
    functionTitle: 'Project Accountant',
    department: 'Finance & Accounts',
    originalAppraisersText:
      'Line supervisor; Admin rep; Operations reps (3); USPC rep; Facility Supervisors\' rep',
    aliases: ['project accountant', 'accountant', 'head accountant', 'lead accountant'],
    requirements: [
      {
        id: 'r9-1',
        label: 'Line supervisor',
        targetCount: 1,
        roleOrDeptDescription: 'Project Coordinator / Financial Controller',
        matchScore: (rev) =>
          matchesDept(rev, 'Project Coordinator', 'Head of Operations') ? 10 : 0,
      },
      {
        id: 'r9-2',
        label: 'Admin rep',
        targetCount: 1,
        roleOrDeptDescription: 'Project Admin representative',
        matchScore: (rev) => matchesDept(rev, 'Admin') ? 8 : 0,
      },
      {
        id: 'r9-3',
        label: 'Operations reps (3)',
        targetCount: 3,
        roleOrDeptDescription: 'Operations department representatives',
        matchScore: (rev) => matchesDept(rev, 'Operations', 'Mobile Enrolment') ? 8 : 0,
      },
      {
        id: 'r9-4',
        label: 'USPC rep',
        targetCount: 1,
        roleOrDeptDescription: 'USPC representative',
        matchScore: (rev) => matchesDept(rev, 'USPC') ? 8 : 0,
      },
      {
        id: 'r9-5',
        label: 'Facility Supervisors\' rep',
        targetCount: 1,
        roleOrDeptDescription: 'Facility Supervisor representative',
        matchScore: (rev) => matchesDept(rev, 'Facility Supervisor') ? 8 : 0,
      },
    ],
  },
  {
    id: 'annex-10',
    orderNumber: 10,
    functionTitle: 'Project Admin',
    department: 'Administration & Stores',
    originalAppraisersText:
      'Line supervisor; Department members (2); Facility Supervisors\' rep; Technical Team rep; Operations reps (2)',
    aliases: ['project admin', 'project administrator', 'administrative officer', 'head of admin'],
    requirements: [
      {
        id: 'r10-1',
        label: 'Line supervisor',
        targetCount: 1,
        roleOrDeptDescription: 'Project Coordinator or Head of Operations',
        matchScore: (rev) =>
          matchesDept(rev, 'Project Coordinator', 'Head of Operations') ? 10 : 0,
      },
      {
        id: 'r10-2',
        label: 'Department members (2)',
        targetCount: 2,
        roleOrDeptDescription: 'Administration / Stores colleagues',
        matchScore: (rev) =>
          matchesDept(rev, 'Admin', 'Stores') && !matchesDept(rev, 'Project Admin') ? 8 : 0,
      },
      {
        id: 'r10-3',
        label: 'Facility Supervisors\' rep',
        targetCount: 1,
        roleOrDeptDescription: 'Facility Supervisor representative',
        matchScore: (rev) => matchesDept(rev, 'Facility Supervisor') ? 8 : 0,
      },
      {
        id: 'r10-4',
        label: 'Technical Team rep',
        targetCount: 1,
        roleOrDeptDescription: 'Technical Team representative',
        matchScore: (rev) => matchesDept(rev, 'Technical', 'IT') ? 8 : 0,
      },
      {
        id: 'r10-5',
        label: 'Operations reps (2)',
        targetCount: 2,
        roleOrDeptDescription: 'Operations department representatives',
        matchScore: (rev) => matchesDept(rev, 'Operations', 'Mobile Enrolment') ? 8 : 0,
      },
    ],
  },
  {
    id: 'annex-11',
    orderNumber: 11,
    functionTitle: 'Project Driver',
    department: 'Project Coordination & Support',
    originalAppraisersText:
      'Line supervisor; Facility Supervisors\' reps (2); Operations reps (2); Admin rep; Security rep',
    aliases: ['project driver', 'driver', 'lead driver', 'transport officer'],
    requirements: [
      {
        id: 'r11-1',
        label: 'Line supervisor',
        targetCount: 1,
        roleOrDeptDescription: 'PA to PC or Project Admin',
        matchScore: (rev) => matchesDept(rev, 'PA to PC', 'Project Admin', 'Coordination') ? 10 : 0,
      },
      {
        id: 'r11-2',
        label: 'Facility Supervisors\' reps (2)',
        targetCount: 2,
        roleOrDeptDescription: 'Facility Supervisors regularly served by drivers',
        matchScore: (rev) => matchesDept(rev, 'Facility Supervisor') ? 8 : 0,
      },
      {
        id: 'r11-3',
        label: 'Operations reps (2)',
        targetCount: 2,
        roleOrDeptDescription: 'Field Operations representatives',
        matchScore: (rev) => matchesDept(rev, 'Operations', 'Mobile Enrolment') ? 8 : 0,
      },
      {
        id: 'r11-4',
        label: 'Admin rep',
        targetCount: 1,
        roleOrDeptDescription: 'Admin representative',
        matchScore: (rev) => matchesDept(rev, 'Admin') ? 8 : 0,
      },
      {
        id: 'r11-5',
        label: 'Security rep',
        targetCount: 1,
        roleOrDeptDescription: 'Security Officer representative',
        matchScore: (rev) => matchesDept(rev, 'Security') ? 8 : 0,
      },
    ],
  },
  {
    id: 'annex-12',
    orderNumber: 12,
    functionTitle: 'Quality Assurance Manager',
    department: 'Quality Assurance',
    originalAppraisersText:
      'Line supervisor; Team member supervised; Facility Supervisors\' reps (2); Admin rep; Production rep; Technical Team rep',
    aliases: ['quality assurance manager', 'qa manager', 'quality manager', 'head of qa'],
    requirements: [
      {
        id: 'r12-1',
        label: 'Line supervisor',
        targetCount: 1,
        roleOrDeptDescription: 'Project Coordinator or Head of Operations',
        matchScore: (rev) =>
          matchesDept(rev, 'Project Coordinator', 'Head of Operations') ? 10 : 0,
      },
      {
        id: 'r12-2',
        label: 'Team member supervised',
        targetCount: 1,
        roleOrDeptDescription: 'Quality Assurance Inspector / Officer',
        matchScore: (rev) =>
          matchesDept(rev, 'Quality Assurance', 'QA') &&
          !matchesDept(rev, 'Quality Assurance Manager') ? 8 : 0,
      },
      {
        id: 'r12-3',
        label: 'Facility Supervisors\' reps (2)',
        targetCount: 2,
        roleOrDeptDescription: 'Facility Supervisors audited by QA',
        matchScore: (rev) => matchesDept(rev, 'Facility Supervisor') ? 8 : 0,
      },
      {
        id: 'r12-4',
        label: 'Admin rep',
        targetCount: 1,
        roleOrDeptDescription: 'Project Admin representative',
        matchScore: (rev) => matchesDept(rev, 'Admin') ? 8 : 0,
      },
      {
        id: 'r12-5',
        label: 'Production rep',
        targetCount: 1,
        roleOrDeptDescription: 'Production / Stock representative',
        matchScore: (rev) => matchesDept(rev, 'Production', 'Stock') ? 8 : 0,
      },
      {
        id: 'r12-6',
        label: 'Technical Team rep',
        targetCount: 1,
        roleOrDeptDescription: 'Technical Team representative',
        matchScore: (rev) => matchesDept(rev, 'Technical', 'IT') ? 8 : 0,
      },
    ],
  },
  {
    id: 'annex-13',
    orderNumber: 13,
    functionTitle: 'Security Coordinator',
    department: 'Security & Safety',
    originalAppraisersText:
      'Line supervisor; Operations rep; Facility Supervisors\' rep; Customer Care rep; Technical Team rep; Finance rep; Operators\' rep',
    aliases: ['security coordinator', 'security manager', 'head of security', 'chief security'],
    requirements: [
      {
        id: 'r13-1',
        label: 'Line supervisor',
        targetCount: 1,
        roleOrDeptDescription: 'Project Coordinator or Head of Operations',
        matchScore: (rev) =>
          matchesDept(rev, 'Project Coordinator', 'Head of Operations') ? 10 : 0,
      },
      {
        id: 'r13-2',
        label: 'Operations rep',
        targetCount: 1,
        roleOrDeptDescription: 'Field Operations representative',
        matchScore: (rev) => matchesDept(rev, 'Operations') ? 8 : 0,
      },
      {
        id: 'r13-3',
        label: 'Facility Supervisors\' rep',
        targetCount: 1,
        roleOrDeptDescription: 'Facility Supervisor representative',
        matchScore: (rev) => matchesDept(rev, 'Facility Supervisor') ? 8 : 0,
      },
      {
        id: 'r13-4',
        label: 'Customer Care rep',
        targetCount: 1,
        roleOrDeptDescription: 'Customer Care representative',
        matchScore: (rev) => matchesDept(rev, 'Customer Care') ? 8 : 0,
      },
      {
        id: 'r13-5',
        label: 'Technical Team rep',
        targetCount: 1,
        roleOrDeptDescription: 'Technical Team representative',
        matchScore: (rev) => matchesDept(rev, 'Technical', 'IT') ? 8 : 0,
      },
      {
        id: 'r13-6',
        label: 'Finance rep',
        targetCount: 1,
        roleOrDeptDescription: 'Finance representative',
        matchScore: (rev) => matchesDept(rev, 'Finance', 'Account') ? 8 : 0,
      },
      {
        id: 'r13-7',
        label: 'Operators\' rep',
        targetCount: 1,
        roleOrDeptDescription: 'Enrolment Operator representative',
        matchScore: (rev) => matchesDept(rev, 'Operator') ? 8 : 0,
      },
    ],
  },
  {
    id: 'annex-14',
    orderNumber: 14,
    functionTitle: 'Statistics Officer',
    department: 'Statistics & Data Management',
    originalAppraisersText:
      'Line supervisor; Technical Team rep; Production rep; Operations rep; Project Coordinator; USPC rep; QA rep',
    aliases: ['statistics officer', 'statistician', 'data officer', 'head of statistics'],
    requirements: [
      {
        id: 'r14-1',
        label: 'Line supervisor',
        targetCount: 1,
        roleOrDeptDescription: 'Supervisor / Operations Head',
        matchScore: (rev) =>
          matchesDept(rev, 'Head of Operations', 'Project Coordinator') ? 10 : 0,
      },
      {
        id: 'r14-2',
        label: 'Technical Team rep',
        targetCount: 1,
        roleOrDeptDescription: 'Technical / IT Team representative',
        matchScore: (rev) => matchesDept(rev, 'Technical', 'IT') ? 8 : 0,
      },
      {
        id: 'r14-3',
        label: 'Production rep',
        targetCount: 1,
        roleOrDeptDescription: 'Production / Stock Controller representative',
        matchScore: (rev) => matchesDept(rev, 'Production', 'Stock') ? 8 : 0,
      },
      {
        id: 'r14-4',
        label: 'Operations rep',
        targetCount: 1,
        roleOrDeptDescription: 'Field Operations representative',
        matchScore: (rev) => matchesDept(rev, 'Operations') ? 8 : 0,
      },
      {
        id: 'r14-5',
        label: 'Project Coordinator',
        targetCount: 1,
        roleOrDeptDescription: 'Project Coordinator or PA',
        matchScore: (rev) => matchesDept(rev, 'Project Coordinator', 'PA to PC') ? 8 : 0,
      },
      {
        id: 'r14-6',
        label: 'USPC rep',
        targetCount: 1,
        roleOrDeptDescription: 'USPC Project representative',
        matchScore: (rev) => matchesDept(rev, 'USPC') ? 8 : 0,
      },
      {
        id: 'r14-7',
        label: 'Quality Assurance rep',
        targetCount: 1,
        roleOrDeptDescription: 'QA Manager or Officer',
        matchScore: (rev) => matchesDept(rev, 'Quality Assurance', 'QA') ? 8 : 0,
      },
    ],
  },
  {
    id: 'annex-15',
    orderNumber: 15,
    functionTitle: 'Stock Controller',
    department: 'Administration & Stores',
    originalAppraisersText:
      'Line supervisor; Production rep; Facility Supervisors\' reps (2); Technical Team rep; Statistics Department rep; Operations rep',
    aliases: ['stock controller', 'inventory controller', 'stock manager'],
    requirements: [
      {
        id: 'r15-1',
        label: 'Line supervisor',
        targetCount: 1,
        roleOrDeptDescription: 'Stores Supervisor / Project Admin',
        matchScore: (rev) => matchesDept(rev, 'Stores Supervisor', 'Project Admin') ? 10 : 0,
      },
      {
        id: 'r15-2',
        label: 'Production rep',
        targetCount: 1,
        roleOrDeptDescription: 'Production representative',
        matchScore: (rev) => matchesDept(rev, 'Production') ? 8 : 0,
      },
      {
        id: 'r15-3',
        label: 'Facility Supervisors\' reps (2)',
        targetCount: 2,
        roleOrDeptDescription: 'Facility Supervisors requisitioning stock',
        matchScore: (rev) => matchesDept(rev, 'Facility Supervisor') ? 8 : 0,
      },
      {
        id: 'r15-4',
        label: 'Technical Team rep',
        targetCount: 1,
        roleOrDeptDescription: 'Technical Team representative',
        matchScore: (rev) => matchesDept(rev, 'Technical', 'IT') ? 8 : 0,
      },
      {
        id: 'r15-5',
        label: 'Statistics Department rep',
        targetCount: 1,
        roleOrDeptDescription: 'Statistics Officer representative',
        matchScore: (rev) => matchesDept(rev, 'Statistics') ? 8 : 0,
      },
      {
        id: 'r15-6',
        label: 'Operations rep',
        targetCount: 1,
        roleOrDeptDescription: 'Operations field representative',
        matchScore: (rev) => matchesDept(rev, 'Operations') ? 8 : 0,
      },
    ],
  },
  {
    id: 'annex-16',
    orderNumber: 16,
    functionTitle: 'Stores Supervisor',
    department: 'Administration & Stores',
    originalAppraisersText:
      'Supervisor; admin rep; (2) facility supervisor rep; operations rep (2); Technical team rep',
    aliases: ['stores supervisor', 'warehouse supervisor', 'store supervisor'],
    requirements: [
      {
        id: 'r16-1',
        label: 'Supervisor',
        targetCount: 1,
        roleOrDeptDescription: 'Project Admin or Head of Operations',
        matchScore: (rev) =>
          matchesDept(rev, 'Project Admin', 'Head of Operations') ? 10 : 0,
      },
      {
        id: 'r16-2',
        label: 'Admin rep',
        targetCount: 1,
        roleOrDeptDescription: 'Admin representative',
        matchScore: (rev) => matchesDept(rev, 'Admin') ? 8 : 0,
      },
      {
        id: 'r16-3',
        label: 'Facility supervisor rep (2)',
        targetCount: 2,
        roleOrDeptDescription: 'Facility Supervisor representatives',
        matchScore: (rev) => matchesDept(rev, 'Facility Supervisor') ? 8 : 0,
      },
      {
        id: 'r16-4',
        label: 'Operations rep (2)',
        targetCount: 2,
        roleOrDeptDescription: 'Operations department representatives',
        matchScore: (rev) => matchesDept(rev, 'Operations') ? 8 : 0,
      },
      {
        id: 'r16-5',
        label: 'Technical team rep',
        targetCount: 1,
        roleOrDeptDescription: 'Technical Team representative',
        matchScore: (rev) => matchesDept(rev, 'Technical', 'IT') ? 8 : 0,
      },
    ],
  },
  {
    id: 'annex-17',
    orderNumber: 17,
    functionTitle: 'System Support Manager',
    department: 'Technical & IT Support',
    originalAppraisersText:
      'Supervisor; (3) reps from the department; operations (2); rep from facility supervisors',
    aliases: ['system support manager', 'systems manager', 'systems support manager'],
    requirements: [
      {
        id: 'r17-1',
        label: 'Supervisor',
        targetCount: 1,
        roleOrDeptDescription: 'Project Coordinator or Head of Operations',
        matchScore: (rev) =>
          matchesDept(rev, 'Project Coordinator', 'Head of Operations') ? 10 : 0,
      },
      {
        id: 'r17-2',
        label: 'Reps from the department (3)',
        targetCount: 3,
        roleOrDeptDescription: 'Technical Team / System Support colleagues',
        matchScore: (rev) =>
          matchesDept(rev, 'Technical', 'System Support', 'IT') &&
          !matchesDept(rev, 'System Support Manager') ? 8 : 0,
      },
      {
        id: 'r17-3',
        label: 'Operations (2)',
        targetCount: 2,
        roleOrDeptDescription: 'Operations department representatives',
        matchScore: (rev) => matchesDept(rev, 'Operations') ? 8 : 0,
      },
      {
        id: 'r17-4',
        label: 'Rep from facility supervisors',
        targetCount: 1,
        roleOrDeptDescription: 'Facility Supervisor representative',
        matchScore: (rev) => matchesDept(rev, 'Facility Supervisor') ? 8 : 0,
      },
    ],
  },
  {
    id: 'annex-18',
    orderNumber: 18,
    functionTitle: 'Technical Team',
    department: 'Technical & IT Support',
    originalAppraisersText:
      'Supervisor; (3) reps from the department; (2) reps from facility supervisors; (1) rep from admin',
    aliases: ['technical team', 'technical officer', 'systems technician', 'technical support officer', 'it officer'],
    requirements: [
      {
        id: 'r18-1',
        label: 'Supervisor',
        targetCount: 1,
        roleOrDeptDescription: 'IT Coordinator or System Support Manager',
        matchScore: (rev) =>
          matchesDept(rev, 'IT Coordinator', 'System Support Manager') ? 10 : 0,
      },
      {
        id: 'r18-2',
        label: 'Reps from the department (3)',
        targetCount: 3,
        roleOrDeptDescription: 'Peer Technical / IT colleagues',
        matchScore: (rev) =>
          matchesDept(rev, 'Technical', 'IT', 'System Support') ? 8 : 0,
      },
      {
        id: 'r18-3',
        label: 'Reps from facility supervisors (2)',
        targetCount: 2,
        roleOrDeptDescription: 'Facility Supervisor representatives',
        matchScore: (rev) => matchesDept(rev, 'Facility Supervisor') ? 8 : 0,
      },
      {
        id: 'r18-4',
        label: 'Rep from admin (1)',
        targetCount: 1,
        roleOrDeptDescription: 'Administration representative',
        matchScore: (rev) => matchesDept(rev, 'Admin') ? 8 : 0,
      },
    ],
  },
];

/**
 * Match an employee in the roster to one of the 18 Annex A rules
 */
export function findMatchingAnnexARule(role: string, department: string): AnnexARule | undefined {
  const normRole = (role || '').trim().toLowerCase();
  const normDept = (department || '').trim().toLowerCase();

  // 1. Direct exact or alias match
  for (const rule of ANNEX_A_RULES) {
    if (rule.functionTitle.toLowerCase() === normRole) return rule;
    if (rule.aliases.some((alias) => normRole.includes(alias) || alias.includes(normRole))) {
      return rule;
    }
  }

  // 2. Keyword fallback
  if (normRole.includes('communications') || (normDept.includes('communications') && normRole.includes('manager'))) {
    return ANNEX_A_RULES.find((r) => r.id === 'annex-01');
  }
  if (normRole.includes('customer care') && normRole.includes('supervisor')) {
    return ANNEX_A_RULES.find((r) => r.id === 'annex-02');
  }
  if (normRole.includes('facility') && (normRole.includes('supervisor') || normDept.includes('facility'))) {
    return ANNEX_A_RULES.find((r) => r.id === 'annex-03');
  }
  if (normRole.includes('field operations') || (normRole.includes('operations manager') && !normRole.includes('head'))) {
    return ANNEX_A_RULES.find((r) => r.id === 'annex-04');
  }
  if (normRole.includes('head of operations') || normRole.includes('operations director')) {
    return ANNEX_A_RULES.find((r) => r.id === 'annex-05');
  }
  if (normRole.includes('it coordinator') || (normRole.includes('it') && normRole.includes('coordinator'))) {
    return ANNEX_A_RULES.find((r) => r.id === 'annex-06');
  }
  if (normRole.includes('mobile enrolment') || normRole.includes('enrolment officer')) {
    return ANNEX_A_RULES.find((r) => r.id === 'annex-07');
  }
  if (normRole.includes('pa to pc') || normRole.includes('personal assistant')) {
    return ANNEX_A_RULES.find((r) => r.id === 'annex-08');
  }
  if (normRole.includes('accountant') || normRole.includes('project accountant')) {
    return ANNEX_A_RULES.find((r) => r.id === 'annex-09');
  }
  if (normRole.includes('project admin') || (normRole.includes('admin') && normRole.includes('officer'))) {
    return ANNEX_A_RULES.find((r) => r.id === 'annex-10');
  }
  if (normRole.includes('driver')) {
    return ANNEX_A_RULES.find((r) => r.id === 'annex-11');
  }
  if (normRole.includes('quality assurance') || normRole.includes('qa manager')) {
    return ANNEX_A_RULES.find((r) => r.id === 'annex-12');
  }
  if (normRole.includes('security coordinator') || (normRole.includes('security') && normRole.includes('manager'))) {
    return ANNEX_A_RULES.find((r) => r.id === 'annex-13');
  }
  if (normRole.includes('statistics') || normRole.includes('statistician')) {
    return ANNEX_A_RULES.find((r) => r.id === 'annex-14');
  }
  if (normRole.includes('stock controller') || normRole.includes('stock control')) {
    return ANNEX_A_RULES.find((r) => r.id === 'annex-15');
  }
  if (normRole.includes('stores supervisor') || normRole.includes('warehouse supervisor')) {
    return ANNEX_A_RULES.find((r) => r.id === 'annex-16');
  }
  if (normRole.includes('system support manager') || normRole.includes('systems manager')) {
    return ANNEX_A_RULES.find((r) => r.id === 'annex-17');
  }
  if (normRole.includes('technical team') || normRole.includes('technician') || normDept.includes('technical')) {
    return ANNEX_A_RULES.find((r) => r.id === 'annex-18');
  }

  return undefined;
}

/**
 * Evaluate how closely a 7-person reviewing panel matches the Annex A requirements for this reviewee
 */
export function evaluatePanelCompliance(
  reviewee: Person,
  panelMembers: Person[],
  rule: AnnexARule
): PanelComplianceResult {
  const assigned = new Set<string>();
  const slots: PanelComplianceResult['slots'] = [];
  let totalMatched = 0;

  for (const req of rule.requirements) {
    const matchedMembers: Person[] = [];
    for (const member of panelMembers) {
      if (assigned.has(member.id)) continue;
      if (matchedMembers.length >= req.targetCount) break;

      const score = req.matchScore(member, reviewee);
      if (score > 0) {
        matchedMembers.push(member);
        assigned.add(member.id);
      }
    }

    slots.push({
      requirementId: req.id,
      label: req.label,
      targetCount: req.targetCount,
      assignedMembers: matchedMembers,
      isFulfilled: matchedMembers.length >= req.targetCount,
    });

    totalMatched += matchedMembers.length;
  }

  // Total required across the 7 slots
  const totalRequired = 7;
  const clampedMatched = Math.min(totalRequired, totalMatched);
  const complianceRate = Math.round((clampedMatched / totalRequired) * 100);

  return {
    rule,
    totalRequired,
    matchedCount: clampedMatched,
    complianceRate,
    isCompliant: clampedMatched === totalRequired,
    slots,
  };
}
