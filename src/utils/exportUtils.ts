import { Person, AllocatedGroup } from '../types';
import { allocateEmployeeIds } from './employeeIds';
import { findMatchingAnnexARule } from '../data/annexASpecifications';

function downloadCsv(filename: string, csvContent: string) {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('link');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function escapeCsv(text: string): string {
  if (text.includes(',') || text.includes('"') || text.includes('\n')) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

/**
 * Export Groups Summary to CSV
 */
export function exportGroupsToCsv(groups: AllocatedGroup[], peopleMap: Map<string, Person>) {
  const headers = [
    'Group #',
    'Group Name',
    'Employee Being Reviewed (ID)',
    'Employee Being Reviewed (Name)',
    'Employee Being Reviewed (Department)',
    'Employee Being Reviewed (Role)',
    'Annex A Mandate Rule',
    'Reviewing Panel Size',
    'Reviewer Names',
    'Reviewer Departments & Roles',
  ];

  const rows = groups.map((g) => {
    const reviewee = peopleMap.get(g.revieweeId);
    const annexRule = reviewee ? findMatchingAnnexARule(reviewee.role, reviewee.department) : undefined;
    const annexText = annexRule ? `Rule #${annexRule.orderNumber}: ${annexRule.originalAppraisersText}` : 'Standard Peer Allocation';

    const memberNames = g.memberIds.map((id) => peopleMap.get(id)?.name || id).join('; ');
    const memberDetails = g.memberIds
      .map((id) => {
        const p = peopleMap.get(id);
        return p ? `${p.name} (${p.department} - ${p.role})` : id;
      })
      .join('; ');

    return [
      g.number.toString(),
      escapeCsv(g.name),
      escapeCsv(reviewee?.id || g.revieweeId),
      escapeCsv(reviewee?.name || 'Unknown'),
      escapeCsv(reviewee?.department || g.primaryDepartment),
      escapeCsv(reviewee?.role || 'Team Member'),
      escapeCsv(annexText),
      g.memberIds.length.toString(),
      escapeCsv(memberNames),
      escapeCsv(memberDetails),
    ].join(',');
  });

  const content = [headers.join(','), ...rows].join('\n');
  downloadCsv('company_groups_allocation.csv', content);
}

/**
 * Export Member Allocations Directory to CSV
 */
export function exportMemberDirectoryToCsv(
  people: Person[],
  groups: AllocatedGroup[],
  memberToGroupMap: Record<string, string>,
  peopleMap: Map<string, Person>
) {
  const groupById = new Map<string, AllocatedGroup>(groups.map((g) => [g.id, g]));

  // Pre-calculate which review panels each person serves on
  const reviewingForMap: Record<string, string[]> = {};
  people.forEach((p) => {
    reviewingForMap[p.id] = [];
  });
  groups.forEach((g) => {
    const reviewee = peopleMap.get(g.revieweeId);
    g.memberIds.forEach((mId) => {
      if (!reviewingForMap[mId]) reviewingForMap[mId] = [];
      if (reviewee) {
        reviewingForMap[mId].push(`${reviewee.name} (${g.name})`);
      }
    });
  });

  const headers = [
    'Employee ID',
    'Employee Name',
    'Department',
    'Role',
    'Annex A Mandate',
    'Email',
    'Their Review Group',
    'Reviewers Assigned to Review Them Count',
    'Reviewers Assigned to Review Them Names',
    'Reviews They Are Conducting Count',
    'Colleagues They Are Reviewing',
  ];

  const rows = people.map((p) => {
    const groupId = memberToGroupMap[p.id];
    const group = groupId ? groupById.get(groupId) : null;
    const groupName = group ? group.name : 'Unassigned';
    const reviewers = group
      ? group.memberIds.map((id) => peopleMap.get(id)?.name || id)
      : [];

    const reviewsConducting = reviewingForMap[p.id] || [];
    const rule = findMatchingAnnexARule(p.role, p.department);
    const annexText = rule ? `Rule #${rule.orderNumber}: ${rule.originalAppraisersText}` : 'Standard Peer Allocation';

    return [
      escapeCsv(p.id),
      escapeCsv(p.name),
      escapeCsv(p.department),
      escapeCsv(p.role),
      escapeCsv(annexText),
      escapeCsv(p.email),
      escapeCsv(groupName),
      reviewers.length.toString(),
      escapeCsv(reviewers.join('; ')),
      reviewsConducting.length.toString(),
      escapeCsv(reviewsConducting.join('; ')),
    ].join(',');
  });

  const content = [headers.join(','), ...rows].join('\n');
  downloadCsv('member_group_allocations_directory.csv', content);
}

/**
 * Parse CSV or TSV string into Person records
 */
export function parseRosterText(rawText: string): Person[] {
  const lines = rawText.trim().split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length === 0) return [];

  const results: Person[] = [];
  let hasHeader = false;
  const firstLine = lines[0].toLowerCase();

  // Check if first line is header
  if (firstLine.includes('name') || firstLine.includes('dept') || firstLine.includes('department')) {
    hasHeader = true;
  }

  const startIndex = hasHeader ? 1 : 0;
  const pending: { person: Person; needsId: boolean }[] = [];
  const taken = new Set<string>();

  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i];
    const delimiter = line.includes('\t') ? '\t' : ',';
    const parts = line.split(delimiter).map((p) => p.trim().replace(/^["']|["']$/g, ''));

    if (parts.length >= 1 && parts[0]) {
      const name = parts[0];
      const dept = parts[1] || 'General';
      const role = parts[2] || 'Team Member';
      const email = parts[3] || `${name.toLowerCase().replace(/\s+/g, '.')}@company.internal`;
      const explicit = (parts[4] || '').trim();
      const key = explicit.toLowerCase();
      const needsId = !explicit || taken.has(key);
      if (!needsId) taken.add(key);

      pending.push({
        needsId,
        person: {
          id: explicit,
          name,
          department: dept,
          role,
          email,
        },
      });
    }
  }

  const fresh = allocateEmployeeIds(
    pending.filter((row) => !row.needsId).map((row) => row.person.id),
    pending.filter((row) => row.needsId).length
  );
  let cursor = 0;
  for (const row of pending) {
    if (row.needsId) {
      row.person.id = fresh[cursor];
      cursor += 1;
    }
    results.push(row.person);
  }

  return results;
}

// ─── Excel Export: All Panels ────────────────────────────────────────────────
import * as XLSX from 'xlsx';

/**
 * Exports a full Excel workbook with two sheets:
 *   Sheet 1 — "All Panels"  : one row per reviewer per group (flat list)
 *   Sheet 2 — "Panel Summary" : one row per group with reviewer names in columns
 */
export function exportPanelsToExcel(
  groups: AllocatedGroup[],
  peopleMap: Map<string, Person>
): void {
  const wb = XLSX.utils.book_new();

  // ── Sheet 1: Flat reviewer list ──────────────────────────────────────────
  const flatHeaders = [
    'Panel #',
    'Panel Name',
    'Employee Being Reviewed',
    'Employee ID',
    'Role',
    'Department',
    'Facility',
    'Annex A Rule',
    'Reviewer #',
    'Reviewer Name',
    'Reviewer ID',
    'Reviewer Role',
    'Reviewer Department',
    'Reviewer Facility',
    'Is Designated Supervisor',
  ];

  const flatRows: (string | number)[][] = [];

  for (const group of groups) {
    const reviewee = peopleMap.get(group.revieweeId);
    const annexRule = reviewee
      ? findMatchingAnnexARule(reviewee.role, reviewee.department)
      : undefined;
    const annexText = annexRule
      ? `Rule #${annexRule.orderNumber}: ${annexRule.functionTitle}`
      : 'Standard Peer Allocation';

    group.memberIds.forEach((memberId, idx) => {
      const reviewer = peopleMap.get(memberId);
      const isSupervisor = group.designatedSupervisorId === memberId;
      flatRows.push([
        group.number,
        group.name,
        reviewee?.name ?? 'Unknown',
        reviewee?.id ?? group.revieweeId,
        reviewee?.role ?? '',
        reviewee?.department ?? group.primaryDepartment,
        reviewee?.facility ?? '',
        annexText,
        idx + 1,
        reviewer?.name ?? memberId,
        reviewer?.id ?? memberId,
        reviewer?.role ?? '',
        reviewer?.department ?? '',
        reviewer?.facility ?? '',
        isSupervisor ? 'YES' : '',
      ]);
    });
  }

  const ws1 = XLSX.utils.aoa_to_sheet([flatHeaders, ...flatRows]);

  // Column widths
  ws1['!cols'] = [
    { wch: 8 },  // Panel #
    { wch: 28 }, // Panel Name
    { wch: 24 }, // Employee Being Reviewed
    { wch: 12 }, // Employee ID
    { wch: 26 }, // Role
    { wch: 26 }, // Department
    { wch: 12 }, // Facility
    { wch: 40 }, // Annex A Rule
    { wch: 10 }, // Reviewer #
    { wch: 24 }, // Reviewer Name
    { wch: 12 }, // Reviewer ID
    { wch: 26 }, // Reviewer Role
    { wch: 26 }, // Reviewer Department
    { wch: 12 }, // Reviewer Facility
    { wch: 22 }, // Is Designated Supervisor
  ];

  XLSX.utils.book_append_sheet(wb, ws1, 'All Panels');

  // ── Sheet 2: Summary — one row per group ─────────────────────────────────
  // Find the max panel size to know how many Reviewer columns to create
  const maxPanelSize = groups.reduce((max, g) => Math.max(max, g.memberIds.length), 0);

  const summaryHeaders = [
    'Panel #',
    'Panel Name',
    'Employee Being Reviewed',
    'Employee ID',
    'Role',
    'Department',
    'Facility',
    'Annex A Rule',
    'Panel Size',
    ...Array.from({ length: maxPanelSize }, (_, i) => `Reviewer ${i + 1}`),
    ...Array.from({ length: maxPanelSize }, (_, i) => `Reviewer ${i + 1} Dept`),
  ];

  const summaryRows: (string | number)[][] = groups.map((group) => {
    const reviewee = peopleMap.get(group.revieweeId);
    const annexRule = reviewee
      ? findMatchingAnnexARule(reviewee.role, reviewee.department)
      : undefined;
    const annexText = annexRule
      ? `Rule #${annexRule.orderNumber}: ${annexRule.functionTitle}`
      : 'Standard Peer Allocation';

    const reviewerNames = Array.from({ length: maxPanelSize }, (_, i) => {
      const p = peopleMap.get(group.memberIds[i] ?? '');
      return p ? p.name : '';
    });

    const reviewerDepts = Array.from({ length: maxPanelSize }, (_, i) => {
      const p = peopleMap.get(group.memberIds[i] ?? '');
      return p ? p.department : '';
    });

    return [
      group.number,
      group.name,
      reviewee?.name ?? 'Unknown',
      reviewee?.id ?? group.revieweeId,
      reviewee?.role ?? '',
      reviewee?.department ?? group.primaryDepartment,
      reviewee?.facility ?? '',
      annexText,
      group.memberIds.length,
      ...reviewerNames,
      ...reviewerDepts,
    ];
  });

  const ws2 = XLSX.utils.aoa_to_sheet([summaryHeaders, ...summaryRows]);

  ws2['!cols'] = [
    { wch: 8 },
    { wch: 28 },
    { wch: 24 },
    { wch: 12 },
    { wch: 26 },
    { wch: 26 },
    { wch: 12 },
    { wch: 40 },
    { wch: 10 },
    ...Array.from({ length: maxPanelSize * 2 }, () => ({ wch: 22 })),
  ];

  XLSX.utils.book_append_sheet(wb, ws2, 'Panel Summary');

  // ── Write & download ──────────────────────────────────────────────────────
  const date = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(wb, `Appraisal_Panels_${date}.xlsx`);
}
