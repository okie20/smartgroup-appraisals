import React from 'react';
import { Person, AllocatedGroup, DepartmentCluster } from '../types';
import { exportGroupsToCsv, exportMemberDirectoryToCsv, exportPanelsToExcel } from '../utils/exportUtils';
import { Download, FileSpreadsheet, X, Users, Layers, Table2 } from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  people: Person[];
  groups: AllocatedGroup[];
  memberToGroupMap: Record<string, string>;
  peopleMap: Map<string, Person>;
  clusters: DepartmentCluster[];
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  people,
  groups,
  memberToGroupMap,
  peopleMap,
  clusters,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-xl max-w-lg w-full border border-slate-200 shadow-2xl flex flex-col max-h-[90vh] my-auto overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 p-5 shrink-0 bg-white">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-slate-700" />
            <h3 className="text-sm font-semibold text-slate-900">Export Group Allocations</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-3 overflow-y-auto flex-1 overscroll-contain">
          <p className="text-xs text-slate-500">
            Download formatted spreadsheets showing how all {groups.length} panels are structured.
          </p>

          {/* ── Excel: Full Panels (new) ── */}
          <div className="p-3.5 border-2 border-indigo-200 bg-indigo-50/50 rounded-xl flex items-start justify-between gap-3">
            <div>
              <div className="text-xs font-bold text-indigo-900 flex items-center gap-1.5 mb-0.5">
                <Table2 className="w-3.5 h-3.5 text-indigo-600" />
                <span>All Panels — Excel Workbook</span>
                <span className="text-[10px] font-black text-white bg-indigo-500 px-1.5 py-0.5 rounded-full ml-1">EXCEL</span>
              </div>
              <p className="text-[11px] text-indigo-700 leading-relaxed">
                Full workbook with <strong>two sheets</strong>:
              </p>
              <ul className="text-[11px] text-indigo-700 mt-1 space-y-0.5 ml-2">
                <li>• <strong>All Panels</strong> — every reviewer listed row by row for all {groups.length} panels</li>
                <li>• <strong>Panel Summary</strong> — one row per panel, all reviewers across columns</li>
              </ul>
              <p className="text-[11px] text-indigo-600 mt-1.5">
                Includes: Employee name, ID, role, department, facility, Annex A rule, reviewer names & departments.
              </p>
            </div>
            <button
              onClick={() => exportPanelsToExcel(groups, peopleMap)}
              className="px-3.5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg flex items-center gap-1.5 shrink-0 shadow-sm transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>.xlsx</span>
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-2 text-[11px] text-slate-400 font-medium">
            <div className="flex-1 h-px bg-slate-200" />
            <span>Also available as CSV</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          {/* Groups CSV */}
          <div className="p-3 border border-slate-200 rounded-lg flex items-center justify-between hover:border-slate-300 transition-colors">
            <div>
              <div className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-slate-500" />
                Groups Allocation Roster (CSV)
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                All {groups.length} panels — reviewee, department and reviewer list per group
              </p>
            </div>
            <button
              onClick={() => exportGroupsToCsv(groups, peopleMap)}
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1.5 shrink-0 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />CSV
            </button>
          </div>

          {/* Member Directory CSV */}
          <div className="p-3 border border-slate-200 rounded-lg flex items-center justify-between hover:border-slate-300 transition-colors">
            <div>
              <div className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-slate-500" />
                Member Directory & Assignments (CSV)
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                All {people.length} employees — their panel and who they are reviewing
              </p>
            </div>
            <button
              onClick={() => exportMemberDirectoryToCsv(people, groups, memberToGroupMap, peopleMap)}
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1.5 shrink-0 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />CSV
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 flex justify-end shrink-0 bg-slate-50/70">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
