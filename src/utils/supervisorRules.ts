import { Person, getPersonFacility } from '../types';

export interface DesignatedSupervisorResult {
  supervisorName: string;
  supervisorRole: string;
  reason: string;
}

/**
 * Determines the mandatory supervisor (line supervisor / designated appraiser) that MUST sit
 * on the review panel for a given employee.
 *
 * Source of truth: "data for recognition - 2026" appraisal list (column 3: "their supervisor").
 *
 * Named supervisor assignments from the document:
 *  1.  Communications Manager (Nantume Catherine)    -> Alex Baguma
 *  2.  Customer Care Supervisor (Nalwanga Doris)     -> Nantume Catherine
 *  3.  Facility Supervisors (7 regional)             -> Ingabire Pamella
 *  4.  Field Operations (Ingabire Pamella)           -> Alex Baguma
 *  5.  Head of Operations (Baguma Alex)              -> PC (Project Coordinator)
 *  6.  IT Coordinator (Gambu Timothy)                -> Clare Tukahiirwa
 *  7.  Mobile Enrolment (Mandera Peterson)           -> Pamella Ingabire
 *  8.  PA to PC (Nalubowa Victor)                    -> PC
 *  9.  Project Accountant (Kato Andrew)              -> PC
 * 10.  Project Admin (Nabirye Fridah)                -> Alex Baguma
 * 11.  Project Driver (Sirama Johnson Mark)          -> Nalubowa Victoria (PA to PC)
 * 12.  QA Manager (Basuna Julius)                    -> Alex Baguma
 * 13.  Security Coordinator (Okello James Pule)      -> Alex Baguma
 * 14.  Statistics Officer (Segawa Mathew)            -> Alex Baguma
 * 15.  Stock Controller (Lubega Dan)                 -> Alex Baguma
 * 16.  Stores Supervisor (Nakayondo Hawah)           -> Nabirye Fridah (Project Admin)
 * 17.  System Support Manager (Tukahiirwa Clare)     -> PC
 * 18.  Technical Team (8 members)                   -> Clare Tukahiirwa / PC
 * 19.  Production Manager (Muhangi Dickson)          -> Clare Tukahiirwa
 *
 * Additional legacy Kampala dept rules retained for non-document roles:
 *  - Enrollment/Reception/Approval/VIP staff        -> Catherine Komujuni
 *  - Order Batching/Personalisation/Shipment        -> Dickson Muhangi
 *  - Quality Assurance staff (non-managers)         -> Basuna Julius
 *  - Customer Care / Call Center staff              -> Doris Nalwanga
 *  - Technical staff (non-managers, excl. Ryan Karl)-> Tukahiirwa Clare
 *
 * Regional facility supervisors for non-supervisors:
 *  - Jinja: Tumusiime Abraham  | Mbale: Alice Nairima  | Gulu: Emmanuel Atine
 *  - Arua: Anna Nimaro Laker   | Fort Portal: Julius Sserunjoji  | Mbarara: Marion Birungi
 */
