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
  revieweeId: string; // The Employee Being Reviewed (classified separately, not a member of the reviewing group)
  primaryDepartment: string;
  clusterId: string;
  memberIds: string[]; // Reviewing panel members (~7 peers). Crucially excludes revieweeId.
  leadId?: string; // Backwards-compatible coordinator
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
  targetGroupSize: number; // default 7
  minGroupSize: number;    // default 6
  maxGroupSize: number;    // default 8
  sameDeptWeight: number;  // 0 - 100 (e.g. 70)
  randomSeed: number;
}

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

export interface AppraisalFeedback {
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
  ratings: Record<string, number>; // criterionId -> 1..5
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

