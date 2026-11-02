import * as XLSX from 'xlsx';
import mammoth from 'mammoth';
import { Person, FacilityLocation, ALL_FACILITIES } from '../types';

export interface ParsedRow {
  name: string;
  department: string;
  role: string;
  email: string;
  facility?: FacilityLocation;
  isSupervisor?: boolean;
  sheetName?: string;
  rawSource?: string;
}

export interface SheetInfo {
  sheetName: string;
  rowCount: number;
  headers: string[];
  rows: ParsedRow[];
  rawTable: string[][];
  warnings: string[];
  detectedFacility?: FacilityLocation;
}

export interface ParseResult {
  rows: ParsedRow[];
  headers: string[];
  rawTable?: string[][];
  warnings: string[];
  fileType: 'excel' | 'word' | 'text' | 'csv';
  sheets?: SheetInfo[];
  selectedSheetName?: string;
}

/**
 * Clean strings, remove quotes and zero-width characters
 */
function clean(str: any): string {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .trim()
    .replace(/^["']|["']$/g, '');
}

/**
 * Remove numbering or bullet markers like "1.", "1)", "-", "•", "*"
 */
function cleanBulletOrNumber(str: string): string {
  return str
    .replace(/^[\s\d]+[\.\)\-:]\s*/, '') // e.g. "1. " or "1) " or "1 - "
    .replace(/^[\u2022\u2023\u25E6\u2043\u2219\*\-\+]\s*/, '') // bullets like • or - or *
    .trim();
}

/**
 * Check if a text or sheet name corresponds to one of the 7 designated facilities
 */
export function matchFacility(str?: string): FacilityLocation | undefined {
  if (!str) return undefined;
  const s = str.toLowerCase();
  if (s.includes('kampala')) return 'Kampala';
  if (s.includes('mbarara')) return 'Mbarara';
  if (s.includes('jinja')) return 'Jinja';
  if (s.includes('gulu')) return 'Gulu';
  if (s.includes('mbale')) return 'Mbale';
  if (s.includes('arua')) return 'Arua';
  if (s.includes('fort') || s.includes('portal')) return 'Fort Portal';
  return undefined;
}

/**
 * Check if a cell indicates supervisory status
 */
export function detectSupervisorValue(str?: string): boolean {
  if (!str) return false;
  const s = str.toLowerCase().trim();
  return (
    s === 'yes' ||
    s === 'true' ||
    s === 'y' ||
    s === '1' ||
    s.includes('supervisor') ||
    s.includes('manager') ||
    s.includes('lead') ||
    s.includes('head') ||
    s.includes('director') ||
    s.includes('coordinator') ||
    s.includes('controller')
  );
}

/**
 * Detect column indexes for Name, Department, Role, Email, Facility, Supervisor
 */
export function detectColumnMapping(headers: string[]): {
  nameCol: number;
  deptCol: number;
  roleCol: number;
  emailCol: number;
  facilityCol: number;
  supervisorCol: number;
} {
  let nameCol = -1;
  let deptCol = -1;
  let roleCol = -1;
  let emailCol = -1;
  let facilityCol = -1;
  let supervisorCol = -1;

  headers.forEach((h, idx) => {
    const lower = h.toLowerCase().trim();
    if (nameCol === -1 && (lower.includes('name') || lower.includes('employee') || lower.includes('person') || lower.includes('staff') || lower.includes('member'))) {
      nameCol = idx;
    } else if (facilityCol === -1 && (lower.includes('facility') || lower.includes('branch') || lower.includes('location') || lower.includes('station') || lower.includes('site') || lower.includes('center') || lower.includes('district') || lower.includes('city'))) {
      facilityCol = idx;
    } else if (supervisorCol === -1 && (lower.includes('supervisor') || lower.includes('manager') || lower.includes('level') || lower.includes('rank') || lower.includes('leadership') || lower.includes('status'))) {
      supervisorCol = idx;
    } else if (deptCol === -1 && (lower.includes('dept') || lower.includes('department') || lower.includes('unit') || lower.includes('team') || lower.includes('division'))) {
      deptCol = idx;
    } else if (roleCol === -1 && (lower.includes('role') || lower.includes('title') || lower.includes('position') || lower.includes('job') || lower.includes('designation'))) {
      roleCol = idx;
    } else if (emailCol === -1 && (lower.includes('email') || lower.includes('mail') || lower.includes('contact'))) {
      emailCol = idx;
    }
  });

  // Default fallback if not found
  if (nameCol === -1 && headers.length > 0) nameCol = 0;
  if (deptCol === -1 && headers.length > 1) deptCol = 1;
  if (roleCol === -1 && headers.length > 2) roleCol = 2;
  if (emailCol === -1 && headers.length > 3) emailCol = 3;

  return { nameCol, deptCol, roleCol, emailCol, facilityCol, supervisorCol };
}

/**
 * Parse an Excel file (.xlsx, .xls) buffer into table rows, inspecting ALL sheets
 */
export async function parseExcelFile(arrayBuffer: ArrayBuffer): Promise<ParseResult> {
  const workbook = XLSX.read(arrayBuffer, { type: 'array' });
  const sheetNames = workbook.SheetNames || [];
  if (sheetNames.length === 0) {
    return { rows: [], headers: [], warnings: ['Workbook has no sheets.'], fileType: 'excel' };
  }

  const allSheets: SheetInfo[] = [];
  const combinedRows: ParsedRow[] = [];
  let primaryHeaders: string[] = [];

  for (const sheetName of sheetNames) {
    const sheet = workbook.Sheets[sheetName];
    if (!sheet) continue;
    const rawData: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
    const table = rawData.filter((row) =>
      Array.isArray(row) && row.some((cell) => clean(cell).length > 0)
    );
    if (table.length === 0) continue;

    const firstRow = table[0].map(clean);
    const mapping = detectColumnMapping(firstRow);
    const isHeaderRow = firstRow.some((c) =>
      ['name', 'employee', 'department', 'dept', 'role', 'title', 'facility', 'branch', 'location', 'email'].some((term) =>
        c.toLowerCase().includes(term)
      )
    );

    const headers = isHeaderRow ? firstRow : firstRow.map((_, i) => `Column ${i + 1}`);
    if (primaryHeaders.length === 0) primaryHeaders = headers;

    const dataRows = isHeaderRow ? table.slice(1) : table;
    const sheetFacility = matchFacility(sheetName);
    const sheetRows: ParsedRow[] = [];

    dataRows.forEach((r, idx) => {
      const name = clean(r[mapping.nameCol]);
      if (!name) return; // Skip empty names

      const rawDept = mapping.deptCol >= 0 && r[mapping.deptCol] ? clean(r[mapping.deptCol]) : '';
      const department = rawDept || (!sheetFacility ? sheetName : 'General');
      const role = mapping.roleCol >= 0 && r[mapping.roleCol] ? clean(r[mapping.roleCol]) : 'Team Member';
      const email = mapping.emailCol >= 0 && r[mapping.emailCol]
        ? clean(r[mapping.emailCol])
        : `${name.toLowerCase().replace(/[^a-z0-9]/g, '.')}@company.internal`;

      // Determine facility: column value first, then sheet name, fallback to Kampala
      const cellFacility = mapping.facilityCol >= 0 ? matchFacility(clean(r[mapping.facilityCol])) : undefined;
      const facility: FacilityLocation = cellFacility || sheetFacility || 'Kampala';

      // Determine supervisor: column value or role title detection
      const cellSup = mapping.supervisorCol >= 0 ? detectSupervisorValue(clean(r[mapping.supervisorCol])) : false;
      const roleSup = detectSupervisorValue(role);
      const isSupervisor = cellSup || roleSup;

      const parsedRow: ParsedRow = {
        name,
        department: department || 'General',
        role: role || 'Team Member',
        email,
        facility,
        isSupervisor,
        sheetName,
        rawSource: `${sheetName} (Row ${idx + (isHeaderRow ? 2 : 1)})`,
      };

      sheetRows.push(parsedRow);
      combinedRows.push(parsedRow);
    });

    allSheets.push({
      sheetName,
      rowCount: sheetRows.length,
      headers,
      rows: sheetRows,
      rawTable: table.map((r) => r.map(clean)),
      warnings: [],
      detectedFacility: sheetFacility,
    });
  }

  if (allSheets.length === 0) {
    return { rows: [], headers: [], warnings: ['No data found in any sheet.'], fileType: 'excel' };
  }

  return {
    rows: combinedRows,
    headers: primaryHeaders,
    rawTable: allSheets[0]?.rawTable || [],
    warnings: allSheets.length > 1
      ? [`Recognized ${allSheets.length} sheets in workbook: ${allSheets.map((s) => `"${s.sheetName}" (${s.rowCount} staff)`).join(', ')}`]
      : [],
    fileType: 'excel',
    sheets: allSheets,
    selectedSheetName: 'ALL',
  };
}

/**
 * Parse Word Document (.docx) buffer
 */
export async function parseWordFile(arrayBuffer: ArrayBuffer): Promise<ParseResult> {
  const warnings: string[] = [];
  
  // Try HTML conversion first (preserves tables and lists well)
  try {
    const htmlResult = await mammoth.convertToHtml({ arrayBuffer });
    const html = htmlResult.value;

    // Check if HTML contains tables
    if (html.includes('<table')) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const tableEl = doc.querySelector('table');
      if (tableEl) {
        const rowsEl = Array.from(tableEl.querySelectorAll('tr'));
        const table: string[][] = rowsEl.map((tr) =>
          Array.from(tr.querySelectorAll('td, th')).map((td) => clean(td.textContent))
        ).filter((r) => r.some((c) => c.length > 0));

        if (table.length > 0) {
          const firstRow = table[0];
          const mapping = detectColumnMapping(firstRow);
          const isHeader = firstRow.some((c) =>
            ['name', 'employee', 'department', 'dept', 'role', 'title'].some((t) =>
              c.toLowerCase().includes(t)
            )
          );
          const dataRows = isHeader ? table.slice(1) : table;
          const rows: ParsedRow[] = [];

          dataRows.forEach((r, idx) => {
            const name = cleanBulletOrNumber(clean(r[mapping.nameCol]));
            if (!name) return;
            const department = mapping.deptCol >= 0 && r[mapping.deptCol] ? clean(r[mapping.deptCol]) : 'General';
            const role = mapping.roleCol >= 0 && r[mapping.roleCol] ? clean(r[mapping.roleCol]) : 'Team Member';
            const email = `${name.toLowerCase().replace(/[^a-z0-9]/g, '.')}@company.internal`;

            rows.push({
              name,
              department: department || 'General',
              role: role || 'Team Member',
              email,
              rawSource: `Table Row ${idx + (isHeader ? 2 : 1)}`,
            });
          });

          if (rows.length > 0) {
            return {
              rows,
              headers: isHeader ? firstRow : firstRow.map((_, i) => `Column ${i + 1}`),
              rawTable: table,
              warnings,
              fileType: 'word',
            };
          }
        }
      }
    }

    // If no table or table was empty, fallback to raw text parsing
    const textResult = await mammoth.extractRawText({ arrayBuffer });
    return parseTextOrWordText(textResult.value, 'word');
  } catch (err: any) {
    warnings.push(`Word document parsing error: ${err?.message || 'Unknown error'}`);
    return { rows: [], headers: [], warnings, fileType: 'word' };
  }
}

