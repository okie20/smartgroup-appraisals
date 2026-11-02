import { Person, DepartmentCluster, FacilityLocation } from '../types';

export const DEFAULT_CLUSTERS: DepartmentCluster[] = [
  {
    id: 'cluster-ops-facilities',
    name: 'Operations & Facilities',
    color: 'emerald',
    departments: [
      'Operations & Field Services',
      'Facility Supervision',
    ],
  },
  {
    id: 'cluster-tech-qa-stats',
    name: 'Technical, Quality & Analytics',
    color: 'indigo',
    departments: [
      'Technical & IT Support',
      'Quality Assurance',
      'Statistics & Data Management',
    ],
  },
  {
    id: 'cluster-gov-admin-sec',
    name: 'Governance, Admin & Security',
    color: 'amber',
    departments: [
      'Project Coordination & Transport',
      'Administration & Stores',
      'Security & Safety',
      'USPC Liaison',
    ],
  },
  {
    id: 'cluster-care-fin-comms',
    name: 'Customer Relations, Finance & Comms',
    color: 'rose',
    departments: [
      'Customer Care & Front Office',
      'Finance & Accounts',
      'Communications & PR',
    ],
  },
];

/**
 * 135-Person Roster modeled directly after Annex A 18 specified job posts
 * and the company's 7 branch facilities:
 * Kampala (HQ), Mbarara, Jinja, Gulu, Mbale, Arua, Fort Portal.
 *
 * Rules:
 * - isSupervisor: true -> Eligible for cross-facility management panels and Annex A supervisory reviews
 * - isSupervisor: false -> STRICTLY reviewed only by staff from their same facility
 */
