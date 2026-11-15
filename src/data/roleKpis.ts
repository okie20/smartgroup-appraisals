/**
 * Role-specific Core KPI questions (Section A).
 * Each entry maps a set of role keywords to 5 (or 4) KPI rating items.
 * The form matches the reviewee's role against `roleMatches` (case-insensitive
 * substring check) and injects the matching KPIs as "Section A: Core KPIs"
 * before the standard Section B behaviour ratings.
 */

export interface RoleKpiItem {
  id: string;
  title: string;
  description: string;
  lowLabel: string;
  highLabel: string;
}

export interface RoleKpiGroup {
  /** Display name shown as the section sub-heading, e.g. "Communications Manager" */
  roleLabel: string;
  /** Substrings to match against Person.role (case-insensitive) */
  roleMatches: string[];
  kpis: RoleKpiItem[];
}

export const ROLE_KPI_GROUPS: RoleKpiGroup[] = [
  // ── Communications Manager ──────────────────────────────────────────────────
  {
    roleLabel: 'Communications Manager',
    roleMatches: ['communications manager'],
    kpis: [
      {
        id: 'kpi-comm-accuracy',
        title: 'Accuracy & Brand Representation',
        description:
          'Rate how consistently the employee ensures information shared, published or printed (internally and externally) is accurate and represents the organisation\'s values.',
        lowLabel: 'Frequent inaccuracies / off-brand',
        highLabel: 'Consistently accurate and on-brand',
      },
      {
        id: 'kpi-comm-strategy',
        title: 'Communications Strategy & Brand Stewardship',
        description:
          'Rate the employee\'s effectiveness in shaping communications strategy and safeguarding the organisation\'s brand image, identity and reputation.',
        lowLabel: 'No clear strategy',
        highLabel: 'Excellent brand stewardship',
      },
      {
        id: 'kpi-comm-media',
        title: 'External & Media Engagement',
        description:
          'Rate how effectively the employee manages the organisation\'s engagement with the public, media, and external stakeholders.',
        lowLabel: 'Weak external engagement',
        highLabel: 'Outstanding media relations',
      },
      {
        id: 'kpi-comm-support',
        title: 'Support to Customer Care & Operations',
        description:
          'Rate how well the employee supports Customer Care and Operations teams through training, guidance and effective procedures to better serve customers.',
        lowLabel: 'Little support provided',
        highLabel: 'Excellent cross-team support',
      },
      {
        id: 'kpi-comm-crisis',
        title: 'Crisis & Disruption Communication',
        description:
          'Rate the employee\'s timeliness and clarity in communicating during service disruptions or crises.',
        lowLabel: 'Slow / unclear under crisis',
        highLabel: 'Timely and clear every time',
      },
    ],
  },

  // ── Customer Care Supervisor ────────────────────────────────────────────────
  {
    roleLabel: 'Customer Care Supervisor',
    roleMatches: ['customer care supervisor'],
    kpis: [
      {
        id: 'kpi-ccs-supervision',
        title: 'Call Centre & Customer Desk Supervision',
        description:
          'Rate how effectively the employee supervises and monitors call centre and customer desk operations, addressing challenges as they arise.',
        lowLabel: 'Reactive, issues often unresolved',
        highLabel: 'Proactive, issues addressed swiftly',
      },
      {
        id: 'kpi-ccs-team',
        title: 'Team Collaboration & Coherence',
        description:
          'Rate how well the employee builds trust and open communication within the customer service team.',
        lowLabel: 'Team lacks cohesion / trust',
        highLabel: 'Highly collaborative, trusted team',
      },
      {
        id: 'kpi-ccs-reporting',
        title: 'Customer Insight Reporting',
        description:
          'Rate the employee\'s effectiveness in compiling and reporting customer feedback and satisfaction insights to management.',
        lowLabel: 'Reports rarely produced or unclear',
        highLabel: 'Timely, insightful, actionable reports',
      },
      {
        id: 'kpi-ccs-accuracy',
        title: 'Accuracy of Customer-Facing Information',
        description:
          'Rate how well the employee ensures accuracy of publicised information, social content and brand materials relating to customer care.',
        lowLabel: 'Frequent inaccuracies',
        highLabel: 'Consistently accurate and on-brand',
      },
      {
        id: 'kpi-ccs-quality',
        title: 'Consistent Service Quality & Process Improvement',
        description:
          'Rate how effectively the employee promotes quality customer service delivery and contributes to improving service processes.',
        lowLabel: 'Inconsistent service, little improvement',
        highLabel: 'Consistently high quality, strong improvements',
      },
    ],
  },

  // ── Facility Supervisor ────────────────────────────────────────────────────
  {
    roleLabel: 'Facility Supervisor',
    roleMatches: ['facility supervisor'],
    kpis: [
      {
        id: 'kpi-fs-ops',
        title: 'Facility Operations Management',
        description:
          'Rate how effectively the employee manages day-to-day facility operations, including opening, closing, and routine supplies/inventory oversight.',
        lowLabel: 'Poor day-to-day management',
        highLabel: 'Excellent facility management',
      },
      {
        id: 'kpi-fs-training',
        title: 'Staff Training & Supervision',
        description:
          'Rate how well the employee trains, schedules, and supervises facility staff to ensure efficient execution of duties.',
        lowLabel: 'Poor training and scheduling',
        highLabel: 'Staff well trained and supervised',
      },
      {
        id: 'kpi-fs-reporting',
        title: 'Performance Reporting',
        description:
          'Rate the employee\'s timeliness and quality in submitting monthly performance reports and maintaining communication with management.',
        lowLabel: 'Reports late or missing',
        highLabel: 'Reports timely and high quality',
      },
      {
        id: 'kpi-fs-safety',
        title: 'Safety & Health Compliance',
        description:
          'Rate how well the employee ensures the facility and staff comply with safety and health regulations.',
        lowLabel: 'Frequent safety gaps',
        highLabel: 'Fully compliant at all times',
      },
      {
        id: 'kpi-fs-customer',
        title: 'Customer Service & Complaint Handling',
        description:
          'Rate how well the employee ensures staff deliver excellent customer service and handle complaints professionally.',
        lowLabel: 'Complaints poorly handled',
        highLabel: 'Complaints handled promptly and professionally',
      },
    ],
  },

  // ── Field Operations Manager ───────────────────────────────────────────────
  {
    roleLabel: 'Field Operations Manager',
    roleMatches: ['field operations manager'],
    kpis: [
      {
        id: 'kpi-fom-oversight',
        title: 'Regional Operations Oversight & Reporting',
        description:
          'Rate how effectively the employee monitors operations across regional offices and reports on performance to management.',
        lowLabel: 'Oversight / reporting weak',
        highLabel: 'Thorough oversight, insightful reporting',
      },
      {
        id: 'kpi-fom-resources',
        title: 'Resource & Inventory Management',
        description:
          'Rate how well the employee ensures regional offices are adequately equipped and resources / inventory are properly accounted for.',
        lowLabel: 'Frequent shortages, poor accountability',
        highLabel: 'Offices well equipped, resources fully accounted',
      },
      {
        id: 'kpi-fom-customer',
        title: 'Customer Satisfaction Monitoring',
        description:
          'Rate how effectively the employee gathers and acts on customer feedback across project sites.',
        lowLabel: 'Rarely monitors satisfaction',
        highLabel: 'Consistently monitors and acts on feedback',
      },
      {
        id: 'kpi-fom-safety',
        title: 'Safety & Compliance',
        description:
          'Rate how well the employee maintains a safe, healthy, and legally compliant work environment.',
        lowLabel: 'Frequent safety / compliance gaps',
        highLabel: 'Consistently safe and fully compliant',
      },
      {
        id: 'kpi-fom-workflow',
        title: 'Workflow & Staffing Efficiency',
        description:
          'Rate how effectively the employee identifies inefficiencies, improves workflows, and coordinates staff scheduling across sites.',
        lowLabel: 'Inefficiencies unaddressed',
        highLabel: 'Proactively improves workflows and staffing',
      },
    ],
  },

  // ── Head of Operations ─────────────────────────────────────────────────────
  {
    roleLabel: 'Head of Operations',
    roleMatches: ['head of operations'],
    kpis: [
      {
        id: 'kpi-hoo-process',
        title: 'Process & Workflow Management',
        description:
          'Rate how effectively the employee analyzes, evaluates and improves operational workflows and processes.',
        lowLabel: 'Rarely reviews workflows',
        highLabel: 'Consistently implements improvements',
      },
      {
        id: 'kpi-hoo-planning',
        title: 'Planning & Change Management',
        description:
          'Rate the employee\'s effectiveness in long-term planning, project status reporting, and implementing change control processes.',
        lowLabel: 'Poor planning, changes poorly managed',
        highLabel: 'Strong planning, changes smoothly implemented',
      },
      {
        id: 'kpi-hoo-resources',
        title: 'Resource & Operational Readiness',
        description:
          'Rate how well the employee ensures all offices and departments have the resources needed to remain fully operational.',
        lowLabel: 'Offices frequently under-resourced',
        highLabel: 'Offices consistently well-resourced',
      },
      {
        id: 'kpi-hoo-finance',
        title: 'Financial & Inventory Oversight',
        description:
          'Rate the employee\'s effectiveness in managing project inventory, petty cash, replenishment, and reviewing operational invoices.',
        lowLabel: 'Poor oversight, frequent discrepancies',
        highLabel: 'Strong oversight, consistently accurate',
      },
      {
        id: 'kpi-hoo-customer',
        title: 'Customer Satisfaction & Service Delivery',
        description:
          'Rate how well the employee monitors customer satisfaction, supervises staff, and ensures effective, consistent service delivery.',
        lowLabel: 'Satisfaction and delivery inconsistent',
        highLabel: 'Satisfaction high, delivery consistently effective',
      },
    ],
  },

  // ── IT Coordinator ─────────────────────────────────────────────────────────
  {
    roleLabel: 'IT Coordinator',
    roleMatches: ['it coordinator'],
    kpis: [
      {
        id: 'kpi-itc-technical',
        title: 'Technical Coordination',
        description:
          'Rate how effectively the employee collaborates with the technical support team to resolve issues and requests in a timely manner.',
        lowLabel: 'Slow, poor collaboration',
        highLabel: 'Fast, highly effective collaboration',
      },
      {
        id: 'kpi-itc-docs',
        title: 'Process Documentation',
        description:
          'Rate the accuracy and completeness of the employee\'s documentation of installation and configuration processes.',
        lowLabel: 'Documentation incomplete or inaccurate',
        highLabel: 'Documentation thorough and accurate',
      },
      {
        id: 'kpi-itc-access',
        title: 'Access Management & Segregation of Duties',
        description:
          'Rate how well the employee implements segregation-of-duties and trains users on login/access procedures.',
        lowLabel: 'SOD poorly implemented',
        highLabel: 'SOD fully implemented, users well trained',
      },
      {
        id: 'kpi-itc-monitoring',
        title: 'System Monitoring & Support',
        description:
          'Rate the employee\'s effectiveness in monitoring system performance and maintaining network / system integrity.',
        lowLabel: 'Issues frequently missed',
        highLabel: 'Systems proactively monitored',
      },
      {
        id: 'kpi-itc-policy',
        title: 'IT Policy & Administrative Support',
        description:
          'Rate how well the employee supports implementation of and compliance with IT policies.',
        lowLabel: 'Little support or compliance',
        highLabel: 'Strong support, full compliance',
      },
    ],
  },

  // ── Mobile Enrolment Supervisor ────────────────────────────────────────────
  {
    roleLabel: 'Mobile Enrolment Supervisor',
    roleMatches: ['mobile enrolment supervisor', 'mobile enrollment supervisor'],
    kpis: [
      {
        id: 'kpi-mes-enrolment',
        title: 'Enrolment Activity Oversight & Data Accuracy',
        description:
          'Rate how effectively the employee oversees mobile enrolment activities and ensures data accuracy, including equipment handling.',
        lowLabel: 'Frequent errors, poor oversight',
        highLabel: 'Highly accurate, well-managed activities',
      },
      {
        id: 'kpi-mes-scheduling',
        title: 'Staff Scheduling & Field Coordination',
        description:
          'Rate how well the employee manages staff schedules and rotas for smooth field operations.',
        lowLabel: 'Scheduling frequently disrupts operations',
        highLabel: 'Scheduling consistently smooth',
      },
      {
        id: 'kpi-mes-reporting',
        title: 'Field Reporting & Communication',
        description:
          'Rate the employee\'s timeliness and quality of reporting and communication with the head office during field activities.',
        lowLabel: 'Reporting / communication weak',
        highLabel: 'Reporting / communication timely and clear',
      },
      {
        id: 'kpi-mes-stakeholders',
        title: 'Stakeholder & Customer Service Management',
        description:
          'Rate how well the employee manages stakeholder expectations and ensures excellent customer service in the field.',
        lowLabel: 'Stakeholders / customers poorly served',
        highLabel: 'Stakeholders / customers consistently well served',
      },
      {
        id: 'kpi-mes-safety',
        title: 'Health & Safety Compliance',
        description:
          'Rate how well the employee ensures mobile enrolment activities comply with health and safety regulations.',
        lowLabel: 'Frequent non-compliance',
        highLabel: 'Full, consistent compliance',
      },
    ],
  },

  // ── PA to PC ───────────────────────────────────────────────────────────────
  {
    roleLabel: 'PA to PC',
    roleMatches: ['pa to pc'],
    kpis: [
      {
        id: 'kpi-pa-clerical',
        title: 'Clerical & Records Accuracy',
        description:
          'Rate how accurately and promptly the employee completes clerical duties and manages records / paperwork.',
        lowLabel: 'Frequently inaccurate or late',
        highLabel: 'Consistently accurate and timely',
      },
      {
        id: 'kpi-pa-meetings',
        title: 'Meeting & Activity Coordination',
        description:
          'Rate how effectively the employee coordinates meetings and other departmental activities.',
        lowLabel: 'Poorly coordinated, frequent issues',
        highLabel: 'Smooth, well-organised coordination',
      },
      {
        id: 'kpi-pa-packages',
        title: 'Package Management & Delivery',
        description:
          'Rate the employee\'s timeliness and accuracy in tracking, distributing and delivering packages.',
        lowLabel: 'Packages often delayed or mismanaged',
        highLabel: 'Packages consistently tracked and delivered on time',
      },
      {
        id: 'kpi-pa-admin',
        title: 'Administrative Support & Follow-up',
        description:
          'Rate how well the employee provides administrative support to management and follows up on action points.',
        lowLabel: 'Requests often missed or untracked',
        highLabel: 'Requests consistently tracked and followed up',
      },
    ],
  },

  // ── Project Accountant ─────────────────────────────────────────────────────
  {
    roleLabel: 'Project Accountant',
    roleMatches: ['project accountant', 'accountant'],
    kpis: [
      {
        id: 'kpi-pac-budget',
        title: 'Budget Management & Compliance',
        description:
          'Rate the employee\'s effectiveness in managing budgets, ensuring compliance with finance/procurement guidelines, and reporting on utilisation.',
        lowLabel: 'Frequent non-compliance, poor budget control',
        highLabel: 'Full compliance, budget well managed',
      },
      {
        id: 'kpi-pac-payments',
        title: 'Payment Processing & Financial Reporting',
        description:
          'Rate how timely and accurate the employee is in processing payments and producing expenditure reports.',
        lowLabel: 'Payments / reports frequently late or inaccurate',
        highLabel: 'Payments / reports consistently timely and accurate',
      },
      {
        id: 'kpi-pac-forecast',
        title: 'Forecasting & Cash Flow Management',
        description:
          'Rate the employee\'s effectiveness in forecasting expenditure and managing cash flow projections.',
        lowLabel: 'Forecasts / cash flow poorly managed',
        highLabel: 'Forecasts / cash flow accurate and proactive',
      },
      {
        id: 'kpi-pac-records',
        title: 'Financial Records, Assets & Reconciliations',
        description:
          'Rate how well the employee maintains financial documents, fixed asset records, and reconciles advances / receivables.',
        lowLabel: 'Records disorganised, frequent discrepancies',
        highLabel: 'Records accurate, discrepancies rare',
      },
      {
        id: 'kpi-pac-process',
        title: 'Process Improvement & Vendor Compliance',
        description:
          'Rate the employee\'s contribution to process improvements and ensuring vendor payments comply with procurement plans.',
        lowLabel: 'Little improvement, frequent compliance gaps',
        highLabel: 'Strong improvements, full compliance',
      },
    ],
  },

  // ── Project Admin ──────────────────────────────────────────────────────────
  {
    roleLabel: 'Project Admin',
    roleMatches: ['project admin'],
    kpis: [
      {
        id: 'kpi-padm-supervision',
        title: 'Support Staff Supervision',
        description:
          'Rate how effectively the employee supervises, coordinates and delegates to administrative support staff.',
        lowLabel: 'Poor supervision / coordination',
        highLabel: 'Support staff well supervised and accountable',
      },
      {
        id: 'kpi-padm-hygiene',
        title: 'Office Hygiene Standards',
        description:
          'Rate how well the employee ensures and reports on hygiene standards across project offices.',
        lowLabel: 'Hygiene standards often not met',
        highLabel: 'Hygiene standards consistently maintained',
      },
      {
        id: 'kpi-padm-procurement',
        title: 'Procurement & Supply Coordination',
        description:
          'Rate the employee\'s effectiveness in coordinating procurement and supply requests for project operations.',
        lowLabel: 'Delays / shortages common',
        highLabel: 'Goods / services consistently available',
      },
      {
        id: 'kpi-padm-finance',
        title: 'Financial Transaction Processing',
        description:
          'Rate how timely and accurate the employee is in processing financial transactions and reporting their status.',
        lowLabel: 'Processing frequently delayed or unclear',
        highLabel: 'Processing consistently timely and well reported',
      },
      {
        id: 'kpi-padm-records',
        title: 'Records & Documentation Management',
        description:
          'Rate how well the employee maintains documentation and records management for project documents.',
        lowLabel: 'Records poorly maintained',
        highLabel: 'Records complete, well organised and retrievable',
      },
    ],
  },

  // ── Project Driver ─────────────────────────────────────────────────────────
  {
    roleLabel: 'Project Driver',
    roleMatches: ['project driver', 'driver'],
    kpis: [
      {
        id: 'kpi-drv-transport',
        title: 'Safe & Timely Transport',
        description:
          'Rate how safely and reliably the employee transports passengers or cargo.',
        lowLabel: 'Unsafe or unreliable',
        highLabel: 'Consistently safe and reliable',
      },
      {
        id: 'kpi-drv-safety',
        title: 'Road Safety & Defensive Driving',
        description:
          'Rate the employee\'s adherence to traffic laws and defensive driving practices.',
        lowLabel: 'Frequent violations or unsafe driving',
        highLabel: 'Always compliant, highly defensive driver',
      },
      {
        id: 'kpi-drv-vehicle',
        title: 'Vehicle Inspection & Maintenance',
        description:
          'Rate how consistently the employee inspects and maintains the vehicle, reporting mechanical issues.',
        lowLabel: 'Vehicle checks neglected',
        highLabel: 'Vehicle consistently well maintained',
      },
      {
        id: 'kpi-drv-route',
        title: 'Route Knowledge & Efficiency',
        description:
          'Rate the employee\'s knowledge of routes and ability to choose the most efficient path.',
        lowLabel: 'Poor route knowledge, frequent delays',
        highLabel: 'Excellent route knowledge, consistently efficient',
      },
      {
        id: 'kpi-drv-logs',
        title: 'Trip Records & Logging',
        description:
          'Rate the accuracy and completeness of the employee\'s trip records and driving-hour logs.',
        lowLabel: 'Records incomplete or inaccurate',
        highLabel: 'Records consistently accurate and complete',
      },
    ],
  },

  // ── QA Manager ────────────────────────────────────────────────────────────
  {
    roleLabel: 'QA Manager',
    roleMatches: ['quality assurance manager', 'qa manager'],
    kpis: [
      {
        id: 'kpi-qa-procedures',
        title: 'QA Procedures & Standards Implementation',
        description:
          'Rate how effectively the employee develops and implements quality assurance procedures across the production process.',
        lowLabel: 'Procedures weak or poorly followed',
        highLabel: 'Procedures robust and consistently followed',
      },
      {
        id: 'kpi-qa-training',
        title: 'Staff Training & Capability Building',
        description:
          'Rate how well the employee trains, coaches and supports staff to meet quality standards.',
        lowLabel: 'Staff capability weak',
        highLabel: 'Staff consistently meet quality standards',
      },
      {
        id: 'kpi-qa-resolution',
        title: 'Quality Issue Resolution',
        description:
          'Rate the employee\'s timeliness and effectiveness in documenting, reporting and resolving quality issues.',
        lowLabel: 'Issues recur, slow resolution',
        highLabel: 'Issues resolved quickly, recurrence prevented',
      },
      {
        id: 'kpi-qa-process',
        title: 'Process Improvement & Efficiency',
        description:
          'Rate the employee\'s contribution to optimising production processes and improving efficiency.',
        lowLabel: 'Little improvement contribution',
        highLabel: 'Strong, consistent improvement contributions',
      },
      {
        id: 'kpi-qa-compliance',
        title: 'Licence Quality & Safety Compliance',
        description:
          'Rate how well the employee ensures licences meet quality standards and staff comply with health and safety procedures.',
        lowLabel: 'Standards / compliance frequently missed',
        highLabel: 'Standards and compliance consistently met',
      },
    ],
  },

  // ── Security Coordinator ───────────────────────────────────────────────────
  {
    roleLabel: 'Security Coordinator',
    roleMatches: ['security coordinator'],
    kpis: [
      {
        id: 'kpi-sec-planning',
        title: 'Security Planning & Policy',
        description:
          'Rate the employee\'s effectiveness in developing and implementing security management plans, policies and protocols.',
        lowLabel: 'Plans / policies weak or outdated',
        highLabel: 'Robust, well-implemented plans',
      },
      {
        id: 'kpi-sec-budget',
        title: 'Security Budget Control',
        description:
          'Rate how well the employee manages and controls the security operations budget.',
        lowLabel: 'Budget poorly controlled',
        highLabel: 'Budget well managed and controlled',
      },
      {
        id: 'kpi-sec-staff',
        title: 'Staff Recruitment, Training & Supervision',
        description:
          'Rate the employee\'s effectiveness in recruiting, training and supervising security officers and guards.',
        lowLabel: 'Staff poorly trained or supervised',
        highLabel: 'Staff well recruited, trained and supervised',
      },
      {
        id: 'kpi-sec-events',
        title: 'Operations for Events & Emergencies',
        description:
          'Rate how well the employee plans and oversees security for events and emergency responses, including regional office security.',
        lowLabel: 'Poorly planned or coordinated',
        highLabel: 'Consistently well planned and executed',
      },
      {
        id: 'kpi-sec-incidents',
        title: 'Incident Investigation & Reporting',
        description:
          'Rate the employee\'s effectiveness in investigating, resolving and reporting security incidents to management.',
        lowLabel: 'Incidents poorly handled or reported',
        highLabel: 'Incidents promptly resolved and clearly reported',
      },
    ],
  },

  // ── Statistics Officer ─────────────────────────────────────────────────────
  {
    roleLabel: 'Statistics Officer',
    roleMatches: ['statistics officer', 'statistician'],
    kpis: [
      {
        id: 'kpi-stat-analysis',
        title: 'Production & Issuance Data Analysis',
        description:
          'Rate the employee\'s effectiveness in analysing licence production and issuance data.',
        lowLabel: 'Analysis weak or incomplete',
        highLabel: 'Analysis thorough and insightful',
      },
      {
        id: 'kpi-stat-integrity',
        title: 'Data Integrity, Quality & Validation',
        description:
          'Rate how well the employee ensures data integrity through quality assessment, cleaning and validation methods.',
        lowLabel: 'Data integrity frequently compromised',
        highLabel: 'Data consistently accurate and well validated',
      },
      {
        id: 'kpi-stat-testing',
        title: 'Statistical Testing',
        description:
          'Rate the employee\'s rigor in performing and selecting appropriate statistical tests.',
        lowLabel: 'Testing weak or inappropriate',
        highLabel: 'Testing rigorous and well chosen',
      },
      {
        id: 'kpi-stat-trends',
        title: 'Performance Trends & Forecasting',
        description:
          'Rate the employee\'s contribution to project performance trend analysis and strategic forecasting.',
        lowLabel: 'Limited contribution or insight',
        highLabel: 'Strong, insightful contribution',
      },
      {
        id: 'kpi-stat-presentation',
        title: 'Presentation of Findings',
        description:
          'Rate the clarity and usefulness of the employee\'s presentation of statistical findings and recommendations.',
        lowLabel: 'Findings unclear or unhelpful',
        highLabel: 'Findings clear, well interpreted and actionable',
      },
    ],
  },

  // ── Stock Controller ───────────────────────────────────────────────────────
  {
    roleLabel: 'Stock Controller',
    roleMatches: ['stock controller'],
    kpis: [
      {
        id: 'kpi-sc-security',
        title: 'Stock Security & Loss Prevention',
        description:
          'Rate how effectively the employee prevents stock damage, theft and wastage.',
        lowLabel: 'Frequent losses / damage',
        highLabel: 'Losses minimal, stock well secured',
      },
      {
        id: 'kpi-sc-ordering',
        title: 'Supply Availability & Ordering',
        description:
          'Rate the employee\'s effectiveness in determining supply needs and ensuring uninterrupted availability.',
        lowLabel: 'Supplies often unavailable',
        highLabel: 'Supplies consistently available on time',
      },
      {
        id: 'kpi-sc-storage',
        title: 'Storage & Inventory Organisation',
        description:
          'Rate how well the employee organises and monitors storage conditions and inventory levels.',
        lowLabel: 'Storage disorganised, poorly tracked',
        highLabel: 'Storage well organised, inventory well tracked',
      },
      {
        id: 'kpi-sc-audit',
        title: 'Inventory Audit & Record Accuracy',
        description:
          'Rate the employee\'s thoroughness in conducting audits and maintaining accurate, current inventory records.',
        lowLabel: 'Records inaccurate, audits inconsistent',
        highLabel: 'Records accurate, audits regular and thorough',
      },
      {
        id: 'kpi-sc-damage',
        title: 'Damage Reporting & Corrective Action',
        description:
          'Rate how well the employee reports damaged inventory and implements corrective measures.',
        lowLabel: 'Damage poorly tracked or addressed',
        highLabel: 'Damage promptly reported and addressed',
      },
    ],
  },

  // ── Stores Supervisor ──────────────────────────────────────────────────────
  {
    roleLabel: 'Stores Supervisor',
    roleMatches: ['stores supervisor'],
    kpis: [
      {
        id: 'kpi-ss-loss',
        title: 'Inventory Loss & Wastage Prevention',
        description:
          'Rate how effectively the employee prevents inventory loss, damage or wastage.',
        lowLabel: 'Frequent losses or wastage',
        highLabel: 'Losses minimal, inventory well protected',
      },
      {
        id: 'kpi-ss-ordering',
        title: 'Supply Planning & Ordering',
        description:
          'Rate the employee\'s effectiveness in determining and ordering required office supplies.',
        lowLabel: 'Supplies often insufficient',
        highLabel: 'Supplies consistently meet project needs',
      },
      {
        id: 'kpi-ss-records',
        title: 'Inventory Record Accuracy',
        description:
          'Rate how well the employee maintains accurate inventory records and resolves discrepancies.',
        lowLabel: 'Records inaccurate, discrepancies unresolved',
        highLabel: 'Records accurate, discrepancies promptly resolved',
      },
      {
        id: 'kpi-ss-distribution',
        title: 'Timely Stock Distribution',
        description:
          'Rate the employee\'s timeliness in delivering and distributing stock / supplies to meet operational needs.',
        lowLabel: 'Distribution frequently delayed',
        highLabel: 'Distribution consistently timely and efficient',
      },
      {
        id: 'kpi-ss-compliance',
        title: 'Requisition Process Compliance',
        description:
          'Rate how well the employee communicates and ensures compliance with stock requisition and delivery procedures.',
        lowLabel: 'Procedures poorly followed or communicated',
        highLabel: 'Procedures consistently followed and communicated',
      },
    ],
  },

  // ── System Support Manager ─────────────────────────────────────────────────
  {
    roleLabel: 'System Support Manager',
    roleMatches: ['system support manager'],
    kpis: [
      {
        id: 'kpi-ssm-monitoring',
        title: 'Performance Monitoring & Improvement',
        description:
          'Rate the employee\'s effectiveness in monitoring UDLS system performance and recommending IT infrastructure improvements.',
        lowLabel: 'Monitoring weak or reactive',
        highLabel: 'Monitoring proactive, improvements well recommended',
      },
      {
        id: 'kpi-ssm-planning',
        title: 'Strategic IT Planning',
        description:
          'Rate the employee\'s contribution to developing and implementing the divisional IT plan with management and the Board.',
        lowLabel: 'Limited strategic contribution',
        highLabel: 'Strong, well-aligned strategic contribution',
      },
      {
        id: 'kpi-ssm-training',
        title: 'Training & Infrastructure Support',
        description:
          'Rate how well the employee develops support tools and trains users on new software / hardware systems.',
        lowLabel: 'Training / tools inadequate',
        highLabel: 'Training / tools consistently effective',
      },
      {
        id: 'kpi-ssm-governance',
        title: 'IT Infrastructure & Policy Governance',
        description:
          'Rate the employee\'s effectiveness in managing IT infrastructure and implementing IT policies and governance.',
        lowLabel: 'Infrastructure / policy poorly managed',
        highLabel: 'Infrastructure / policy well managed and enforced',
      },
      {
        id: 'kpi-ssm-stakeholders',
        title: 'Stakeholder Collaboration & Troubleshooting',
        description:
          'Rate how effectively the employee partners with stakeholders to develop IT solutions and resolve issues.',
        lowLabel: 'Collaboration / troubleshooting weak',
        highLabel: 'Collaboration / troubleshooting strong and effective',
      },
    ],
  },

  // ── Customer Care Officer / Rep / Call Centre ──────────────────────────────
  {
    roleLabel: 'Customer Care Officer',
    roleMatches: ['customer care rep', 'customer care officer', 'call centre rep', 'call center rep'],
    kpis: [
      {
        id: 'kpi-cco-accuracy',
        title: 'Accuracy',
        description:
          'Rate how accurately the employee completes their work, including data entry, client records, and other day-to-day tasks.',
        lowLabel: 'Frequent errors, work often needs correction',
        highLabel: 'Consistently accurate, rarely needs correction',
      },
      {
        id: 'kpi-cco-docs',
        title: 'Document Management',
        description:
          'Rate how efficiently the employee files, organises, and retrieves documentation (e.g. client data) when needed.',
        lowLabel: 'Poorly filed, difficult to retrieve',
        highLabel: 'Well organised, retrieved quickly and accurately',
      },
    ],
  },
];

/**
 * Returns the matching KPI group for a given role string, or null if none found.
 */
export function getKpisForRole(role: string): RoleKpiGroup | null {
  const lower = role.toLowerCase();
  return (
    ROLE_KPI_GROUPS.find((group) =>
      group.roleMatches.some((match) => lower.includes(match.toLowerCase()))
    ) ?? null
  );
}
