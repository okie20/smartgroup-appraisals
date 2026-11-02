import { Person, getPersonFacility } from '../types';

export interface DesignatedSupervisorResult {
  supervisorName: string;
  supervisorRole: string;
  reason: string;
}

/**
 * Determines the mandatory supervisor that MUST sit on the review panel for a given employee.
 * Business rules specified by management:
 * 1. Kampala staff under Enrollment, Reception, Approval, DL Issuance and Receipt, VIP:
 *    -> Supervisor: Catherine Komujuni
 * 2. Kampala staff in Order Batching and Personalisation, Shipment:
 *    -> Supervisor: Dickson Muhangi
 * 3. Kampala staff in Quality Assurance:
 *    -> Supervisor: Basuna Julius
 * 4. Kampala staff in Customer Care, Call Center:
 *    -> Supervisor: Doris Nalwanga
 * 5. Kampala staff in Technical Staff (Technical Team):
 *    -> Supervisor: Tukahiirwa Clare (APART FROM Ryan Karl / Ryan Karl Borinaga)
 * 6. Regional Facilities (Non-supervisors):
 *    - Jinja: Tumusiime Abraham
 *    - Mbale: Alice Nairima
 *    - Gulu: Emmanuel Atine
 *    - Arua: Anna Nimaro Laker
 *    - Fort Portal: Julius Sserunjoji
 *    - Mbarara: Marion Birungi
 */
export function getDesignatedSupervisorForReviewee(reviewee: Person): DesignatedSupervisorResult | null {
  const facility = getPersonFacility(reviewee);
  const dept = (reviewee.department || '').toLowerCase().trim();
  const role = (reviewee.role || '').toLowerCase().trim();
  const name = (reviewee.name || '').toLowerCase().trim();

  // If reviewee is located in Kampala
  if (facility === 'Kampala') {
    // 1. Enrollment, Reception, Approval, DL Issuance & Receipt, VIP -> Catherine Komujuni
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

    // 2. Order Batching & Personalisation, Shipment -> Dickson Muhangi
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

    // 3. Quality Assurance -> Basuna Julius
    const isQADept =
      dept.includes('quality assurance') ||
      dept === 'qa' ||
      role.includes('quality assurance');

    if (isQADept && !name.includes('basuna')) {
      return {
        supervisorName: 'Basuna Julius',
        supervisorRole: 'Quality Assurance Manager',
        reason: 'Mandated QA Supervisor for Quality Assurance Personnel',
      };
    }

    // 4. Customer Care, Call Center -> Doris Nalwanga
    const isDorisDept =
      dept.includes('customer care') ||
      dept.includes('call center') ||
      role.includes('customer care') ||
      role.includes('call center');

    if (isDorisDept && !name.includes('nalwanga')) {
      return {
        supervisorName: 'Doris Nalwanga',
        supervisorRole: 'Customer Care & Call Center Supervisor',
        reason: 'Mandated Supervisor for Customer Care & Call Center Personnel',
      };
    }

    // 5. Technical Staff -> Tukahiirwa Clare (APART FROM Ryan Karl)
    const isTechDept =
      dept.includes('technical') ||
      dept.includes('systems') ||
      role.includes('technical') ||
      role.includes('system support');

    const isRyanKarl = name.includes('ryan') && name.includes('karl');

    if (isTechDept && !name.includes('tukahi') && !isRyanKarl) {
      return {
        supervisorName: 'Tukahiirwa Clare',
        supervisorRole: 'System Support Manager / Technical Supervisor',
        reason: 'Mandated Technical Supervisor for Technical Staff (excluding Ryan Karl)',
      };
    }
  }

  // Regional Facilities for non-supervisors
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
 * Supports known spelling variants (e.g. Busuna for Basuna, Tukahire for Tukahiirwa, First/Last inversions).
 */
export function matchSupervisorPerson(
  supervisorTargetName: string,
  people: Person[],
  excludeId?: string
): Person | null {
  const cleanStr = (s: string) => s.toLowerCase().replace(/[^a-z]/g, '');
  const targetClean = cleanStr(supervisorTargetName);

  if (targetClean.includes('komujuni')) {
    return people.find((p) => p.id !== excludeId && cleanStr(p.name).includes('komujuni')) || null;
  }
  if (targetClean.includes('muhangi')) {
    return people.find((p) => p.id !== excludeId && cleanStr(p.name).includes('muhangi')) || null;
  }
  if (targetClean.includes('basuna') || targetClean.includes('busuna')) {
    return (
      people.find(
        (p) => p.id !== excludeId && (cleanStr(p.name).includes('basuna') || cleanStr(p.name).includes('busuna'))
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
        (p) => p.id !== excludeId && (cleanStr(p.name).includes('nimaro') || cleanStr(p.name).includes('laker'))
      ) || null
    );
  }
  if (targetClean.includes('sserunjoji') || targetClean.includes('sserunjogi')) {
    return (
      people.find(
        (p) => p.id !== excludeId && (cleanStr(p.name).includes('sserunjoji') || cleanStr(p.name).includes('sserunjogi'))
      ) || null
    );
  }
  if (targetClean.includes('birungi') || targetClean.includes('marion')) {
    return (
      people.find(
        (p) => p.id !== excludeId && (cleanStr(p.name).includes('birungi') || cleanStr(p.name).includes('marion'))
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