/**
 * Parse plain text or text copied from Word / Excel
 * Supports:
 * 1. Tab-delimited (direct copy-paste from Excel or Word tables)
 * 2. Comma-separated or Semicolon-separated
 * 3. Dash or Pipe separated ("Alice - Engineering - Senior Dev")
 * 4. Section headings ("Engineering:\n- Alice\n- Bob\nMarketing:\n- Carol")
 */
export function parseTextOrWordText(rawText: string, type: 'text' | 'word' = 'text'): ParseResult {
  const lines = rawText.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0);
  if (lines.length === 0) {
    return { rows: [], headers: [], warnings: ['Input text is empty.'], fileType: type };
  }

  // Detect Schedule & Facilities CSV format (e.g. 2026 SCHEDULE with JINJA, MBALE, GULU, ARUA, FORT PORTAL)
  const upperText = rawText.toUpperCase();
  if (
    upperText.includes('SCHEDULE') ||
    (upperText.includes('ROLE,PERSONNEL') && upperText.includes('RECEPTION')) ||
    (upperText.includes('JINJA') && upperText.includes('MBALE'))
  ) {
    const scheduleResult = parseScheduleCsvText(lines, type);
    if (scheduleResult.rows.length > 0) {
      return scheduleResult;
    }
  }

  // Check if text is structured under Section/Department Headers:
  // e.g. "Software Engineering:" followed by bulleted names
  let isSectionBased = false;
  let sectionCount = 0;
  for (const line of lines) {
    if (line.endsWith(':') && line.length < 50) {
      sectionCount++;
    }
  }
  if (sectionCount >= 2) {
    isSectionBased = true;
  }

  if (isSectionBased) {
    const rows: ParsedRow[] = [];
    let currentDept = 'General';
    lines.forEach((line) => {
      if (line.endsWith(':') && line.length < 50) {
        currentDept = line.replace(/:$/, '').trim();
      } else {
        const rawName = cleanBulletOrNumber(line);
        if (rawName) {
          // Check if line also has a role e.g. "John Doe (Lead)" or "John Doe - Lead"
          let name = rawName;
          let role = 'Team Member';
          if (rawName.includes('(') && rawName.endsWith(')')) {
            const match = rawName.match(/^(.*?)\s*\((.*?)\)$/);
            if (match) {
              name = match[1].trim();
              role = match[2].trim();
            }
          } else if (rawName.includes('-')) {
            const parts = rawName.split('-');
            name = parts[0].trim();
            role = parts.slice(1).join('-').trim();
          }
          rows.push({
            name,
            department: currentDept,
            role: role || 'Team Member',
            email: `${name.toLowerCase().replace(/[^a-z0-9]/g, '.')}@company.internal`,
            rawSource: line,
          });
        }
      }
    });

    return {
      rows,
      headers: ['Name', 'Department', 'Role'],
      warnings: [],
      fileType: type,
    };
  }

  // Otherwise, determine delimiter per line
  // Test delimiter frequency in the first 10 lines
  const sample = lines.slice(0, 10);
  const tabCounts = sample.map((l) => (l.match(/\t/g) || []).length);
  const commaCounts = sample.map((l) => (l.match(/,/g) || []).length);
  const pipeCounts = sample.map((l) => (l.match(/\|/g) || []).length);
  const dashCounts = sample.map((l) => (l.match(/\s+-\s+/g) || []).length);

  const avgTabs = tabCounts.reduce((a, b) => a + b, 0) / sample.length;
  const avgCommas = commaCounts.reduce((a, b) => a + b, 0) / sample.length;
  const avgPipes = pipeCounts.reduce((a, b) => a + b, 0) / sample.length;
  const avgDashes = dashCounts.reduce((a, b) => a + b, 0) / sample.length;

  let delimiter: string | RegExp = '\t';
  if (avgTabs >= 1) {
    delimiter = '\t';
  } else if (avgCommas >= 1) {
    delimiter = ',';
  } else if (avgPipes >= 1) {
    delimiter = '|';
  } else if (avgDashes >= 1) {
    delimiter = /\s+-\s+/;
  } else {
    // Single column list of names
    delimiter = '';
  }

  const table: string[][] = [];
  lines.forEach((line) => {
    let parts: string[] = [];
    if (!delimiter) {
      // Just single name per line (possibly with bullets/numbers)
      parts = [cleanBulletOrNumber(line)];
    } else if (typeof delimiter === 'string') {
      parts = line.split(delimiter).map(clean);
    } else {
      parts = line.split(delimiter).map(clean);
    }
    if (parts.length > 0 && parts[0]) {
      table.push(parts);
    }
  });

  if (table.length === 0) {
    return { rows: [], headers: [], warnings: ['Could not extract any rows.'], fileType: type };
  }

  const firstRow = table[0];
  const isHeader =
    firstRow.some((c) =>
      ['name', 'employee', 'department', 'dept', 'role', 'title', 'email'].some((term) =>
        c.toLowerCase().includes(term)
      )
    );

  const mapping = detectColumnMapping(firstRow);
  const headers = isHeader ? firstRow : firstRow.map((_, i) => `Column ${i + 1}`);
  const dataRows = isHeader ? table.slice(1) : table;

  const rows: ParsedRow[] = [];
  dataRows.forEach((r, idx) => {
    const name = cleanBulletOrNumber(clean(r[mapping.nameCol] || r[0]));
    if (!name) return;

    const department = mapping.deptCol >= 0 && r[mapping.deptCol] ? clean(r[mapping.deptCol]) : 'General';
    const role = mapping.roleCol >= 0 && r[mapping.roleCol] ? clean(r[mapping.roleCol]) : 'Team Member';
    const email = mapping.emailCol >= 0 && r[mapping.emailCol]
      ? clean(r[mapping.emailCol])
      : `${name.toLowerCase().replace(/[^a-z0-9]/g, '.')}@company.internal`;

    rows.push({
      name,
      department: department || 'General',
      role: role || 'Team Member',
      email,
      rawSource: `Line ${idx + (isHeader ? 2 : 1)}`,
    });
  });

  return {
    rows,
    headers,
    rawTable: table,
    warnings: [],
    fileType: type,
  };
}

