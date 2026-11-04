import React, { useState, useRef, useMemo } from 'react';
import { Person, DepartmentCluster, FacilityLocation, ALL_FACILITIES } from '../types';
import { allocateEmployeeIds } from '../utils/employeeIds';
import {
  parseExcelFile,
  parseWordFile,
  parseTextOrWordText,
  generateExcelTemplate,
  generateWordTemplate,
  ParsedRow,
  ParseResult,
  SheetInfo,
} from '../utils/fileImportParsers';
import {
  FileSpreadsheet,
  FileText,
  Upload,
  ClipboardPaste,
  Check,
  AlertCircle,
  X,
  Trash2,
  Download,
  ArrowRight,
  Info,
  Layers,
  MapPin,
  Shield,
  Copy,
  CheckCheck,
} from 'lucide-react';

interface ExcelWordImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (newPeople: Person[], mode: 'replace' | 'append') => void;
  existingCount: number;
  existingIds: string[];
  clusters: DepartmentCluster[];
}

export const ExcelWordImportModal: React.FC<ExcelWordImportModalProps> = ({
  isOpen,
  onClose,
  onImport,
  existingCount,
  existingIds,
  clusters,
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('upload');
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileType, setFileType] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [pasteText, setPasteText] = useState('');
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [importMode, setImportMode] = useState<'replace' | 'append'>('replace');

  // Multi-sheet inspection state
  const [selectedSheetName, setSelectedSheetName] = useState<string>('ALL');
  const [importScope, setImportScope] = useState<'ALL_SHEETS' | 'SELECTED_SHEET'>('ALL_SHEETS');
  const [copiedSummary, setCopiedSummary] = useState(false);

  // Default fallback department
  const [defaultDept, setDefaultDept] = useState(clusters[0]?.departments[0] || 'Operations & Field Services');

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Process uploaded file
  const processFile = async (file: File) => {
    setLoading(true);
    setFileName(file.name);
    setSelectedSheetName('ALL');
    setImportScope('ALL_SHEETS');

    try {
      const ext = file.name.split('.').pop()?.toLowerCase();
      const buffer = await file.arrayBuffer();
      let result: ParseResult;

      if (ext === 'xlsx' || ext === 'xls') {
        setFileType('Excel Workbook (.xlsx / .xls)');
        result = await parseExcelFile(buffer);
      } else if (ext === 'docx') {
        setFileType('Word Document (.docx)');
        result = await parseWordFile(buffer);
      } else {
        // Text / CSV
        setFileType('CSV / Delimited Text');
        const text = new TextDecoder('utf-8').decode(buffer);
        result = parseTextOrWordText(text, 'text');
      }

      setParseResult(result);
    } catch (err: any) {
      setParseResult({
        rows: [],
        headers: [],
        warnings: [`Failed to parse file: ${err?.message || 'Unsupported format'}`],
        fileType: 'text',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const handlePasteChange = (text: string) => {
    setPasteText(text);
    setSelectedSheetName('ALL');
    if (!text.trim()) {
      setParseResult(null);
      return;
    }
    const result = parseTextOrWordText(text, 'text');
    setParseResult(result);
  };

  // Determine which rows to display based on selected sheet
  const displayedRows = useMemo(() => {
    if (!parseResult) return [];
    if (selectedSheetName === 'ALL' || !parseResult.sheets || parseResult.sheets.length <= 1) {
      return parseResult.rows;
    }
    const sheet = parseResult.sheets.find((s) => s.sheetName === selectedSheetName);
    return sheet ? sheet.rows : parseResult.rows;
  }, [parseResult, selectedSheetName]);

  // Determine which rows to import
  const rowsToImport = useMemo(() => {
    if (!parseResult) return [];
    if (importScope === 'SELECTED_SHEET' && selectedSheetName !== 'ALL' && parseResult.sheets) {
      const sheet = parseResult.sheets.find((s) => s.sheetName === selectedSheetName);
      return sheet ? sheet.rows : parseResult.rows;
    }
    return parseResult.rows;
  }, [parseResult, importScope, selectedSheetName]);

  const handleRemoveRow = (index: number) => {
    if (!parseResult) return;
    const updated = [...displayedRows];
    updated.splice(index, 1);

    if (selectedSheetName === 'ALL') {
      setParseResult({ ...parseResult, rows: updated });
    } else if (parseResult.sheets) {
      const updatedSheets = parseResult.sheets.map((s) =>
        s.sheetName === selectedSheetName ? { ...s, rows: updated, rowCount: updated.length } : s
      );
      const allUpdatedRows = updatedSheets.flatMap((s) => s.rows);
      setParseResult({ ...parseResult, sheets: updatedSheets, rows: allUpdatedRows });
    }
  };

  // Copy full sheets structure summary to clipboard (so the user can paste it into chat or share with admins)
  const handleCopySheetsSummary = () => {
    if (!parseResult) return;

    let summaryText = `EXCEL WORKBOOK ANALYSIS: ${fileName || 'Uploaded Workbook'}\n`;
    summaryText += `Total Recognized Personnel: ${parseResult.rows.length}\n`;

    if (parseResult.sheets && parseResult.sheets.length > 0) {
      summaryText += `Number of Sheets: ${parseResult.sheets.length}\n\n`;
      parseResult.sheets.forEach((sheet, idx) => {
        summaryText += `--- SHEET ${idx + 1}: "${sheet.sheetName}" ---\n`;
        summaryText += `• Staff Count: ${sheet.rowCount}\n`;
        if (sheet.detectedFacility) {
          summaryText += `• Detected Facility: ${sheet.detectedFacility}\n`;
        }
        summaryText += `• Headers: ${sheet.headers.join(' | ')}\n`;
        summaryText += `• Sample Staff (First 3):\n`;
        sheet.rows.slice(0, 3).forEach((r) => {
          summaryText += `   - ${r.name} (${r.role}) - Dept: ${r.department} - Facility: ${r.facility || 'Kampala'} ${r.isSupervisor ? '[Supervisor]' : ''}\n`;
        });
        summaryText += `\n`;
      });
    } else {
      summaryText += `Headers: ${parseResult.headers.join(' | ')}\n`;
      summaryText += `Sample Rows (First 5):\n`;
      parseResult.rows.slice(0, 5).forEach((r) => {
        summaryText += `• ${r.name} - ${r.role} - ${r.department} - ${r.facility || 'Kampala'}\n`;
      });
    }

    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(summaryText);
      setCopiedSummary(true);
      setTimeout(() => setCopiedSummary(false), 3000);
    }
  };

  const handleConfirmImport = () => {
    if (rowsToImport.length === 0) return;

    // Convert ParsedRows to complete Person records preserving facility and supervisor
    const reserved = importMode === 'append' ? existingIds : [];
    const ids = allocateEmployeeIds(reserved, rowsToImport.length);
    const newPeople: Person[] = rowsToImport.map((row, idx) => {
      return {
        id: ids[idx],
        name: row.name,
        department: row.department === 'General' && defaultDept ? defaultDept : row.department,
        role: row.role || 'Team Member',
        facility: row.facility || 'Kampala',
        isSupervisor: Boolean(row.isSupervisor),
        email: row.email || `${row.name.toLowerCase().replace(/[^a-z0-9]/g, '.')}@company.internal`,
      };
    });

    onImport(newPeople, importMode);
    onClose();
  };

  const allDepts = Array.from(new Set(clusters.flatMap((c) => c.departments))).sort();

  return (
    <div className="fixed inset-0 bg-[#071224]/80 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full border border-[#E2E8F0] shadow-2xl my-auto max-h-[94vh] flex flex-col overflow-hidden">
        {/* Executive Header */}
        <div className="flex items-center justify-between border-b border-[#132E52] p-5 sm:p-6 shrink-0 bg-[#0A192F] text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#071224] border border-[#FFC700]/40 flex items-center justify-center text-[#FFD700] shadow-2xs">
              <FileSpreadsheet className="w-5 h-5 text-[#FFC700]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-tight">
                  Import Roster from Excel (Multi-Sheet Supported)
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#071224] border border-[#FFC700]/40 text-[#FFD700] font-bold">
                  All 7 Facilities
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Automatically scans all sheets, detects facilities, job titles, departments, and supervisory levels.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto flex-1 overscroll-contain">
          {/* Tab switch & Templates strip */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-1 bg-[#F4F6F9] p-1 rounded-xl border border-[#E2E8F0]">
              <button
                onClick={() => setActiveTab('upload')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'upload'
                    ? 'bg-[#0A192F] text-[#FFD700] shadow-2xs'
                    : 'text-slate-600 hover:text-[#0A192F]'
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Excel File (.xlsx / .xls)</span>
              </button>
              <button
                onClick={() => setActiveTab('paste')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'paste'
                    ? 'bg-[#0A192F] text-[#FFD700] shadow-2xs'
                    : 'text-slate-600 hover:text-[#0A192F]'
                }`}
              >
                <ClipboardPaste className="w-3.5 h-3.5" />
                <span>Copy & Paste Text / Table</span>
              </button>
            </div>

            {/* Download sample templates */}
            <div className="flex items-center gap-2 text-xs">
              <button
                onClick={generateExcelTemplate}
                className="text-slate-700 hover:text-[#0A192F] bg-[#F8FAFC] border border-[#E2E8F0] hover:bg-[#F4F6F9] px-3 py-1.5 rounded-xl flex items-center gap-1.5 font-semibold transition-colors cursor-pointer"
                title="Download pre-formatted Excel template (.xlsx)"
              >
                <Download className="w-3.5 h-3.5 text-emerald-600" />
                <span>Template (.xlsx)</span>
              </button>
            </div>
          </div>

          {/* Upload Dropzone */}
          {activeTab === 'upload' && (
            <div>
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-7 text-center cursor-pointer transition-all ${
                  isDragging
                    ? 'border-[#FFC700] bg-amber-50/50 scale-[0.99]'
                    : 'border-[#CBD5E1] hover:border-[#0A192F] bg-[#F8FAFC] hover:bg-white'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls,.docx,.csv,.tsv,.txt"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <div className="flex justify-center gap-3 mb-2.5">
                  <div className="w-12 h-12 rounded-2xl bg-[#0A192F] text-[#FFD700] flex items-center justify-center shadow-xs border border-[#FFC700]/30">
                    <FileSpreadsheet className="w-6 h-6 text-[#FFD700]" />
                  </div>
                </div>
                <div className="text-sm font-bold text-[#0A192F]">
                  Click to select or drag & drop your Excel file here
                </div>
                <div className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                  Supports multi-sheet workbooks! If your Excel file has separate tabs for Kampala, Mbarara, Jinja, etc., the system detects and separates every sheet.
                </div>
              </div>

              {fileName && (
                <div className="mt-3 p-3.5 bg-[#F8FAFC] rounded-2xl flex items-center justify-between text-xs border border-[#E2E8F0]">
                  <div className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <span className="font-bold text-[#0A192F]">{fileName}</span>
                      <span className="text-slate-500 ml-2">({fileType})</span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setFileName(null);
                      setParseResult(null);
                    }}
                    className="text-slate-400 hover:text-rose-600 font-semibold cursor-pointer px-2 py-1 rounded-lg"
                  >
                    Clear
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'paste' && (
            <div className="space-y-2">
              <label className="block text-xs font-bold text-[#0A192F] uppercase tracking-wider">
                Paste names, departments, and facilities from Excel:
              </label>
              <textarea
                rows={6}
                value={pasteText}
                onChange={(e) => handlePasteChange(e.target.value)}
                placeholder={`Paste directly from Excel. Examples:\nArthur Mukasa\tProject Coordinator\tCoordination & Transport\tKampala\tYes\nGrace Namatovu\tPA to PC\tCoordination & Transport\tKampala\tNo\nDavid Kato\tField Officer\tHealth & Community\tMbarara\tNo`}
                className="w-full p-3 text-xs font-mono bg-[#F8FAFC] border border-[#CBD5E1] rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0A192F] focus:border-[#FFC700] text-[#0A192F]"
              />
              <div className="flex items-center gap-2 text-[11px] text-slate-500">
                <Info className="w-3.5 h-3.5 text-slate-400" />
                <span>
                  Tip: In Excel, select your columns and press Ctrl+C, then paste here!
                </span>
              </div>
            </div>
          )}

          {/* MULTI-SHEET INSPECTOR & PREVIEW */}
          {parseResult && (
            <div className="space-y-4 pt-3 border-t border-[#EAEFF5]">
              {/* Warnings / Notifications */}
              {parseResult.warnings.length > 0 && (
                <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-xs flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span className="font-medium">{parseResult.warnings.join(' ')}</span>
                  </div>
                  {parseResult.sheets && parseResult.sheets.length > 1 && (
                    <button
                      onClick={handleCopySheetsSummary}
                      className="px-2.5 py-1 bg-white border border-amber-300 rounded-lg text-[11px] font-bold text-amber-900 hover:bg-amber-100 flex items-center gap-1 shrink-0 cursor-pointer"
                      title="Copy sheet breakdown text"
                    >
                      {copiedSummary ? <CheckCheck className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-amber-700" />}
                      <span>{copiedSummary ? 'Copied!' : 'Copy Summary'}</span>
                    </button>
                  )}
                </div>
              )}

              {/* SHEET TABS: When workbook has multiple sheets */}
              {parseResult.sheets && parseResult.sheets.length > 1 && (
                <div className="bg-[#0A192F] border border-[#132E52] rounded-2xl p-3.5 text-white space-y-2.5 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-xs">
                      <Layers className="w-4 h-4 text-[#FFD700]" />
                      <span className="font-bold text-white">
                        Different Sheets Detected in Excel ({parseResult.sheets.length} Sheets):
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-slate-300 text-[11px]">Click any sheet tab to view:</span>
                      <button
                        onClick={handleCopySheetsSummary}
                        className="px-2.5 py-1 bg-[#071224] border border-[#FFC700]/40 text-[#FFD700] hover:text-white rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        {copiedSummary ? <CheckCheck className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-[#FFC700]" />}
                        <span>{copiedSummary ? 'Copied Breakdown' : 'Copy Sheet Analysis'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Horizontal Scrollable Sheet Badges */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    {/* All Sheets Tab */}
                    <button
                      type="button"
                      onClick={() => setSelectedSheetName('ALL')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
                        selectedSheetName === 'ALL'
                          ? 'bg-[#FFC700] text-[#0A192F] border-[#FFC700] shadow-sm font-black'
                          : 'bg-[#071224] text-slate-200 border-[#1E3A5F] hover:border-[#FFC700]/50'
                      }`}
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>All Sheets Combined</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${selectedSheetName === 'ALL' ? 'bg-[#0A192F] text-[#FFD700]' : 'bg-[#132E52] text-slate-300'}`}>
                        {parseResult.rows.length}
                      </span>
                    </button>

                    {/* Individual Sheet Tabs */}
                    {parseResult.sheets.map((sheet) => {
                      const isSelected = selectedSheetName === sheet.sheetName;
                      return (
                        <button
                          key={sheet.sheetName}
                          type="button"
                          onClick={() => setSelectedSheetName(sheet.sheetName)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
                            isSelected
                              ? 'bg-[#FFC700] text-[#0A192F] border-[#FFC700] shadow-sm font-black'
                              : 'bg-[#071224] text-slate-200 border-[#1E3A5F] hover:border-[#FFC700]/50'
                          }`}
                        >
                          <FileSpreadsheet className={`w-3.5 h-3.5 ${isSelected ? 'text-[#0A192F]' : 'text-[#FFD700]'}`} />
                          <span>{sheet.sheetName}</span>
                          <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${isSelected ? 'bg-[#0A192F] text-[#FFD700]' : 'bg-[#132E52] text-slate-300'}`}>
                            {sheet.rowCount}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Scope Selector: Import All or Only This Sheet */}
                  <div className="pt-2 border-t border-[#132E52] flex flex-wrap items-center justify-between text-xs gap-3">
                    <span className="text-slate-300 text-[11px]">
                      Currently previewing:{' '}
                      <strong className="text-[#FFD700]">
                        {selectedSheetName === 'ALL' ? 'All Sheets Combined' : `Sheet: "${selectedSheetName}"`}
                      </strong>{' '}
                      ({displayedRows.length} staff)
                    </span>

                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-1.5 cursor-pointer text-slate-200">
                        <input
                          type="radio"
                          name="importScope"
                          checked={importScope === 'ALL_SHEETS'}
                          onChange={() => setImportScope('ALL_SHEETS')}
                          className="accent-[#FFC700]"
                        />
                        <span>Import All Sheets Combined ({parseResult.rows.length})</span>
                      </label>

                      {selectedSheetName !== 'ALL' && (
                        <label className="flex items-center gap-1.5 cursor-pointer text-[#FFD700] font-bold">
                          <input
                            type="radio"
                            name="importScope"
                            checked={importScope === 'SELECTED_SHEET'}
                            onChange={() => setImportScope('SELECTED_SHEET')}
                            className="accent-[#FFC700]"
                          />
                          <span>Import Only "{selectedSheetName}" ({displayedRows.length})</span>
                        </label>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Stats Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  <span className="text-xs font-bold text-[#0A192F]">
                    {displayedRows.length} Employees in Preview
                  </span>
                  {selectedSheetName !== 'ALL' && (
                    <span className="text-xs text-slate-500">
                      (from sheet: <strong className="text-[#0A192F]">{selectedSheetName}</strong>)
                    </span>
                  )}
                </div>

                {/* Default Department fallback */}
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <span>If department blank:</span>
                  <select
                    value={defaultDept}
                    onChange={(e) => setDefaultDept(e.target.value)}
                    className="text-xs bg-white border border-[#CBD5E1] rounded-lg px-2 py-1 text-[#0A192F] font-medium"
                  >
                    {allDepts.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Preview Table with Sheet and Facility Details */}
              <div className="border border-[#E2E8F0] rounded-2xl overflow-hidden max-h-60 overflow-y-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#0A192F] text-slate-200 font-bold sticky top-0 border-b border-[#132E52]">
                    <tr>
                      <th className="p-2.5 w-10 font-mono">#</th>
                      <th className="p-2.5">Name</th>
                      <th className="p-2.5">Department</th>
                      <th className="p-2.5">Facility Location</th>
                      <th className="p-2.5">Role & Level</th>
                      {parseResult.sheets && parseResult.sheets.length > 1 && (
                        <th className="p-2.5">Sheet Source</th>
                      )}
                      <th className="p-2.5 text-right w-12">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EAEFF5]">
                    {displayedRows.slice(0, 60).map((row, idx) => (
                      <tr key={idx} className="hover:bg-[#F8FAFC]">
                        <td className="p-2.5 font-mono text-slate-400 tabular-nums">
                          {idx + 1}
                        </td>
                        <td className="p-2.5 font-bold text-[#0A192F]">
                          {row.name}
                        </td>
                        <td className="p-2.5 text-slate-700 font-medium">
                          {row.department === 'General' ? defaultDept : row.department}
                        </td>
                        <td className="p-2.5">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#EAEFF5] text-[#0A192F] font-semibold text-[11px] border border-[#E2E8F0]">
                            <MapPin className="w-3 h-3 text-slate-500" />
                            <span>{row.facility || 'Kampala'}</span>
                          </span>
                        </td>
                        <td className="p-2.5">
                          <div className="font-medium text-[#0A192F]">{row.role}</div>
                          <div className="mt-0.5">
                            {row.isSupervisor ? (
                              <span className="text-[10px] font-bold text-purple-800 bg-purple-50 border border-purple-200 px-1.5 py-0.2 rounded inline-flex items-center gap-0.5">
                                <Shield className="w-2.5 h-2.5 text-purple-600" />
                                Supervisor
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-500 font-normal">
                                Facility Staff
                              </span>
                            )}
                          </div>
                        </td>
                        {parseResult.sheets && parseResult.sheets.length > 1 && (
                          <td className="p-2.5 font-mono text-slate-500 text-[11px]">
                            {row.sheetName || 'Sheet1'}
                          </td>
                        )}
                        <td className="p-2.5 text-right">
                          <button
                            onClick={() => handleRemoveRow(idx)}
                            className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                            title="Remove row"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {displayedRows.length > 60 && (
                <div className="text-center text-[11px] text-slate-400 font-mono">
                  Showing first 60 rows of {displayedRows.length} in this sheet
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer: Import Mode & Actions (Pinned at bottom) */}
        <div className="p-4 sm:p-5 border-t border-[#E2E8F0] bg-[#F8FAFC] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
          {/* Mode choice */}
          <div className="flex flex-wrap items-center gap-4 text-xs">
            <span className="font-bold text-[#0A192F]">Roster Mode:</span>
            <label className="flex items-center gap-1.5 cursor-pointer text-slate-800">
              <input
                type="radio"
                name="importMode"
                value="replace"
                checked={importMode === 'replace'}
                onChange={() => setImportMode('replace')}
                className="accent-[#0A192F]"
              />
              <span>Replace entire roster ({rowsToImport.length} people)</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer text-slate-800">
              <input
                type="radio"
                name="importMode"
                value="append"
                checked={importMode === 'append'}
                onChange={() => setImportMode('append')}
                className="accent-[#0A192F]"
              />
              <span>Append to current ({existingCount} + {rowsToImport.length})</span>
            </label>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-[#EAEFF5] rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              disabled={!parseResult || rowsToImport.length === 0}
              onClick={handleConfirmImport}
              className="px-5 py-2.5 text-xs font-black text-[#0A192F] bg-[#FFC700] hover:bg-[#F5B800] rounded-xl transition-all disabled:opacity-40 flex items-center gap-2 shadow-sm shadow-[#FFC700]/30 cursor-pointer"
            >
              <span>Import {rowsToImport.length} Personnel</span>
              <ArrowRight className="w-4 h-4 stroke-[3]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