export const DEFAULT_ROSTER: Person[] = [
  // -------------------------------------------------------------------------
  // 1. Project Coordination & Transport (7 people) - Kampala HQ
  // -------------------------------------------------------------------------
  { id: 'EMP-001', name: 'Dr. Arthur Mukasa', department: 'Project Coordination & Transport', role: 'Project Coordinator', email: 'arthur.mukasa@org.project', facility: 'Kampala', isSupervisor: true },
  { id: 'EMP-002', name: 'Grace Namatovu', department: 'Project Coordination & Transport', role: 'PA to PC', email: 'grace.namatovu@org.project', facility: 'Kampala', isSupervisor: false }, // Annex A #8
  { id: 'EMP-003', name: 'Patrick Ochieng', department: 'Project Coordination & Transport', role: 'Project Driver', email: 'patrick.ochieng@org.project', facility: 'Kampala', isSupervisor: false }, // Annex A #11
  { id: 'EMP-004', name: 'Dennis Katongole', department: 'Project Coordination & Transport', role: 'Project Driver', email: 'dennis.katongole@org.project', facility: 'Mbarara', isSupervisor: false },
  { id: 'EMP-005', name: 'Samuel Byaruhanga', department: 'Project Coordination & Transport', role: 'Project Driver', email: 'samuel.byaruhanga@org.project', facility: 'Jinja', isSupervisor: false },
  { id: 'EMP-006', name: 'Joan Nanteza', department: 'Project Coordination & Transport', role: 'Coordination Assistant', email: 'joan.nanteza@org.project', facility: 'Kampala', isSupervisor: false },
  { id: 'EMP-007', name: 'Moses Wandera', department: 'Project Coordination & Transport', role: 'Logistics Fleet Driver', email: 'moses.wandera@org.project', facility: 'Gulu', isSupervisor: false },

  // -------------------------------------------------------------------------
  // 2. Operations & Field Services (22 people)
  // -------------------------------------------------------------------------
  { id: 'EMP-008', name: 'Robert Kasule', department: 'Operations & Field Services', role: 'Head of Operations', email: 'robert.kasule@org.project', facility: 'Kampala', isSupervisor: true }, // Annex A #5
  { id: 'EMP-009', name: 'Beatrice Nabirye', department: 'Operations & Field Services', role: 'Field Operations Manager', email: 'beatrice.nabirye@org.project', facility: 'Kampala', isSupervisor: true }, // Annex A #4
  { id: 'EMP-010', name: 'Richard Tumusiime', department: 'Operations & Field Services', role: 'Mobile Enrolment', email: 'richard.tumusiime@org.project', facility: 'Mbarara', isSupervisor: false }, // Annex A #7
  { id: 'EMP-011', name: 'Irene Kansiime', department: 'Operations & Field Services', role: 'Mobile Enrolment', email: 'irene.kansiime@org.project', facility: 'Jinja', isSupervisor: false },
  { id: 'EMP-012', name: 'Gerald Mwesigwa', department: 'Operations & Field Services', role: 'Mobile Enrolment Officer', email: 'gerald.mwesigwa@org.project', facility: 'Gulu', isSupervisor: false },
  { id: 'EMP-013', name: 'Dorothy Akello', department: 'Operations & Field Services', role: 'Mobile Enrolment Officer', email: 'dorothy.akello@org.project', facility: 'Mbale', isSupervisor: false },
  { id: 'EMP-014', name: 'Francis Okot', department: 'Operations & Field Services', role: 'Operations Field Supervisor', email: 'francis.okot@org.project', facility: 'Arua', isSupervisor: true },
  { id: 'EMP-015', name: 'Sarah Nalwanga', department: 'Operations & Field Services', role: 'Operations Field Specialist', email: 'sarah.nalwanga@org.project', facility: 'Fort Portal', isSupervisor: false },
  { id: 'EMP-016', name: 'David Semakula', department: 'Operations & Field Services', role: 'Enrolment Operator', email: 'david.semakula@org.project', facility: 'Kampala', isSupervisor: false },
  { id: 'EMP-017', name: 'Lydia Kobusinge', department: 'Operations & Field Services', role: 'Enrolment Operator', email: 'lydia.kobusinge@org.project', facility: 'Mbarara', isSupervisor: false },
  { id: 'EMP-018', name: 'Timothy Opolot', department: 'Operations & Field Services', role: 'Enrolment Operator', email: 'timothy.opolot@org.project', facility: 'Jinja', isSupervisor: false },
  { id: 'EMP-019', name: 'Agnes Mbabazi', department: 'Operations & Field Services', role: 'Enrolment Operator', email: 'agnes.mbabazi@org.project', facility: 'Gulu', isSupervisor: false },
  { id: 'EMP-020', name: 'Victor Senyonga', department: 'Operations & Field Services', role: 'Enrolment Operator', email: 'victor.senyonga@org.project', facility: 'Mbale', isSupervisor: false },
  { id: 'EMP-021', name: 'Priscilla Asimwe', department: 'Operations & Field Services', role: 'Enrolment Operator', email: 'priscilla.asimwe@org.project', facility: 'Arua', isSupervisor: false },
  { id: 'EMP-022', name: 'Daniel Kigozi', department: 'Operations & Field Services', role: 'Enrolment Operator', email: 'daniel.kigozi@org.project', facility: 'Fort Portal', isSupervisor: false },
  { id: 'EMP-023', name: 'Harriet Birungi', department: 'Operations & Field Services', role: 'Enrolment Operator', email: 'harriet.birungi@org.project', facility: 'Kampala', isSupervisor: false },
  { id: 'EMP-024', name: 'Geoffrey Lubega', department: 'Operations & Field Services', role: 'Enrolment Operator', email: 'geoffrey.lubega@org.project', facility: 'Mbarara', isSupervisor: false },
  { id: 'EMP-025', name: 'Catherine Nambi', department: 'Operations & Field Services', role: 'Field Deployment Officer', email: 'catherine.nambi@org.project', facility: 'Jinja', isSupervisor: false },
  { id: 'EMP-026', name: 'Peter Mayanja', department: 'Operations & Field Services', role: 'Field Deployment Officer', email: 'peter.mayanja@org.project', facility: 'Gulu', isSupervisor: false },
  { id: 'EMP-027', name: 'Gloria Kyomugisha', department: 'Operations & Field Services', role: 'Operations Support Officer', email: 'gloria.kyomugisha@org.project', facility: 'Mbale', isSupervisor: false },
  { id: 'EMP-028', name: 'Edward Wamala', department: 'Operations & Field Services', role: 'Operations Support Officer', email: 'edward.wamala@org.project', facility: 'Arua', isSupervisor: false },
  { id: 'EMP-029', name: 'Christine Auma', department: 'Operations & Field Services', role: 'Operations Liaison Officer', email: 'christine.auma@org.project', facility: 'Fort Portal', isSupervisor: false },

  // -------------------------------------------------------------------------
  // 3. Facility Supervision (19 people) - Distributed Across All 7 Facilities
  // -------------------------------------------------------------------------
  { id: 'EMP-030', name: 'Solomon Ssebunya', department: 'Facility Supervision', role: 'Facility Supervisor', email: 'solomon.ssebunya@org.project', facility: 'Kampala', isSupervisor: true }, // Annex A #3
  { id: 'EMP-031', name: 'Evelyn Nakato', department: 'Facility Supervision', role: 'Facility Supervisor', email: 'evelyn.nakato@org.project', facility: 'Mbarara', isSupervisor: true },
  { id: 'EMP-032', name: 'Emmanuel Baguma', department: 'Facility Supervision', role: 'Facility Supervisor', email: 'emmanuel.baguma@org.project', facility: 'Jinja', isSupervisor: true },
  { id: 'EMP-033', name: 'Fiona Babirye', department: 'Facility Supervision', role: 'Facility Supervisor', email: 'fiona.babirye@org.project', facility: 'Gulu', isSupervisor: true },
  { id: 'EMP-034', name: 'Julius Mugisha', department: 'Facility Supervision', role: 'Facility Supervisor', email: 'julius.mugisha@org.project', facility: 'Mbale', isSupervisor: true },
  { id: 'EMP-035', name: 'Winifred Nansubuga', department: 'Facility Supervision', role: 'Facility Supervisor', email: 'winifred.nansubuga@org.project', facility: 'Arua', isSupervisor: true },
  { id: 'EMP-036', name: 'Christopher Musoke', department: 'Facility Supervision', role: 'Facility Supervisor', email: 'christopher.musoke@org.project', facility: 'Fort Portal', isSupervisor: true },
  { id: 'EMP-037', name: 'Diana Atuhaire', department: 'Facility Supervision', role: 'Facility Supervisor', email: 'diana.atuhaire@org.project', facility: 'Mbarara', isSupervisor: true },
  { id: 'EMP-038', name: 'Andrew Otim', department: 'Facility Supervision', role: 'Facility Supervisor', email: 'andrew.otim@org.project', facility: 'Gulu', isSupervisor: true },
  { id: 'EMP-039', name: 'Brenda Namusisi', department: 'Facility Supervision', role: 'Facility Supervisor', email: 'brenda.namusisi@org.project', facility: 'Jinja', isSupervisor: true },
  { id: 'EMP-040', name: 'Charles Lukwago', department: 'Facility Supervision', role: 'Facility Supervisor', email: 'charles.lukwago@org.project', facility: 'Kampala', isSupervisor: true },
  { id: 'EMP-041', name: 'Jackline Namugwanya', department: 'Facility Supervision', role: 'Facility Supervisor', email: 'jackline.namugwanya@org.project', facility: 'Mbale', isSupervisor: true },
  { id: 'EMP-042', name: 'Brian Kaggwa', department: 'Facility Supervision', role: 'Assistant Facility Supervisor', email: 'brian.kaggwa@org.project', facility: 'Arua', isSupervisor: false },
  { id: 'EMP-043', name: 'Racheal Nabukalu', department: 'Facility Supervision', role: 'Assistant Facility Supervisor', email: 'racheal.nabukalu@org.project', facility: 'Fort Portal', isSupervisor: false },
  { id: 'EMP-044', name: 'Henry Sekitto', department: 'Facility Supervision', role: 'Assistant Facility Supervisor', email: 'henry.sekitto@org.project', facility: 'Kampala', isSupervisor: false },
  { id: 'EMP-045', name: 'Mercy Ainembabazi', department: 'Facility Supervision', role: 'Facility Operations Officer', email: 'mercy.ainembabazi@org.project', facility: 'Mbarara', isSupervisor: false },
  { id: 'EMP-046', name: 'Ronald Ssempijja', department: 'Facility Supervision', role: 'Facility Operations Officer', email: 'ronald.ssempijja@org.project', facility: 'Jinja', isSupervisor: false },
  { id: 'EMP-047', name: 'Stella Akello', department: 'Facility Supervision', role: 'Facility Operations Officer', email: 'stella.akello@org.project', facility: 'Gulu', isSupervisor: false },
  { id: 'EMP-048', name: 'Fredrick Kato', department: 'Facility Supervision', role: 'Facility Field Inspector', email: 'fredrick.kato@org.project', facility: 'Fort Portal', isSupervisor: false },

  // -------------------------------------------------------------------------
  // 4. Technical & IT Support (17 people)
  // -------------------------------------------------------------------------
  { id: 'EMP-049', name: 'Eng. Isaac Kyeyune', department: 'Technical & IT Support', role: 'IT Coordinator', email: 'isaac.kyeyune@org.project', facility: 'Kampala', isSupervisor: true }, // Annex A #6
  { id: 'EMP-050', name: 'Kenneth Muhwezi', department: 'Technical & IT Support', role: 'System Support Manager', email: 'kenneth.muhwezi@org.project', facility: 'Kampala', isSupervisor: true }, // Annex A #17
  { id: 'EMP-051', name: 'Allan Wasswa', department: 'Technical & IT Support', role: 'Technical Team', email: 'allan.wasswa@org.project', facility: 'Mbarara', isSupervisor: false }, // Annex A #18
  { id: 'EMP-052', name: 'Miriam Nakimera', department: 'Technical & IT Support', role: 'Technical Team', email: 'miriam.nakimera@org.project', facility: 'Jinja', isSupervisor: false },
  { id: 'EMP-053', name: 'Simon Baluku', department: 'Technical & IT Support', role: 'Technical Team', email: 'simon.baluku@org.project', facility: 'Gulu', isSupervisor: false },
  { id: 'EMP-054', name: 'Janet Nankya', department: 'Technical & IT Support', role: 'Technical Team', email: 'janet.nankya@org.project', facility: 'Mbale', isSupervisor: false },
  { id: 'EMP-055', name: 'Joseph Okumu', department: 'Technical & IT Support', role: 'Technical Team', email: 'joseph.okumu@org.project', facility: 'Arua', isSupervisor: false },
  { id: 'EMP-056', name: 'Clare Nabatanzi', department: 'Technical & IT Support', role: 'Systems Infrastructure Engineer', email: 'clare.nabatanzi@org.project', facility: 'Fort Portal', isSupervisor: false },
  { id: 'EMP-057', name: 'Stephen Kibet', department: 'Technical & IT Support', role: 'Network Security Engineer', email: 'stephen.kibet@org.project', facility: 'Kampala', isSupervisor: false },
  { id: 'EMP-058', name: 'Annet Tumuhimbise', department: 'Technical & IT Support', role: 'Database Administrator', email: 'annet.tumuhimbise@org.project', facility: 'Kampala', isSupervisor: false },
  { id: 'EMP-059', name: 'George Bwambale', department: 'Technical & IT Support', role: 'Enrolment Hardware Technician', email: 'george.bwambale@org.project', facility: 'Mbarara', isSupervisor: false },
  { id: 'EMP-060', name: 'Hellen Namutebi', department: 'Technical & IT Support', role: 'Biometric Systems Technician', email: 'hellen.namutebi@org.project', facility: 'Jinja', isSupervisor: false },
  { id: 'EMP-061', name: 'Dennis Twinomujuni', department: 'Technical & IT Support', role: 'Field IT Support Technician', email: 'dennis.twinomujuni@org.project', facility: 'Gulu', isSupervisor: false },
  { id: 'EMP-062', name: 'Sharon Kemigisha', department: 'Technical & IT Support', role: 'Software Application Support', email: 'sharon.kemigisha@org.project', facility: 'Mbale', isSupervisor: false },
  { id: 'EMP-063', name: 'Benjamin Lutwama', department: 'Technical & IT Support', role: 'Workstation Support Specialist', email: 'benjamin.lutwama@org.project', facility: 'Arua', isSupervisor: false },
  { id: 'EMP-064', name: 'Patricia Nalubega', department: 'Technical & IT Support', role: 'Production Systems Engineer', email: 'patricia.nalubega@org.project', facility: 'Fort Portal', isSupervisor: false },
  { id: 'EMP-065', name: 'Ivan Byamugisha', department: 'Technical & IT Support', role: 'Production Systems Engineer', email: 'ivan.byamugisha@org.project', facility: 'Kampala', isSupervisor: false },

  // -------------------------------------------------------------------------
  // 5. Customer Care & Front Office (16 people)
  // -------------------------------------------------------------------------
  { id: 'EMP-066', name: 'Judith Namubiru', department: 'Customer Care & Front Office', role: 'Customer Care Supervisor', email: 'judith.namubiru@org.project', facility: 'Kampala', isSupervisor: true }, // Annex A #2
  { id: 'EMP-067', name: 'Hassan Ssebaggala', department: 'Customer Care & Front Office', role: 'Customer Care Rep', email: 'hassan.ssebaggala@org.project', facility: 'Mbarara', isSupervisor: false },
  { id: 'EMP-068', name: 'Peninah Alimo', department: 'Customer Care & Front Office', role: 'Customer Care Rep', email: 'peninah.alimo@org.project', facility: 'Jinja', isSupervisor: false },
  { id: 'EMP-069', name: 'Denis Kibuuka', department: 'Customer Care & Front Office', role: 'Customer Care Rep', email: 'denis.kibuuka@org.project', facility: 'Gulu', isSupervisor: false },
  { id: 'EMP-070', name: 'Faith Kyomuhendo', department: 'Customer Care & Front Office', role: 'Customer Care Rep', email: 'faith.kyomuhendo@org.project', facility: 'Mbale', isSupervisor: false },
  { id: 'EMP-071', name: 'Martin Ssali', department: 'Customer Care & Front Office', role: 'Customer Care Rep', email: 'martin.ssali@org.project', facility: 'Arua', isSupervisor: false },
  { id: 'EMP-072', name: 'Olivia Namukwaya', department: 'Customer Care & Front Office', role: 'Call Centre Rep', email: 'olivia.namukwaya@org.project', facility: 'Fort Portal', isSupervisor: false },
  { id: 'EMP-073', name: 'Brian Odong', department: 'Customer Care & Front Office', role: 'Call Centre Rep', email: 'brian.odong@org.project', facility: 'Kampala', isSupervisor: false },
  { id: 'EMP-074', name: 'Leah Nakalema', department: 'Customer Care & Front Office', role: 'Call Centre Rep', email: 'leah.nakalema@org.project', facility: 'Mbarara', isSupervisor: false },
  { id: 'EMP-075', name: 'Samson Chelangat', department: 'Customer Care & Front Office', role: 'Call Centre Rep', email: 'samson.chelangat@org.project', facility: 'Jinja', isSupervisor: false },
  { id: 'EMP-076', name: 'Caroline Ahimbisibwe', department: 'Customer Care & Front Office', role: 'Reception Rep', email: 'caroline.ahimbisibwe@org.project', facility: 'Gulu', isSupervisor: false },
  { id: 'EMP-077', name: 'Doreen Nalweyiso', department: 'Customer Care & Front Office', role: 'Reception Rep', email: 'doreen.nalweyiso@org.project', facility: 'Mbale', isSupervisor: false },
  { id: 'EMP-078', name: 'Gerald Mukwaya', department: 'Customer Care & Front Office', role: 'Front Desk Officer', email: 'gerald.mukwaya@org.project', facility: 'Arua', isSupervisor: false },
  { id: 'EMP-079', name: 'Prudence Namwanje', department: 'Customer Care & Front Office', role: 'Client Feedback Officer', email: 'prudence.namwanje@org.project', facility: 'Fort Portal', isSupervisor: false },
  { id: 'EMP-080', name: 'Cosmas Okumu', department: 'Customer Care & Front Office', role: 'Customer Care Agent', email: 'cosmas.okumu@org.project', facility: 'Mbarara', isSupervisor: false },
  { id: 'EMP-081', name: 'Sylvia Nabaggala', department: 'Customer Care & Front Office', role: 'Public Helpdesk Officer', email: 'sylvia.nabaggala@org.project', facility: 'Jinja', isSupervisor: false },

  // -------------------------------------------------------------------------
  // 6. Administration & Stores (14 people)
  // -------------------------------------------------------------------------
  { id: 'EMP-082', name: 'Florence Nakiranda', department: 'Administration & Stores', role: 'Project Admin', email: 'florence.nakiranda@org.project', facility: 'Kampala', isSupervisor: true }, // Annex A #10
  { id: 'EMP-083', name: 'Elijah Waiswa', department: 'Administration & Stores', role: 'Stores Supervisor', email: 'elijah.waiswa@org.project', facility: 'Jinja', isSupervisor: true }, // Annex A #16
  { id: 'EMP-084', name: 'Godfrey Kiwanuka', department: 'Administration & Stores', role: 'Stock Controller', email: 'godfrey.kiwanuka@org.project', facility: 'Kampala', isSupervisor: true }, // Annex A #15
  { id: 'EMP-085', name: 'Mary Nakanwagi', department: 'Administration & Stores', role: 'Admin Rep', email: 'mary.nakanwagi@org.project', facility: 'Gulu', isSupervisor: false },
  { id: 'EMP-086', name: 'Paul Kalanzi', department: 'Administration & Stores', role: 'Admin Rep', email: 'paul.kalanzi@org.project', facility: 'Mbale', isSupervisor: false },
  { id: 'EMP-087', name: 'Justine Akello', department: 'Administration & Stores', role: 'Assistant Stores Officer', email: 'justine.akello@org.project', facility: 'Arua', isSupervisor: false },
  { id: 'EMP-088', name: 'Moses Ssenyonga', department: 'Administration & Stores', role: 'Assistant Stock Officer', email: 'moses.ssenyonga@org.project', facility: 'Fort Portal', isSupervisor: false },
  { id: 'EMP-089', name: 'Rose Nakaye', department: 'Administration & Stores', role: 'Procurement Assistant', email: 'rose.nakaye@org.project', facility: 'Mbarara', isSupervisor: false },
  { id: 'EMP-090', name: 'Felix Okello', department: 'Administration & Stores', role: 'Warehouse Inventory Clerk', email: 'felix.okello@org.project', facility: 'Jinja', isSupervisor: false },
  { id: 'EMP-091', name: 'Lillian Kyomuhangi', department: 'Administration & Stores', role: 'Records Management Officer', email: 'lillian.kyomuhangi@org.project', facility: 'Gulu', isSupervisor: false },
  { id: 'EMP-092', name: 'Juliet Nankanja', department: 'Administration & Stores', role: 'Administrative Assistant', email: 'juliet.nankanja@org.project', facility: 'Mbale', isSupervisor: false },
  { id: 'EMP-093', name: 'Daniel Mugabe', department: 'Administration & Stores', role: 'Materials Dispatch Officer', email: 'daniel.mugabe@org.project', facility: 'Arua', isSupervisor: false },
  { id: 'EMP-094', name: 'Prossy Nabawanuka', department: 'Administration & Stores', role: 'Equipment Registrar', email: 'prossy.nabawanuka@org.project', facility: 'Fort Portal', isSupervisor: false },
  { id: 'EMP-095', name: 'Oscar Byanyima', department: 'Administration & Stores', role: 'Logistics Liaison Officer', email: 'oscar.byanyima@org.project', facility: 'Mbarara', isSupervisor: false },

  // -------------------------------------------------------------------------
  // 7. Finance & Accounts (9 people) - Kampala HQ
  // -------------------------------------------------------------------------
  { id: 'EMP-096', name: 'Anthony Musisi', department: 'Finance & Accounts', role: 'Project Accountant', email: 'anthony.musisi@org.project', facility: 'Kampala', isSupervisor: true }, // Annex A #9
  { id: 'EMP-097', name: 'Constance Nabwire', department: 'Finance & Accounts', role: 'Accounts Rep', email: 'constance.nabwire@org.project', facility: 'Kampala', isSupervisor: false },
  { id: 'EMP-098', name: 'Herbert Bwire', department: 'Finance & Accounts', role: 'Finance Rep', email: 'herbert.bwire@org.project', facility: 'Kampala', isSupervisor: false },
  { id: 'EMP-099', name: 'Monica Nalubwama', department: 'Finance & Accounts', role: 'Senior Accounts Officer', email: 'monica.nalubwama@org.project', facility: 'Kampala', isSupervisor: false },
  { id: 'EMP-100', name: 'Josephine Kyakuwa', department: 'Finance & Accounts', role: 'Payroll Accountant', email: 'josephine.kyakuwa@org.project', facility: 'Kampala', isSupervisor: false },
  { id: 'EMP-101', name: 'Gideon Atwine', department: 'Finance & Accounts', role: 'Disbursement Officer', email: 'gideon.atwine@org.project', facility: 'Mbarara', isSupervisor: false },
  { id: 'EMP-102', name: 'Harriet Namutebi', department: 'Finance & Accounts', role: 'Revenue Verification Analyst', email: 'harriet.namutebi@org.project', facility: 'Jinja', isSupervisor: false },
  { id: 'EMP-103', name: 'Raymond Sentongo', department: 'Finance & Accounts', role: 'Finance Compliance Analyst', email: 'raymond.sentongo@org.project', facility: 'Gulu', isSupervisor: false },
  { id: 'EMP-104', name: 'Eunice Namaganda', department: 'Finance & Accounts', role: 'Cash Office Accountant', email: 'eunice.namaganda@org.project', facility: 'Mbale', isSupervisor: false },

  // -------------------------------------------------------------------------
  // 8. Quality Assurance (8 people)
  // -------------------------------------------------------------------------
  { id: 'EMP-105', name: 'Dr. Stella Nayiga', department: 'Quality Assurance', role: 'Quality Assurance Manager', email: 'stella.nayiga@org.project', facility: 'Kampala', isSupervisor: true }, // Annex A #12
  { id: 'EMP-106', name: 'Alex Tumwine', department: 'Quality Assurance', role: 'Quality Assurance Rep', email: 'alex.tumwine@org.project', facility: 'Arua', isSupervisor: false },
  { id: 'EMP-107', name: 'Rachel Nanyonjo', department: 'Quality Assurance', role: 'Quality Assurance Rep', email: 'rachel.nanyonjo@org.project', facility: 'Fort Portal', isSupervisor: false },
  { id: 'EMP-108', name: 'Mark Mugerwa', department: 'Quality Assurance', role: 'Field QA Inspector', email: 'mark.mugerwa@org.project', facility: 'Mbarara', isSupervisor: false },
  { id: 'EMP-109', name: 'Vivian Namatovu', department: 'Quality Assurance', role: 'Field QA Inspector', email: 'vivian.namatovu@org.project', facility: 'Jinja', isSupervisor: false },
  { id: 'EMP-110', name: 'Henry Luwaga', department: 'Quality Assurance', role: 'Enrolment Data Quality Auditor', email: 'henry.luwaga@org.project', facility: 'Gulu', isSupervisor: false },
  { id: 'EMP-111', name: 'Juliet Nakato', department: 'Quality Assurance', role: 'Process Standards Officer', email: 'juliet.nakato@org.project', facility: 'Mbale', isSupervisor: false },
  { id: 'EMP-112', name: 'Timothy Kintu', department: 'Quality Assurance', role: 'QA Verification Specialist', email: 'timothy.kintu@org.project', facility: 'Kampala', isSupervisor: false },

  // -------------------------------------------------------------------------
  // 9. Security & Safety (8 people)
  // -------------------------------------------------------------------------
  { id: 'EMP-113', name: 'Major Ronald Mugisha', department: 'Security & Safety', role: 'Security Coordinator', email: 'ronald.mugisha@org.project', facility: 'Kampala', isSupervisor: true }, // Annex A #13
  { id: 'EMP-114', name: 'Grace Komugisha', department: 'Security & Safety', role: 'Security Rep', email: 'grace.komugisha@org.project', facility: 'Arua', isSupervisor: false },
  { id: 'EMP-115', name: 'Apollo Ssemwogerere', department: 'Security & Safety', role: 'Security Rep', email: 'apollo.ssemwogerere@org.project', facility: 'Fort Portal', isSupervisor: false },
  { id: 'EMP-116', name: 'Francis Ochen', department: 'Security & Safety', role: 'Facility Security Supervisor', email: 'francis.ochen@org.project', facility: 'Gulu', isSupervisor: true },
  { id: 'EMP-117', name: 'Betty Nampeera', department: 'Security & Safety', role: 'Operations Security Escort Lead', email: 'betty.nampeera@org.project', facility: 'Mbale', isSupervisor: false },
  { id: 'EMP-118', name: 'Charles Aliga', department: 'Security & Safety', role: 'Field Security Inspector', email: 'charles.aliga@org.project', facility: 'Arua', isSupervisor: false },
  { id: 'EMP-119', name: 'Sarah Nalukenge', department: 'Security & Safety', role: 'Access Control Officer', email: 'sarah.nalukenge@org.project', facility: 'Fort Portal', isSupervisor: false },
  { id: 'EMP-120', name: 'Victor Ojok', department: 'Security & Safety', role: 'Incident Response Officer', email: 'victor.ojok@org.project', facility: 'Mbarara', isSupervisor: false },

  // -------------------------------------------------------------------------
  // 10. USPC Liaison (6 people) - Kampala HQ
  // -------------------------------------------------------------------------
  { id: 'EMP-121', name: 'Nathan Byamukama', department: 'USPC Liaison', role: 'USPC Rep', email: 'nathan.byamukama@org.project', facility: 'Kampala', isSupervisor: true }, // Annex A liaison
  { id: 'EMP-122', name: 'Christine Nabiryo', department: 'USPC Liaison', role: 'USPC Rep', email: 'christine.nabiryo@org.project', facility: 'Kampala', isSupervisor: false },
  { id: 'EMP-123', name: 'Dan Sserunjogi', department: 'USPC Liaison', role: 'USPC Technical Liaison', email: 'dan.sserunjogi@org.project', facility: 'Kampala', isSupervisor: false },
  { id: 'EMP-124', name: 'Ankunda Marion', department: 'USPC Liaison', role: 'USPC Printing & Personalization Rep', email: 'ankunda.marion@org.project', facility: 'Jinja', isSupervisor: false },
  { id: 'EMP-125', name: 'Moses Kyambadde', department: 'USPC Liaison', role: 'USPC Operations Officer', email: 'moses.kyambadde@org.project', facility: 'Gulu', isSupervisor: false },
  { id: 'EMP-126', name: 'Hellen Alupo', department: 'USPC Liaison', role: 'USPC Project Quality Representative', email: 'hellen.alupo@org.project', facility: 'Mbale', isSupervisor: false },

  // -------------------------------------------------------------------------
  // 11. Statistics & Data Management (5 people) - Kampala HQ
  // -------------------------------------------------------------------------
  { id: 'EMP-127', name: 'Davis Mpairwe', department: 'Statistics & Data Management', role: 'Statistics Officer', email: 'davis.mpairwe@org.project', facility: 'Kampala', isSupervisor: true }, // Annex A #14
  { id: 'EMP-128', name: 'Agatha Namagembe', department: 'Statistics & Data Management', role: 'Statistics Department Rep', email: 'agatha.namagembe@org.project', facility: 'Kampala', isSupervisor: false },
  { id: 'EMP-129', name: 'Joshua Kibirige', department: 'Statistics & Data Management', role: 'Senior Data Analyst', email: 'joshua.kibirige@org.project', facility: 'Kampala', isSupervisor: false },
  { id: 'EMP-130', name: 'Mercy Kyomugasho', department: 'Statistics & Data Management', role: 'Enrolment Figures Statistician', email: 'mercy.kyomugasho@org.project', facility: 'Mbarara', isSupervisor: false },
  { id: 'EMP-131', name: 'Brian Mugalu', department: 'Statistics & Data Management', role: 'Data Integrity Verification Clerk', email: 'brian.mugalu@org.project', facility: 'Jinja', isSupervisor: false },

  // -------------------------------------------------------------------------
  // 12. Communications & PR (4 people) - Kampala HQ
  // -------------------------------------------------------------------------
  { id: 'EMP-132', name: 'Lydia Mbabazi', department: 'Communications & PR', role: 'Communications Manager', email: 'lydia.mbabazi@org.project', facility: 'Kampala', isSupervisor: true }, // Annex A #1
  { id: 'EMP-133', name: 'Godfrey Alupo', department: 'Communications & PR', role: 'Public Relations Officer', email: 'godfrey.alupo@org.project', facility: 'Kampala', isSupervisor: false },
  { id: 'EMP-134', name: 'Brenda Nalukwago', department: 'Communications & PR', role: 'Media & Public Affairs Specialist', email: 'brenda.nalukwago@org.project', facility: 'Kampala', isSupervisor: false },
  { id: 'EMP-135', name: 'Joel Mukasa', department: 'Communications & PR', role: 'Stakeholder Communications Lead', email: 'joel.mukasa@org.project', facility: 'Kampala', isSupervisor: false },
];

