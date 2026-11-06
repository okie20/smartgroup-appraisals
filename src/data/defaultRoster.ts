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
 * Roster sourced directly from the 2026 KAMPALA Rotation schedule (EMPLOYEES.xlsx)
 * and regional branch staff lists.
 *
 * Supervisor load-sharing per the Excel "IMMEDIATE SUPERVISOR" column:
 *   - Reception, Approval, DL Receipt/Issuance, VIP  → Catherine Komujuni
 *   - Enrolment (largest group, 23 staff)             → Peterson Mandera  (load-balance)
 *   Both supervisors are co-listed as "Catherine Komujuni & Mandera Peterson" in the sheet.
 *
 * PC (Project Coordinator) is the top boss — supervises Alex Baguma,
 * System Support Manager, PA to PC, Project Accountant and Ryan Karl directly.
 *
 * Rules:
 * - isSupervisor: true  -> cross-facility management panels; Annex A supervisory reviews
 * - isSupervisor: false -> STRICTLY reviewed only by staff from their same facility
 */
export const DEFAULT_ROSTER: Person[] = [

  // ═══════════════════════════════════════════════════════════════════════
  // TOP MANAGEMENT
  // ═══════════════════════════════════════════════════════════════════════
  { id: 'EMP-PC1', name: 'PC',                  department: 'Project Coordination & Transport', role: 'Project Coordinator',       email: 'pc@org.project',                  facility: 'Kampala', isSupervisor: true },

  // ═══════════════════════════════════════════════════════════════════════
  // KAMPALA HQ — SUPERVISORS & MANAGERS
  // ═══════════════════════════════════════════════════════════════════════
  { id: 'EMP-S01', name: 'Alex Baguma',         department: 'Operations & Field Services',      role: 'Head of Operations',        email: 'alex.baguma@org.project',         facility: 'Kampala', isSupervisor: true },
  { id: 'EMP-S02', name: 'Nantume Catherine',   department: 'Communications & PR',              role: 'Communications Manager',    email: 'nantume.catherine@org.project',   facility: 'Kampala', isSupervisor: true },
  { id: 'EMP-S03', name: 'Nalwanga Doris',      department: 'Customer Care & Front Office',     role: 'Customer Care Supervisor',  email: 'nalwanga.doris@org.project',      facility: 'Kampala', isSupervisor: true },
  { id: 'EMP-S04', name: 'Ingabire Pamella',    department: 'Operations & Field Services',      role: 'Field Operations Manager',  email: 'ingabire.pamella@org.project',    facility: 'Kampala', isSupervisor: true },
  { id: 'EMP-S05', name: 'Catherine Komujuni',  department: 'Operations & Field Services',      role: 'Operations Supervisor',     email: 'catherine.komujuni@org.project',  facility: 'Kampala', isSupervisor: true },
  { id: 'EMP-S06', name: 'Clare Tukahiirwa',    department: 'Technical & IT Support',           role: 'System Support Manager',    email: 'clare.tukahiirwa@org.project',    facility: 'Kampala', isSupervisor: true },
  { id: 'EMP-S07', name: 'Dickson Muhangi',     department: 'Technical & IT Support',           role: 'Production Manager',        email: 'dickson.muhangi@org.project',     facility: 'Kampala', isSupervisor: true },
  { id: 'EMP-S08', name: 'Basuna Julius',       department: 'Quality Assurance',                role: 'Quality Assurance Manager', email: 'basuna.julius@org.project',       facility: 'Kampala', isSupervisor: true },
  { id: 'EMP-S09', name: 'Peterson Mandera',    department: 'Operations & Field Services',      role: 'Mobile Enrolment Supervisor', email: 'peterson.mandera@org.project',  facility: 'Kampala', isSupervisor: true },
  { id: 'EMP-S10', name: 'Dan Lubega',          department: 'Administration & Stores',          role: 'Stock Controller',          email: 'dan.lubega@org.project',          facility: 'Kampala', isSupervisor: true },
  { id: 'EMP-S11', name: 'Nalubowa Victoria',   department: 'Project Coordination & Transport', role: 'PA to PC',                  email: 'nalubowa.victoria@org.project',   facility: 'Kampala', isSupervisor: true },

  // ═══════════════════════════════════════════════════════════════════════
  // KAMPALA HQ — RECEPTION (Supervisor: Catherine Komujuni)
  // ═══════════════════════════════════════════════════════════════════════
  { id: 'EMP-R01', name: 'Daniel Ssesanga',     department: 'Customer Care & Front Office',  role: 'Reception Rep',            email: 'daniel.ssesanga@org.project',     facility: 'Kampala', isSupervisor: false },
  { id: 'EMP-R02', name: 'Nancy Nambi',         department: 'Customer Care & Front Office',  role: 'Reception Rep',            email: 'nancy.nambi@org.project',         facility: 'Kampala', isSupervisor: false },
  { id: 'EMP-R03', name: 'Patricia Akiror',     department: 'Customer Care & Front Office',  role: 'Reception Rep',            email: 'patricia.akiror@org.project',     facility: 'Kampala', isSupervisor: false },
  { id: 'EMP-R04', name: 'Joshua Muwanguzi',    department: 'Customer Care & Front Office',  role: 'Reception Rep',            email: 'joshua.muwanguzi@org.project',    facility: 'Kampala', isSupervisor: false },
  { id: 'EMP-R05', name: 'Vanessa Kaitesi',     department: 'Customer Care & Front Office',  role: 'Reception Rep',            email: 'vanessa.kaitesi@org.project',     facility: 'Kampala', isSupervisor: false },
  { id: 'EMP-R06', name: 'Dison Galandi',       department: 'Customer Care & Front Office',  role: 'Reception Rep',            email: 'dison.galandi@org.project',       facility: 'Kampala', isSupervisor: false },
  { id: 'EMP-R07', name: 'Martha Wanyama',      department: 'Customer Care & Front Office',  role: 'Reception Rep',            email: 'martha.wanyama@org.project',      facility: 'Kampala', isSupervisor: false },

  // ═══════════════════════════════════════════════════════════════════════
  // KAMPALA HQ — ENROLMENT (Supervisor: Peterson Mandera — load-share with Catherine)
  // ═══════════════════════════════════════════════════════════════════════
  { id: 'EMP-E01', name: 'Priscilla Atukunda',  department: 'Operations & Field Services',   role: 'Enrolment Operator',       email: 'priscilla.atukunda@org.project',  facility: 'Kampala', isSupervisor: false },
  { id: 'EMP-E02', name: 'Hajara Nalinya',      department: 'Operations & Field Services',   role: 'Enrolment Operator',       email: 'hajara.nalinya@org.project',      facility: 'Kampala', isSupervisor: false },
  { id: 'EMP-E03', name: 'Herbert Serunkuuma',  department: 'Operations & Field Services',   role: 'Enrolment Operator',       email: 'herbert.serunkuuma@org.project',  facility: 'Kampala', isSupervisor: false },
  { id: 'EMP-E04', name: 'Jackie Kabaka',       department: 'Operations & Field Services',   role: 'Enrolment Operator',       email: 'jackie.kabaka@org.project',       facility: 'Kampala', isSupervisor: false },
  { id: 'EMP-E05', name: 'Annabel Kiconco',     department: 'Operations & Field Services',   role: 'Enrolment Operator',       email: 'annabel.kiconco@org.project',     facility: 'Kampala', isSupervisor: false },
  { id: 'EMP-E06', name: 'Annet Baidhi',        department: 'Operations & Field Services',   role: 'Enrolment Operator',       email: 'annet.baidhi@org.project',        facility: 'Kampala', isSupervisor: false },
  { id: 'EMP-E07', name: 'Brian Kafuko',        department: 'Operations & Field Services',   role: 'Enrolment Operator',       email: 'brian.kafuko@org.project',        facility: 'Kampala', isSupervisor: false },
  { id: 'EMP-E08', name: 'Geoffrey Akaija',     department: 'Operations & Field Services',   role: 'Enrolment Operator',       email: 'geoffrey.akaija@org.project',     facility: 'Kampala', isSupervisor: false },
  { id: 'EMP-E09', name: 'Phionah Karungi',     department: 'Operations & Field Services',   role: 'Enrolment Operator / VIP', email: 'phionah.karungi@org.project',     facility: 'Kampala', isSupervisor: false },
  { id: 'EMP-E10', name: 'Janet Kabacunguzi',   department: 'Operations & Field Services',   role: 'Enrolment Operator',       email: 'janet.kabacunguzi@org.project',   facility: 'Kampala', isSupervisor: false },
  { id: 'EMP-E11', name: 'Patience Nyakato',    department: 'Operations & Field Services',   role: 'Enrolment Operator',       email: 'patience.nyakato@org.project',    facility: 'Kampala', isSupervisor: false },
  { id: 'EMP-E12', name: 'Donald Taremwa',      department: 'Operations & Field Services',   role: 'Enrolment Operator',       email: 'donald.taremwa@org.project',      facility: 'Kampala', isSupervisor: false },
  { id: 'EMP-E13', name: 'Herbert Rukundo',     department: 'Operations & Field Services',   role: 'Enrolment Operator',       email: 'herbert.rukundo@org.project',     facility: 'Kampala', isSupervisor: false },
  { id: 'EMP-E14', name: 'Susan Namugenyi',     department: 'Operations & Field Services',   role: 'Enrolment Operator',       email: 'susan.namugenyi@org.project',     facility: 'Kampala', isSupervisor: false },
  { id: 'EMP-E15', name: 'Martha Mutunda',      department: 'Operations & Field Services',   role: 'Enrolment Operator',       email: 'martha.mutunda@org.project',      facility: 'Kampala', isSupervisor: false },
  { id: 'EMP-E16', name: 'Salwah Magala',       department: 'Operations & Field Services',   role: 'Enrolment Operator',       email: 'salwah.magala@org.project',       facility: 'Kampala', isSupervisor: false },
  { id: 'EMP-E17', name: 'Sharon Natuha',       department: 'Operations & Field Services',   role: 'Enrolment Operator',       email: 'sharon.natuha@org.project',       facility: 'Kampala', isSupervisor: false },
  { id: 'EMP-E18', name: 'Josephine Nakanwagi', department: 'Operations & Field Services',   role: 'Enrolment Operator',       email: 'josephine.nakanwagi@org.project', facility: 'Kampala', isSupervisor: false },
  { id: 'EMP-E19', name: 'Moses Gumisiriza',    department: 'Operations & Field Services',   role: 'Enrolment Operator',       email: 'moses.gumisiriza@org.project',    facility: 'Kampala', isSupervisor: false },
  { id: 'EMP-E20', name: 'Brenda Nakimbugwe',   department: 'Operations & Field Services',   role: 'Enrolment Operator',       email: 'brenda.nakimbugwe@org.project',   facility: 'Kampala', isSupervisor: false },
  { id: 'EMP-E21', name: 'Carlo Atum Lwanga',   department: 'Operations & Field Services',   role: 'Enrolment Operator',       email: 'carlo.atumlwanga@org.project',    facility: 'Kampala', isSupervisor: false },
  { id: 'EMP-E22', name: 'Dorris Nalumansi',    department: 'Operations & Field Services',   role: 'Enrolment Operator',       email: 'dorris.nalumansi@org.project',    facility: 'Kampala', isSupervisor: false },
  { id: 'EMP-E23', name: 'Godfrey Tamale',      department: 'Operations & Field Services',   role: 'Enrolment Operator',       email: 'godfrey.tamale@org.project',      facility: 'Kampala', isSupervisor: false },

  // ═══════════════════════════════════════════════════════════════════════
  // KAMPALA HQ — APPROVAL (Supervisor: Catherine Komujuni)
  // ═══════════════════════════════════════════════════════════════════════
  { id: 'EMP-A01', name: 'Rachel Mirembe',      department: 'Operations & Field Services',   role: 'Approval Officer',         email: 'rachel.mirembe@org.project',      facility: 'Kampala', isSupervisor: false },
  { id: 'EMP-A02', name: 'Lawrence Okello',     department: 'Operations & Field Services',   role: 'Approval Officer',         email: 'lawrence.okello@org.project',     facility: 'Kampala', isSupervisor: false },
  { id: 'EMP-A03', name: 'Aisha Nanfuka',       department: 'Operations & Field Services',   role: 'Approval Officer',         email: 'aisha.nanfuka@org.project',       facility: 'Kampala', isSupervisor: false },
  { id: 'EMP-A04', name: 'Yuticas Wamaungo',    department: 'Operations & Field Services',   role: 'Approval Officer',         email: 'yuticas.wamaungo@org.project',    facility: 'Kampala', isSupervisor: false },
  { id: 'EMP-A05', name: 'Persis Naigaga',      department: 'Operations & Field Services',   role: 'Approval Officer',         email: 'persis.naigaga@org.project',      facility: 'Kampala', isSupervisor: false },
  { id: 'EMP-A06', name: 'Christine Nambi',     department: 'Operations & Field Services',   role: 'Approval Officer',         email: 'christine.nambi@org.project',     facility: 'Kampala', isSupervisor: false },
  { id: 'EMP-A07', name: 'Caroline Atai',       department: 'Operations & Field Services',   role: 'Approval Officer',         email: 'caroline.atai@org.project',       facility: 'Kampala', isSupervisor: false },

  // ═══════════════════════════════════════════════════════════════════════
  // KAMPALA HQ — DL RECEIPT & ISSUANCE (Supervisor: Catherine Komujuni)
  // ═══════════════════════════════════════════════════════════════════════
  { id: 'EMP-D01', name: 'Frankline Katwesigye',department: 'Operations & Field Services',   role: 'DL Issuance Officer',      email: 'frankline.katwesigye@org.project',facility: 'Kampala', isSupervisor: false },
  { id: 'EMP-D02', name: 'Sophia Navvuga',      department: 'Operations & Field Services',   role: 'DL Issuance Officer',      email: 'sophia.navvuga@org.project',      facility: 'Kampala', isSupervisor: false },
  { id: 'EMP-D03', name: 'Asha Mirembe Ariho',  department: 'Operations & Field Services',   role: 'DL Receipt Officer',       email: 'asha.mirembe@org.project',        facility: 'Kampala', isSupervisor: false },
  { id: 'EMP-D04', name: 'Violet Kataike',      department: 'Operations & Field Services',   role: 'DL Receipt Officer',       email: 'violet.kataike@org.project',      facility: 'Kampala', isSupervisor: false },
  { id: 'EMP-D05', name: 'Penninah Tusuubira',  department: 'Operations & Field Services',   role: 'DL Receipt Officer',       email: 'penninah.tusuubira@org.project',  facility: 'Kampala', isSupervisor: false },

  // ═══════════════════════════════════════════════════════════════════════
  // KAMPALA HQ — ORDER BATCHING & PERSONALISATION (Supervisor: Dickson Muhangi)
  // ═══════════════════════════════════════════════════════════════════════
  { id: 'EMP-B01', name: 'Ivan Mutebi',         department: 'Technical & IT Support',        role: 'Order Batching Officer',   email: 'ivan.mutebi@org.project',         facility: 'Kampala', isSupervisor: false },
  { id: 'EMP-B02', name: 'Dorothy Ninsiima',    department: 'Technical & IT Support',        role: 'Personalisation Officer',  email: 'dorothy.ninsiima@org.project',    facility: 'Kampala', isSupervisor: false },

  // ═══════════════════════════════════════════════════════════════════════
  // KAMPALA HQ — SHIPMENT (Supervisor: Dickson Muhangi)
  // ═══════════════════════════════════════════════════════════════════════
  { id: 'EMP-SH1', name: 'Vanancio Ayebazibwe', department: 'Technical & IT Support',        role: 'Shipment Officer',         email: 'vanancio.ayebazibwe@org.project', facility: 'Kampala', isSupervisor: false },
  { id: 'EMP-SH2', name: 'Shannon Nsinga',      department: 'Technical & IT Support',        role: 'Shipment Officer',         email: 'shannon.nsinga@org.project',      facility: 'Kampala', isSupervisor: false },

  // ═══════════════════════════════════════════════════════════════════════
  // KAMPALA HQ — QUALITY ASSURANCE (Supervisor: Basuna Julius)
  // ═══════════════════════════════════════════════════════════════════════
  { id: 'EMP-Q01', name: 'Brian Leju',          department: 'Quality Assurance',             role: 'Quality Assurance Rep',    email: 'brian.leju@org.project',          facility: 'Kampala', isSupervisor: false },
  { id: 'EMP-Q02', name: 'Timothy Kirabo Kateete', department: 'Quality Assurance',          role: 'Quality Assurance Rep',    email: 'timothy.kirabo@org.project',      facility: 'Kampala', isSupervisor: false },

  // ═══════════════════════════════════════════════════════════════════════
  // KAMPALA HQ — CUSTOMER CARE (Supervisor: Nalwanga Doris)
  // Close department: Call Center & Reception
  // ═══════════════════════════════════════════════════════════════════════
  { id: 'EMP-C01', name: 'Tracy Atumo',         department: 'Customer Care & Front Office',  role: 'Customer Care Rep',        email: 'tracy.atumo@org.project',         facility: 'Kampala', isSupervisor: false },
  { id: 'EMP-C02', name: 'Dinah Kabanyoro',     department: 'Customer Care & Front Office',  role: 'Customer Care Rep',        email: 'dinah.kabanyoro@org.project',     facility: 'Kampala', isSupervisor: false },
  { id: 'EMP-C03', name: 'Isaac Asiimwe',       department: 'Customer Care & Front Office',  role: 'Customer Care Rep',        email: 'isaac.asiimwe@org.project',       facility: 'Kampala', isSupervisor: false },
  { id: 'EMP-C04', name: 'Sylvia Nabunya',      department: 'Customer Care & Front Office',  role: 'Customer Care Rep',        email: 'sylvia.nabunya@org.project',      facility: 'Kampala', isSupervisor: false },
  { id: 'EMP-C05', name: 'Doreen Akampwera',    department: 'Customer Care & Front Office',  role: 'Customer Care Rep',        email: 'doreen.akampwera@org.project',    facility: 'Kampala', isSupervisor: false },

  // ═══════════════════════════════════════════════════════════════════════
  // KAMPALA HQ — CALL CENTER (Supervisor: Nalwanga Doris; close dept: Reception)
  // ═══════════════════════════════════════════════════════════════════════
  { id: 'EMP-CC1', name: 'Sherina Umwiza',      department: 'Customer Care & Front Office',  role: 'Call Centre Rep',          email: 'sherina.umwiza@org.project',      facility: 'Kampala', isSupervisor: false },
  { id: 'EMP-CC2', name: 'Richard Abwola',      department: 'Customer Care & Front Office',  role: 'Call Centre Rep',          email: 'richard.abwola@org.project',      facility: 'Kampala', isSupervisor: false },
  { id: 'EMP-CC3', name: 'Grace Ayebale',       department: 'Customer Care & Front Office',  role: 'Call Centre Rep',          email: 'grace.ayebale@org.project',       facility: 'Kampala', isSupervisor: false },

  // ═══════════════════════════════════════════════════════════════════════
  // KAMPALA HQ — TECHNICAL STAFF (Supervisor: Clare Tukahiirwa; Ryan Karl → PC)
  // Close department: All departments
  // ═══════════════════════════════════════════════════════════════════════
  { id: 'EMP-T01', name: 'Francis Eurien',      department: 'Technical & IT Support',        role: 'Technical Team',           email: 'francis.eurien@org.project',      facility: 'Kampala', isSupervisor: false },
  { id: 'EMP-T02', name: 'Protus Badaza Waiswa',department: 'Technical & IT Support',        role: 'Technical Team',           email: 'protus.badaza@org.project',       facility: 'Kampala', isSupervisor: false },
  { id: 'EMP-T03', name: 'Gilbert Obia',        department: 'Technical & IT Support',        role: 'Technical Team',           email: 'gilbert.obia@org.project',        facility: 'Kampala', isSupervisor: false },
  { id: 'EMP-T04', name: 'Ryan Karl Borinaga',  department: 'Technical & IT Support',        role: 'Technical Team',           email: 'ryan.karl@org.project',           facility: 'Kampala', isSupervisor: false },
  { id: 'EMP-T05', name: 'Allan Agong',         department: 'Technical & IT Support',        role: 'Technical Team',           email: 'allan.agong@org.project',         facility: 'Kampala', isSupervisor: false },
  { id: 'EMP-T06', name: 'Richard Muwanguzi',   department: 'Technical & IT Support',        role: 'Technical Team',           email: 'richard.muwanguzi@org.project',   facility: 'Kampala', isSupervisor: false },
  { id: 'EMP-T07', name: 'Caroline Muhirwe',    department: 'Technical & IT Support',        role: 'Technical Team',           email: 'caroline.muhirwe@org.project',    facility: 'Kampala', isSupervisor: false },
  { id: 'EMP-T08', name: 'Janan Asingye',       department: 'Technical & IT Support',        role: 'Technical Team',           email: 'janan.asingye@org.project',       facility: 'Kampala', isSupervisor: false },

  // ═══════════════════════════════════════════════════════════════════════
  // JINJA BRANCH
  // ═══════════════════════════════════════════════════════════════════════
  { id: 'EMP-J01', name: 'Tumusiime Abraham',   department: 'Facility Supervision',          role: 'Facility Supervisor',      email: 'tumusiime.abraham@org.project',   facility: 'Jinja',   isSupervisor: true  },
  { id: 'EMP-J02', name: 'Kabahuma Nuuru',      department: 'Operations & Field Services',   role: 'Enrolment Operator',       email: 'kabahuma.nuuru@org.project',      facility: 'Jinja',   isSupervisor: false },
  { id: 'EMP-J03', name: 'Mugoowa Nasiifu',     department: 'Customer Care & Front Office',  role: 'Reception / DL Issuance',  email: 'mugoowa.nasiifu@org.project',     facility: 'Jinja',   isSupervisor: false },
  { id: 'EMP-J04', name: 'Ategeka Caroline',    department: 'Operations & Field Services',   role: 'Enrolment Operator',       email: 'ategeka.caroline@org.project',    facility: 'Jinja',   isSupervisor: false },
  { id: 'EMP-J05', name: 'Hildah Nabeta Nabuya',department: 'Administration & Stores',       role: 'Office Assistant',         email: 'hildah.nabeta@org.project',       facility: 'Jinja',   isSupervisor: false },
  { id: 'EMP-J06', name: 'Manica Kalembe',      department: 'Customer Care & Front Office',  role: 'DL Issuance / Reception',  email: 'manica.kalembe@org.project',      facility: 'Jinja',   isSupervisor: false },
  { id: 'EMP-J07', name: 'Pauline Nakato',      department: 'Operations & Field Services',   role: 'Enrolment Operator',       email: 'pauline.nakato@org.project',      facility: 'Jinja',   isSupervisor: false },

  // ═══════════════════════════════════════════════════════════════════════
  // MBALE BRANCH
  // ═══════════════════════════════════════════════════════════════════════
  { id: 'EMP-M01', name: 'Alice Nairima',       department: 'Facility Supervision',          role: 'Facility Supervisor',      email: 'alice.nairima@org.project',       facility: 'Mbale',   isSupervisor: true  },
  { id: 'EMP-M02', name: 'Sharon K. Chemutai',  department: 'Operations & Field Services',   role: 'Enrolment Operator',       email: 'sharon.chemutai@org.project',     facility: 'Mbale',   isSupervisor: false },
  { id: 'EMP-M03', name: 'Omongole Harbert',    department: 'Operations & Field Services',   role: 'Enrolment Operator',       email: 'omongole.harbert@org.project',    facility: 'Mbale',   isSupervisor: false },
  { id: 'EMP-M04', name: 'Ashraf Kasule',       department: 'Operations & Field Services',   role: 'Enrolment Operator',       email: 'ashraf.kasule@org.project',       facility: 'Mbale',   isSupervisor: false },
  { id: 'EMP-M05', name: 'Evelyn L. Kiconco',   department: 'Customer Care & Front Office',  role: 'Reception Rep',            email: 'evelyn.kiconco@org.project',      facility: 'Mbale',   isSupervisor: false },
  { id: 'EMP-M06', name: 'Mercy Kirabo',        department: 'Customer Care & Front Office',  role: 'DL Issuance Officer',      email: 'mercy.kirabo@org.project',        facility: 'Mbale',   isSupervisor: false },
  { id: 'EMP-M07', name: 'Henry O. Ofungi',     department: 'Administration & Stores',       role: 'Office Assistant',         email: 'henry.ofungi@org.project',        facility: 'Mbale',   isSupervisor: false },

  // ═══════════════════════════════════════════════════════════════════════
  // GULU BRANCH
  // ═══════════════════════════════════════════════════════════════════════
  { id: 'EMP-G01', name: 'Emmanuel Atine',      department: 'Facility Supervision',          role: 'Facility Supervisor',      email: 'emmanuel.atine@org.project',      facility: 'Gulu',    isSupervisor: true  },
  { id: 'EMP-G02', name: 'David Otala',         department: 'Operations & Field Services',   role: 'Enrolment / DL Issuance',  email: 'david.otala@org.project',         facility: 'Gulu',    isSupervisor: false },
  { id: 'EMP-G03', name: 'Everlyn Apiyo Otim',  department: 'Operations & Field Services',   role: 'Enrolment Operator',       email: 'everlyn.apiyo@org.project',       facility: 'Gulu',    isSupervisor: false },
  { id: 'EMP-G04', name: 'Aziizi Owoyesigire',  department: 'Customer Care & Front Office',  role: 'Reception / DL Issuance',  email: 'aziizi.owoyesigire@org.project',  facility: 'Gulu',    isSupervisor: false },
  { id: 'EMP-G05', name: 'Vicky Abur',          department: 'Customer Care & Front Office',  role: 'Reception / DL Issuance',  email: 'vicky.abur@org.project',          facility: 'Gulu',    isSupervisor: false },

  // ═══════════════════════════════════════════════════════════════════════
  // ARUA BRANCH
  // ═══════════════════════════════════════════════════════════════════════
  { id: 'EMP-AR1', name: 'Anna Nimaro Laker',   department: 'Facility Supervision',          role: 'Facility Supervisor',      email: 'anna.nimaro@org.project',         facility: 'Arua',    isSupervisor: true  },
  { id: 'EMP-AR2', name: 'Gilbert Metaloro',    department: 'Operations & Field Services',   role: 'Enrolment Operator',       email: 'gilbert.metaloro@org.project',    facility: 'Arua',    isSupervisor: false },
  { id: 'EMP-AR3', name: 'Samuel Oyako',        department: 'Customer Care & Front Office',  role: 'DL Issuance Officer',      email: 'samuel.oyako@org.project',        facility: 'Arua',    isSupervisor: false },
  { id: 'EMP-AR4', name: 'Brian Charles Mukisa',department: 'Customer Care & Front Office',  role: 'Reception Rep',            email: 'brian.mukisa@org.project',        facility: 'Arua',    isSupervisor: false },
  { id: 'EMP-AR5', name: 'Daphine Zalwango',    department: 'Customer Care & Front Office',  role: 'DL Issuance Officer',      email: 'daphine.zalwango@org.project',    facility: 'Arua',    isSupervisor: false },

  // ═══════════════════════════════════════════════════════════════════════
  // FORT PORTAL BRANCH
  // ═══════════════════════════════════════════════════════════════════════
  { id: 'EMP-FP1', name: 'Julius Sserunjoji',   department: 'Facility Supervision',          role: 'Facility Supervisor',      email: 'julius.sserunjoji@org.project',   facility: 'Fort Portal', isSupervisor: true  },
  { id: 'EMP-FP2', name: 'Agatha Komuhendo',    department: 'Operations & Field Services',   role: 'Enrolment Operator',       email: 'agatha.komuhendo@org.project',    facility: 'Fort Portal', isSupervisor: false },
  { id: 'EMP-FP3', name: 'Patience Karuhanga',  department: 'Operations & Field Services',   role: 'Enrolment Operator',       email: 'patience.karuhanga@org.project',  facility: 'Fort Portal', isSupervisor: false },
  { id: 'EMP-FP4', name: 'Nuslah Kabasinguzi',  department: 'Customer Care & Front Office',  role: 'Reception / DL Issuance',  email: 'nuslah.kabasinguzi@org.project',  facility: 'Fort Portal', isSupervisor: false },
  { id: 'EMP-FP5', name: 'Deogratious Kisembo', department: 'Customer Care & Front Office',  role: 'Reception / DL Issuance',  email: 'deogratious.kisembo@org.project', facility: 'Fort Portal', isSupervisor: false },
  { id: 'EMP-FP6', name: 'Kaahwa Atuhurra',     department: 'Administration & Stores',       role: 'Office Assistant',         email: 'kaahwa.atuhurra@org.project',     facility: 'Fort Portal', isSupervisor: false },

  // ═══════════════════════════════════════════════════════════════════════
  // MBARARA BRANCH
  // ═══════════════════════════════════════════════════════════════════════
  { id: 'EMP-MB1', name: 'Marion Birungi',      department: 'Facility Supervision',          role: 'Facility Supervisor',      email: 'marion.birungi@org.project',      facility: 'Mbarara', isSupervisor: true  },
  { id: 'EMP-MB2', name: 'Masereka Morris',     department: 'Operations & Field Services',   role: 'Enrolment Operator',       email: 'masereka.morris@org.project',     facility: 'Mbarara', isSupervisor: false },
  { id: 'EMP-MB3', name: 'Kizza Nsamba Andrew', department: 'Operations & Field Services',   role: 'Enrolment Operator',       email: 'kizza.nsamba@org.project',        facility: 'Mbarara', isSupervisor: false },
  { id: 'EMP-MB4', name: 'Nangumba Joshua',     department: 'Customer Care & Front Office',  role: 'Reception Rep',            email: 'nangumba.joshua@org.project',     facility: 'Mbarara', isSupervisor: false },
  { id: 'EMP-MB5', name: 'Akandwanaho Faith',   department: 'Operations & Field Services',   role: 'Enrolment Operator',       email: 'akandwanaho.faith@org.project',   facility: 'Mbarara', isSupervisor: false },
  { id: 'EMP-MB6', name: 'Francis Lukwago',     department: 'Customer Care & Front Office',  role: 'Reception Rep',            email: 'francis.lukwago@org.project',     facility: 'Mbarara', isSupervisor: false },
  { id: 'EMP-MB7', name: 'Jollen Nahamya',      department: 'Customer Care & Front Office',  role: 'Reception Rep',            email: 'jollen.nahamya@org.project',      facility: 'Mbarara', isSupervisor: false },
  { id: 'EMP-MB8', name: 'Alfred Buhungiro',    department: 'Operations & Field Services',   role: 'Enrolment Operator',       email: 'alfred.buhungiro@org.project',    facility: 'Mbarara', isSupervisor: false },
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
    const dept = depts[idCounter % depts.length];
    const facility = facilities[idCounter % facilities.length];
    result.push({
      id: `EMP-GEN-${String(idCounter).padStart(3, '0')}`,
      name: `Staff Member ${idCounter}`,
      department: dept,
      role: 'Operations Support Officer',
      email: `staff${idCounter}@org.project`,
      facility,
      isSupervisor: false,
    });
    idCounter++;
  }

  return result;
}
