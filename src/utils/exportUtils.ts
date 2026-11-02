import { Person, AllocatedGroup } from '../types';
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

  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i];
    const delimiter = line.includes('\t') ? '\t' : ',';
    const parts = line.split(delimiter).map((p) => p.trim().replace(/^["']|["']$/g, ''));

    if (parts.length >= 1 && parts[0]) {
      const name = parts[0];
      const dept = parts[1] || 'General';
      const role = parts[2] || 'Team Member';
      const email = parts[3] || `${name.toLowerCase().replace(/\s+/g, '.')}@company.internal`;
      const id = parts[4] || `EMP-${String(i + 1).padStart(3, '0')}`;

      results.push({
        id,
        name,
        department: dept,
        role,
        email,
      });
    }
  }

  return results;
}