/**
 * Generate a roster of arbitrary size based on DEFAULT_ROSTER template
 */
export function generateSyntheticRoster(count: number): Person[] {
  if (count <= DEFAULT_ROSTER.length) {
    return DEFAULT_ROSTER.slice(0, count);
  }

  const result = [...DEFAULT_ROSTER];
  let idCounter = DEFAULT_ROSTER.length + 1;
  const depts = [
    'Operations & Field Services',
    'Facility Supervision',
    'Technical & IT Support',
    'Customer Care & Front Office',
    'Administration & Stores',
    'Finance & Accounts',
    'Quality Assurance',
    'Security & Safety',
  ];
  const facilities: FacilityLocation[] = ['Kampala', 'Mbarara', 'Jinja', 'Gulu', 'Mbale', 'Arua', 'Fort Portal'];

  while (result.length < count) {
    const dept = depts[result.length % depts.length];
    const fac = facilities[result.length % facilities.length];
    const baseNum = result.length + 1;
    result.push({
      id: `EMP-${String(idCounter).padStart(3, '0')}`,
      name: `Colleague ${baseNum}`,
      department: dept,
      role: 'Operations Specialist',
      email: `colleague.${baseNum}@org.project`,
      facility: fac,
      isSupervisor: false,
    });
    idCounter++;
  }

  return result;
}