/**
 * Generate a downloadable Excel template (.xlsx)
 */
export function generateExcelTemplate(): void {
  const sampleData = [
    { Name: 'John Smith', Department: 'Software Engineering', Role: 'Senior Full Stack Engineer', Email: 'john.smith@company.com' },
    { Name: 'Emma Johnson', Department: 'Software Engineering', Role: 'Backend Specialist', Email: 'emma.johnson@company.com' },
    { Name: 'Michael Brown', Department: 'Quality Assurance & DevOps', Role: 'QA Lead', Email: 'michael.brown@company.com' },
    { Name: 'Sarah Davis', Department: 'Product Management', Role: 'Product Manager', Email: 'sarah.davis@company.com' },
    { Name: 'David Wilson', Department: 'Product Design & UX', Role: 'Product Designer', Email: 'david.wilson@company.com' },
    { Name: 'Lisa Martinez', Department: 'Marketing & Growth', Role: 'Growth Marketing Lead', Email: 'lisa.martinez@company.com' },
    { Name: 'James Taylor', Department: 'Sales & Account Management', Role: 'Enterprise Account Exec', Email: 'james.taylor@company.com' },
  ];

  const worksheet = XLSX.utils.json_to_sheet(sampleData);
  // Auto column widths
  worksheet['!cols'] = [
    { wch: 20 },
    { wch: 28 },
    { wch: 30 },
    { wch: 30 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Roster');
  XLSX.writeFile(workbook, 'Company_Roster_Excel_Template.xlsx');
}

/**
 * Generate a downloadable Word/Text template (.txt or .doc formatted)
 */
export function generateWordTemplate(): void {
  const content = `COMPANY ROSTER TEMPLATE (WORD / DOCS)
==============================================
Copy and paste this template into Microsoft Word or Google Docs, fill in your team members, and upload or paste back into the app.

OPTION 1: TABLE FORMAT (Recommended in Word)
--------------------------------------------
Name                | Department                | Role / Title
-------------------------------------------------------------------------
Alex Rivera         | Software Engineering      | Staff Backend Engineer
Maya Lin            | Software Engineering      | Senior Frontend Engineer
Devon Brooks        | Quality Assurance         | QA Automation Lead
Rachel Vance        | Product Management        | Principal PM
Samantha Reed       | Marketing & Growth        | VP of Growth
Marcus Brody        | Sales & Accounts          | Sales Director
Eleanor Sterling    | People Operations         | HR Director

OPTION 2: SECTION LIST FORMAT (Great for Word Bullet Points)
-----------------------------------------------------------
Software Engineering:
• Alex Rivera (Staff Backend Engineer)
• Maya Lin (Senior Frontend)
• David Okafor (Distributed Systems)

Product Management:
• Rachel Vance (Principal PM)
• Julian Morales (Group PM)

Marketing & Growth:
• Samantha Reed (VP Growth)
• Kofi Owusu (Demand Gen Lead)

OPTION 3: SIMPLE LINE FORMAT
----------------------------
John Doe - Software Engineering - Senior Engineer
Jane Smith - Marketing - Growth Manager
Bob Wilson - Sales - Account Exec
`;

  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', 'Company_Roster_Word_Template.txt');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Specialized parser for multi-facility schedule CSV files (e.g., 2026 SCHEDULE with JINJA, MBALE, GULU, ARUA, FORT PORTAL, and DESIGNATED POSTS)
 */
export function parseScheduleCsvText(lines: string[], type: 'text' | 'word' = 'text'): ParseResult {
  const facilityNames: Record<string, FacilityLocation> = {
    'JINJA': 'Jinja',
    'MBALE': 'Mbale',
    'GULU': 'Gulu',
    'ARUA': 'Arua',
    'FORT PORTAL': 'Fort Portal',
    'MBARARA': 'Mbarara',
    'KAMPALA': 'Kampala',
  };

  const rows: ParsedRow[] = [];
  const facilityRows: Record<string, ParsedRow[]> = {
    'Kampala (HQ)': [],
    'Jinja': [],
    'Mbale': [],
    'Gulu': [],
    'Arua': [],
    'Fort Portal': [],
    'Mbarara': [],
    'Designated Posts': [],
  };

  let currentFacility: FacilityLocation = 'Kampala';
  let currentDept = 'Operations';
  let section: 'SCHEDULE' | 'REGIONAL' | 'DESIGNATED' = 'SCHEDULE';
  let currentSheetName = 'Kampala (HQ)';
  const seenNames = new Set<string>();

  const normalizeName = (raw: string) => {
    const cleaned = raw.replace(/[^\w\s\.-]/g, '').trim();
    return cleaned
      .split(/\s+/)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ');
  };

  const getNameKey = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .sort()
      .join(' ');
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;
    const parts = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map((c) => c.trim().replace(/^"|"$/g, ''));
    const p0 = parts[0] || '';
    const p1 = parts[1] || '';
    const p0Upper = p0.toUpperCase();

    if (p0Upper.includes('SCHEDULE')) {
      section = 'SCHEDULE';
      currentFacility = 'Kampala';
      currentSheetName = 'Kampala (HQ)';
      continue;
    }

    if (facilityNames[p0Upper]) {
      section = 'REGIONAL';
      currentFacility = facilityNames[p0Upper];
      currentSheetName = currentFacility;
      currentDept = 'Operations';
      continue;
    }

    if (p0Upper.includes('DESIGNATED POSTS')) {
      section = 'DESIGNATED';
      currentSheetName = 'Designated Posts';
      continue;
    }

    if (section === 'SCHEDULE') {
      if (p0Upper === 'ROLE' || p1.toUpperCase().includes('PERSONNEL')) {
        continue;
      }
      if (p0) {
        currentDept = p0;
      }
      if (p1) {
        const rawName = p1.trim();
        const cleanName = rawName.split('(')[0].trim();
        const norm = normalizeName(cleanName);
        const key = getNameKey(norm);
        if (!norm || seenNames.has(key)) continue;

        let deptFormatted = currentDept.trim();
        const deptUpper = currentDept.toUpperCase();
        if (deptUpper === 'ENROLMENT') deptFormatted = 'Enrolment';
        else if (deptUpper === 'RECEPTION') deptFormatted = 'Reception';
        else if (deptUpper === 'APPROVAL') deptFormatted = 'Approval';
        else if (deptUpper.includes('DL RECEIPT')) deptFormatted = 'DL Receipt & Issuance';
        else if (deptUpper.includes('CUSTOMER CARE')) deptFormatted = 'Customer Care';
        else if (deptUpper.includes('TECHNICAL')) deptFormatted = 'Technical Team';
        else if (deptUpper.includes('CALL CENTER')) deptFormatted = 'Call Center';
        else if (deptUpper.includes('STOCK CONTROL')) deptFormatted = 'Stock Control';
        else if (deptUpper.includes('QUALITY ASSURANCE')) deptFormatted = 'Quality Assurance';
        else if (deptUpper.includes('SUPERVISORS')) deptFormatted = 'Supervisors';
        else if (deptUpper.includes('SHIPMENT')) deptFormatted = 'Shipment';

        let roleFormatted = currentDept.trim();
        if (rawName.toUpperCase().includes('UPCOUNTRY')) {
          roleFormatted += ' (Upcountry Support)';
        }

        const isSupervisor =
          deptUpper.includes('SUPERVISOR') ||
          deptUpper.includes('MANAGER') ||
          deptUpper.includes('COORDINATOR') ||
          deptUpper.includes('HEAD');

        const parsedRow: ParsedRow = {
          name: norm,
          role: roleFormatted,
          department: deptFormatted,
          facility: 'Kampala',
          isSupervisor,
          email: `${norm.toLowerCase().replace(/\s+/g, '.')}@udls.go.ug`,
          rawSource: line,
          sheetName: 'Kampala (HQ)',
        };

        rows.push(parsedRow);
        facilityRows['Kampala (HQ)'].push(parsedRow);
        seenNames.add(key);
      }
    } else if (section === 'REGIONAL') {
      if (
        ['name', 'role', 'staff', 'office', 'udls'].some((h) => p0.toLowerCase().includes(h)) ||
        ['role', 'responsibility', 'personnel'].some((h) => p1.toLowerCase().includes(h))
      ) {
        continue;
      }

      const rawName = p0.trim();
      const role = p1.trim() || 'Operations Staff';
      if (rawName) {
        const norm = normalizeName(rawName);
        const key = getNameKey(norm);
        if (!norm || seenNames.has(key)) continue;

        const roleLower = role.toLowerCase();
        let dept = 'Operations';
        if (roleLower.includes('enroll')) dept = 'Enrolment';
        else if (roleLower.includes('recept') && roleLower.includes('issuan')) dept = 'DL Receipt & Issuance';
        else if (roleLower.includes('recept')) dept = 'Reception';
        else if (roleLower.includes('issuan')) dept = 'DL Receipt & Issuance';
        else if (roleLower.includes('supervisor')) dept = 'Facility Supervisors';
        else if (roleLower.includes('assistant')) dept = 'Office Support';

        const isSupervisor = roleLower.includes('supervisor') || roleLower.includes('manager');

        const parsedRow: ParsedRow = {
          name: norm,
          role: role,
          department: dept,
          facility: currentFacility,
          isSupervisor,
          email: `${norm.toLowerCase().replace(/\s+/g, '.')}@udls.go.ug`,
          rawSource: line,
          sheetName: currentSheetName,
        };

        rows.push(parsedRow);
        if (!facilityRows[currentSheetName]) facilityRows[currentSheetName] = [];
        facilityRows[currentSheetName].push(parsedRow);
        seenNames.add(key);
      }
    } else if (section === 'DESIGNATED') {
      if (p0.toLowerCase() === 'name' || !p0) continue;
      const names = p0.split(',').map((n) => n.trim()).filter(Boolean);
      const func = p1.trim();

      for (const rawN of names) {
        const norm = normalizeName(rawN);
        const key = getNameKey(norm);
        if (seenNames.has(key)) continue;

        const facility: FacilityLocation = norm.toLowerCase().includes('birungi marion') ? 'Mbarara' : 'Kampala';
        let dept = 'Operations';
        if (func.includes('Communications')) dept = 'Communications';
        else if (func.includes('IT') || func.includes('System')) dept = 'IT & Systems';
        else if (func.includes('Accountant')) dept = 'Finance & Accounts';
        else if (func.includes('Admin') || func.includes('PA to PC')) dept = 'Administration';
        else if (func.includes('Driver')) dept = 'Transport & Logistics';
        else if (func.includes('Quality')) dept = 'Quality Assurance';
        else if (func.includes('Security')) dept = 'Security';
        else if (func.includes('Statistics')) dept = 'Statistics & Analytics';
        else if (func.includes('Stores')) dept = 'Stores & Logistics';
        else if (func.includes('Facility Supervisors')) dept = 'Facility Supervisors';

        const isSupervisor = ['manager', 'supervisor', 'coordinator', 'head', 'pa to pc', 'accountant'].some((k) =>
          func.toLowerCase().includes(k)
        );

        const parsedRow: ParsedRow = {
          name: norm,
          role: func,
          department: dept,
          facility,
          isSupervisor,
          email: `${norm.toLowerCase().replace(/\s+/g, '.')}@udls.go.ug`,
          rawSource: line,
          sheetName: facility === 'Mbarara' ? 'Mbarara' : 'Designated Posts',
        };

        rows.push(parsedRow);
        if (facility === 'Mbarara') {
          facilityRows['Mbarara'].push(parsedRow);
        } else {
          facilityRows['Designated Posts'].push(parsedRow);
        }
        seenNames.add(key);
      }
    }
  }

  const sheets: SheetInfo[] = Object.entries(facilityRows)
    .filter(([_, r]) => r.length > 0)
    .map(([name, r]) => ({
      sheetName: name,
      rowCount: r.length,
      detectedFacility: matchFacility(name),
      headers: ['Name', 'Role / Responsibility', 'Department', 'Facility', 'Supervisory Level'],
      rows: r,
      rawTable: r.map((row) => [row.name, row.role, row.department, row.facility || '', row.isSupervisor ? 'Supervisor' : 'Staff']),
      warnings: [],
    }));

  return {
    rows,
    headers: ['Name', 'Role / Title', 'Department', 'Facility', 'Supervisory Level'],
    sheets,
    warnings: [],
    fileType: type,
  };
}