export function getDesignatedSupervisorForReviewee(reviewee: Person): DesignatedSupervisorResult | null {
  const facility = getPersonFacility(reviewee);
  const dept = (reviewee.department || '').toLowerCase().trim();
  const role = (reviewee.role || '').toLowerCase().trim();
  const name = (reviewee.name || '').toLowerCase().trim();

  // ─────────────────────────────────────────────────────────────────────────
  // NAMED SUPERVISOR RULES from the 2026 appraisal document (highest priority)
  // ─────────────────────────────────────────────────────────────────────────

  // Rule 1: Communications Manager -> Alex Baguma (Head of Operations)
  if (role.includes('communications manager') || role.includes('comms manager')) {
    if (!name.includes('baguma')) {
      return {
        supervisorName: 'Alex Baguma',
        supervisorRole: 'Head of Operations (Line Supervisor)',
        reason: 'Mandated line supervisor for Communications Manager per appraisal document',
      };
    }
  }

  // Rule 2: Customer Care Supervisor -> Nantume Catherine (Communications Manager)
  if (role.includes('customer care supervisor') || role.includes('cc supervisor')) {
    if (!name.includes('nantume')) {
      return {
        supervisorName: 'Nantume Catherine',
        supervisorRole: 'Communications Manager (Line Supervisor)',
        reason: 'Mandated line supervisor for Customer Care Supervisor per appraisal document',
      };
    }
  }

  // Rule 3: Facility Supervisors -> Ingabire Pamella (Field Operations)
  if (role.includes('facility supervisor') && !role.includes('assistant')) {
    if (!name.includes('ingabire')) {
      return {
        supervisorName: 'Ingabire Pamella',
        supervisorRole: 'Field Operations Manager (Supervisor of Facility Supervisors)',
        reason: 'Mandated supervisor for all Facility Supervisors per appraisal document',
      };
    }
  }

  // Rule 4: Field Operations Manager (Ingabire Pamella) -> Alex Baguma
  if (role.includes('field operations') || role.includes('field ops manager')) {
    if (!name.includes('baguma')) {
      return {
        supervisorName: 'Alex Baguma',
        supervisorRole: 'Head of Operations (Line Supervisor)',
        reason: 'Mandated line supervisor for Field Operations Manager per appraisal document',
      };
    }
  }

  // Rule 5: Head of Operations -> PC (Project Coordinator)
  if (role.includes('head of operations') || role.includes('operations director')) {
    return {
      supervisorName: 'PC',
      supervisorRole: 'Project Coordinator (Line Supervisor)',
      reason: 'Mandated line supervisor for Head of Operations per appraisal document',
    };
  }

  // Rule 6: IT Coordinator -> Clare Tukahiirwa (System Support Manager)
  if (role.includes('it coordinator') || (role.includes('it') && role.includes('coordinator'))) {
    if (!name.includes('tukahi')) {
      return {
        supervisorName: 'Tukahiirwa Clare',
        supervisorRole: 'System Support Manager (Line Supervisor)',
        reason: 'Mandated line supervisor for IT Coordinator per appraisal document',
      };
    }
  }

  // Rule 7: Mobile Enrolment -> Pamella Ingabire (Field Operations Manager)
  if (role.includes('mobile enrolment') || role.includes('mobile enrollment')) {
    if (!name.includes('ingabire')) {
      return {
        supervisorName: 'Ingabire Pamella',
        supervisorRole: 'Field Operations Manager (Line Supervisor)',
        reason: 'Mandated line supervisor for Mobile Enrolment per appraisal document',
      };
    }
  }

  // Rule 8: PA to PC -> PC (Project Coordinator)
  if (role.includes('pa to pc') || role.includes('personal assistant to pc')) {
    return {
      supervisorName: 'PC',
      supervisorRole: 'Project Coordinator (Line Supervisor)',
      reason: 'Mandated line supervisor for PA to PC per appraisal document',
    };
  }

  // Rule 9: Project Accountant -> PC
  if (role.includes('project accountant') || (role.includes('accountant') && dept.includes('finance'))) {
    return {
      supervisorName: 'PC',
      supervisorRole: 'Project Coordinator (Line Supervisor)',
      reason: 'Mandated line supervisor for Project Accountant per appraisal document',
    };
  }

  // Rule 10: Project Admin -> Alex Baguma
  if (role.includes('project admin') || role.includes('project administrator')) {
    if (!name.includes('baguma')) {
      return {
        supervisorName: 'Alex Baguma',
        supervisorRole: 'Head of Operations (Line Supervisor)',
        reason: 'Mandated line supervisor for Project Admin per appraisal document',
      };
    }
  }

  // Rule 11: Project Driver -> Nalubowa Victoria (PA to PC)
  if (role.includes('project driver') || role.includes('logistics fleet driver')) {
    if (!name.includes('nalubowa')) {
      return {
        supervisorName: 'Nalubowa Victoria',
        supervisorRole: 'PA to PC (Line Supervisor for Drivers)',
        reason: 'Mandated line supervisor for Project Driver per appraisal document',
      };
    }
  }

  // Rule 12: Quality Assurance Manager -> Alex Baguma
  if (
    (role.includes('quality assurance manager') || role.includes('qa manager')) &&
    !name.includes('baguma')
  ) {
    return {
      supervisorName: 'Alex Baguma',
      supervisorRole: 'Head of Operations (Line Supervisor)',
      reason: 'Mandated line supervisor for QA Manager per appraisal document',
    };
  }

  // Rule 13: Security Coordinator -> Alex Baguma
  if (
    (role.includes('security coordinator') || role.includes('security manager')) &&
    !name.includes('baguma')
  ) {
    return {
      supervisorName: 'Alex Baguma',
      supervisorRole: 'Head of Operations (Line Supervisor)',
      reason: 'Mandated line supervisor for Security Coordinator per appraisal document',
    };
  }

  // Rule 14: Statistics Officer -> Alex Baguma
  if (
    (role.includes('statistics officer') || role.includes('statistician')) &&
    !name.includes('baguma')
  ) {
    return {
      supervisorName: 'Alex Baguma',
      supervisorRole: 'Head of Operations (Line Supervisor)',
      reason: 'Mandated line supervisor for Statistics Officer per appraisal document',
    };
  }

  // Rule 15: Stock Controller -> Alex Baguma
  if (role.includes('stock controller') && !name.includes('baguma')) {
    return {
      supervisorName: 'Alex Baguma',
      supervisorRole: 'Head of Operations (Line Supervisor)',
      reason: 'Mandated line supervisor for Stock Controller per appraisal document',
    };
  }

  // Rule 16: Stores Supervisor -> Nabirye Fridah (Project Admin)
  if (role.includes('stores supervisor') || role.includes('warehouse supervisor')) {
    if (!name.includes('nabirye') && !name.includes('fridah')) {
      return {
        supervisorName: 'Nabirye Fridah',
        supervisorRole: 'Project Admin (Line Supervisor)',
        reason: 'Mandated line supervisor for Stores Supervisor per appraisal document',
      };
    }
  }

  // Rule 17: System Support Manager -> PC
  if (role.includes('system support manager') || role.includes('systems manager')) {
    return {
      supervisorName: 'PC',
      supervisorRole: 'Project Coordinator (Line Supervisor)',
      reason: 'Mandated line supervisor for System Support Manager per appraisal document',
    };
  }

  // Rule 18: Technical Team members -> Clare Tukahiirwa (excl. Ryan Karl who reports to PC)
  if (
    role.includes('technical team') ||
    role.includes('systems technician') ||
    role.includes('systems infrastructure') ||
    role.includes('network security engineer') ||
    role.includes('database administrator') ||
    role.includes('enrolment hardware technician') ||
    role.includes('biometric systems technician') ||
    role.includes('field it support') ||
    role.includes('software application support') ||
    role.includes('workstation support') ||
    role.includes('production systems engineer')
  ) {
    const isRyanKarl = name.includes('ryan') && name.includes('karl');
    if (isRyanKarl) {
      return {
        supervisorName: 'PC',
        supervisorRole: 'Project Coordinator (Line Supervisor for Ryan Karl)',
        reason: 'Ryan Karl Borinaga reports directly to PC per management instruction',
      };
    }
    if (!name.includes('tukahi')) {
      return {
        supervisorName: 'Tukahiirwa Clare',
        supervisorRole: 'System Support Manager (Line Supervisor)',
        reason: 'Mandated line supervisor for Technical Team per appraisal document',
      };
    }
  }

  // Rule 19: Production Manager -> Clare Tukahiirwa
  if (role.includes('production manager') && !name.includes('tukahi')) {
    return {
      supervisorName: 'Tukahiirwa Clare',
      supervisorRole: 'System Support Manager (Line Supervisor)',
      reason: 'Mandated line supervisor for Production Manager per appraisal document',
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // LEGACY KAMPALA DEPARTMENT RULES (catch-all for roles not named above)
  // ─────────────────────────────────────────────────────────────────────────

  if (facility === 'Kampala') {
    // Enrollment, Reception, Approval, DL Issuance & Receipt, VIP -> Catherine Komujuni
    const isCatDept =
      dept.includes('enrol') ||
      dept.includes('enroll') ||
      dept.includes('reception') ||
      dept.includes('approval') ||
      dept.includes('dl receipt') ||
      dept.includes('dl issuance') ||
      dept.includes('receipt') ||
      dept.includes('issuance') ||
      dept === 'vip' ||
      role.includes('enrol') ||
      role.includes('reception') ||
      role.includes('approval') ||
      role.includes('vip');

    if (isCatDept && !name.includes('komujuni')) {
      return {
        supervisorName: 'Catherine Komujuni',
        supervisorRole: 'Line Supervisor (Enrollment, Reception, Approval, DL Issuance & Receipt, VIP)',
        reason: 'Mandated Frontline Line Supervisor for Enrollment, Reception, Approval, DL Issuance & VIP',
      };
    }

    // Order Batching & Personalisation, Shipment -> Dickson Muhangi
    const isDicksonDept =
      dept.includes('order batching') ||
      dept.includes('personalisation') ||
      dept.includes('personalization') ||
      dept.includes('batching') ||
      dept.includes('shipment') ||
      role.includes('order batching') ||
      role.includes('shipment');

    if (isDicksonDept && !name.includes('muhangi')) {
      return {
        supervisorName: 'Dickson Muhangi',
        supervisorRole: 'Production Manager / Line Supervisor (Batching & Shipment)',
        reason: 'Mandated Production Supervisor for Order Batching, Personalisation & Shipment',
      };
    }

    // Quality Assurance non-managers -> Basuna Julius
    const isQADept =
      (dept.includes('quality assurance') || dept === 'qa' || role.includes('quality assurance')) &&
      !role.includes('manager');

    if (isQADept && !name.includes('basuna')) {
      return {
        supervisorName: 'Basuna Julius',
        supervisorRole: 'Quality Assurance Manager',
        reason: 'Mandated QA Supervisor for Quality Assurance Personnel',
      };
    }

    // Customer Care / Call Center non-supervisors -> Doris Nalwanga
    const isDorisDept =
      (dept.includes('customer care') || dept.includes('call center') ||
       role.includes('customer care') || role.includes('call center')) &&
      !role.includes('supervisor');

    if (isDorisDept && !name.includes('nalwanga')) {
      return {
        supervisorName: 'Doris Nalwanga',
        supervisorRole: 'Customer Care & Call Center Supervisor',
        reason: 'Mandated Supervisor for Customer Care & Call Center Personnel',
      };
    }

    // General Technical staff -> Tukahiirwa Clare (excluding Ryan Karl)
    const isTechDept =
      (dept.includes('technical') || dept.includes('systems') ||
       role.includes('technical') || role.includes('system support')) &&
      !role.includes('manager') && !role.includes('coordinator');

    const isRyanKarl = name.includes('ryan') && name.includes('karl');

    if (isTechDept && !name.includes('tukahi') && !isRyanKarl) {
      return {
        supervisorName: 'Tukahiirwa Clare',
        supervisorRole: 'System Support Manager / Technical Supervisor',
        reason: 'Mandated Technical Supervisor for Technical Staff (excluding Ryan Karl)',
      };
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // REGIONAL FACILITY SUPERVISORS for non-supervisor staff
  // ─────────────────────────────────────────────────────────────────────────

  if (facility === 'Jinja' && !name.includes('tumusiime')) {
    return {
      supervisorName: 'Tumusiime Abraham',
      supervisorRole: 'Facility Supervisor (Jinja Branch)',
      reason: 'Mandated Facility Supervisor for Jinja Branch',
    };
  }

  if (facility === 'Mbale' && !name.includes('nairima')) {
    return {
      supervisorName: 'Alice Nairima',
      supervisorRole: 'Facility Supervisor (Mbale Branch)',
      reason: 'Mandated Facility Supervisor for Mbale Branch',
    };
  }

  if (facility === 'Gulu' && !name.includes('atine')) {
    return {
      supervisorName: 'Emmanuel Atine',
      supervisorRole: 'Facility Supervisor (Gulu Branch)',
      reason: 'Mandated Facility Supervisor for Gulu Branch',
    };
  }

  if (facility === 'Arua' && !name.includes('nimaro') && !name.includes('laker')) {
    return {
      supervisorName: 'Anna Nimaro Laker',
      supervisorRole: 'Facility Supervisor (Arua Branch)',
      reason: 'Mandated Facility Supervisor for Arua Branch',
    };
  }

  if (facility === 'Fort Portal' && !name.includes('sserunjoji')) {
    return {
      supervisorName: 'Julius Sserunjoji',
      supervisorRole: 'Facility Supervisor (Fort Portal Branch)',
      reason: 'Mandated Facility Supervisor for Fort Portal Branch',
    };
  }

  if (facility === 'Mbarara' && !name.includes('birungi')) {
    return {
      supervisorName: 'Marion Birungi',
      supervisorRole: 'Facility Supervisor (Mbarara Branch)',
      reason: 'Mandated Facility Supervisor for Mbarara Branch',
    };
  }

  return null;
}

/**
 * Robustly matches the designated supervisor target name against the active people roster.
 * Supports known spelling variants and all supervisors named in the 2026 appraisal document.
 */
export function matchSupervisorPerson(
  supervisorTargetName: string,
  people: Person[],
  excludeId?: string
): Person | null {
  const cleanStr = (s: string) => s.toLowerCase().replace(/[^a-z]/g, '');
  const targetClean = cleanStr(supervisorTargetName);

  // ── Named supervisors from the 2026 appraisal document ──────────────────

  // PC / Project Coordinator (top-level supervisor)
  if (targetClean === 'pc' || targetClean.includes('project coordinator')) {
    return (
      people.find(
        (p) =>
          p.id !== excludeId &&
          (cleanStr(p.role).includes('projectcoordinator') || cleanStr(p.role) === 'pc')
      ) || null
    );
  }

  // Alex Baguma (Head of Operations)
  if (targetClean.includes('baguma')) {
    return people.find((p) => p.id !== excludeId && cleanStr(p.name).includes('baguma')) || null;
  }

  // Nantume Catherine (Communications Manager)
  if (targetClean.includes('nantume')) {
    return people.find((p) => p.id !== excludeId && cleanStr(p.name).includes('nantume')) || null;
  }

  // Ingabire Pamella (Field Operations Manager)
  if (targetClean.includes('ingabire')) {
    return people.find((p) => p.id !== excludeId && cleanStr(p.name).includes('ingabire')) || null;
  }

  // Nabirye Fridah (Project Admin — supervisor of Stores Supervisor & Drivers)
  if (targetClean.includes('nabirye') || targetClean.includes('fridah')) {
    return (
      people.find(
        (p) =>
          p.id !== excludeId &&
          (cleanStr(p.name).includes('nabirye') || cleanStr(p.name).includes('fridah'))
      ) || null
    );
  }

  // Nalubowa Victoria (PA to PC — supervisor of Drivers)
  if (targetClean.includes('nalubowa')) {
    return people.find((p) => p.id !== excludeId && cleanStr(p.name).includes('nalubowa')) || null;
  }

  // ── Original supervisor matchers (retained) ──────────────────────────────

  if (targetClean.includes('komujuni')) {
    return people.find((p) => p.id !== excludeId && cleanStr(p.name).includes('komujuni')) || null;
  }
  if (targetClean.includes('muhangi')) {
    return people.find((p) => p.id !== excludeId && cleanStr(p.name).includes('muhangi')) || null;
  }
  if (targetClean.includes('basuna') || targetClean.includes('busuna')) {
    return (
      people.find(
        (p) =>
          p.id !== excludeId &&
          (cleanStr(p.name).includes('basuna') || cleanStr(p.name).includes('busuna'))
      ) || null
    );
  }
  if (targetClean.includes('nalwanga')) {
    return people.find((p) => p.id !== excludeId && cleanStr(p.name).includes('nalwanga')) || null;
  }
  if (targetClean.includes('tukahi')) {
    return people.find((p) => p.id !== excludeId && cleanStr(p.name).includes('tukahi')) || null;
  }
  if (targetClean.includes('tumusiime')) {
    return people.find((p) => p.id !== excludeId && cleanStr(p.name).includes('tumusiime')) || null;
  }
  if (targetClean.includes('nairima')) {
    return people.find((p) => p.id !== excludeId && cleanStr(p.name).includes('nairima')) || null;
  }
  if (targetClean.includes('atine')) {
    return people.find((p) => p.id !== excludeId && cleanStr(p.name).includes('atine')) || null;
  }
  if (targetClean.includes('nimaro') || targetClean.includes('laker')) {
    return (
      people.find(
        (p) =>
          p.id !== excludeId &&
          (cleanStr(p.name).includes('nimaro') || cleanStr(p.name).includes('laker'))
      ) || null
    );
  }
  if (targetClean.includes('sserunjoji') || targetClean.includes('sserunjogi')) {
    return (
      people.find(
        (p) =>
          p.id !== excludeId &&
          (cleanStr(p.name).includes('sserunjoji') || cleanStr(p.name).includes('sserunjogi'))
      ) || null
    );
  }
  if (targetClean.includes('birungi') || targetClean.includes('marion')) {
    return (
      people.find(
        (p) =>
          p.id !== excludeId &&
          (cleanStr(p.name).includes('birungi') || cleanStr(p.name).includes('marion'))
      ) || null
    );
  }

  // Generic token fallback
  const targetTokens = supervisorTargetName
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter((t) => t.length > 2);

  return (
    people.find((p) => {
      if (excludeId && p.id === excludeId) return false;
      const pName = p.name.toLowerCase().replace(/[^\w\s]/g, '');
      const matches = targetTokens.filter((token) => pName.includes(token));
      return matches.length >= Math.min(2, targetTokens.length);
    }) || null
  );
}

