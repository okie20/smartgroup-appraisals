import React from 'react';
import { Person, AllocatedGroup, DepartmentCluster } from '../types';
import { exportGroupsToCsv, exportMemberDirectoryToCsv } from '../utils/exportUtils';
import { Download, FileSpreadsheet, X, Users, Layers } from 'lucide-react';

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
        {/* Pinned Header */}
        <div className="flex items-center justify-between border-b border-slate-100 p-5 shrink-0 bg-white">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-slate-700" />
            <h3 className="text-sm font-semibold text-slate-900">
              Export Group Allocations
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1 overscroll-contain">
          <p className="text-xs text-slate-500">
            Download formatted CSV spreadsheets compatible with Microsoft Excel, Google Sheets, or internal company systems.
          </p>

          <div className="space-y-3 pt-1">
            {/* Option 1: Groups Roster */}
            <div className="p-3 border border-slate-200 rounded-lg hover:border-slate-300 transition-colors flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-slate-600" />
                  <span>1. Groups Allocation Roster</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Summary of all {groups.length} review groups with Employee Being Reviewed, department, and reviewer lists
                </div>
              </div>
              <button
                onClick={() => exportGroupsToCsv(groups, peopleMap)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded flex items-center gap-1.5 shrink-0"
              >
                <Download className="w-3.5 h-3.5" />
                <span>CSV</span>
              </button>
            </div>

            {/* Option 2: Member Directory */}
            <div className="p-3 border border-slate-200 rounded-lg hover:border-slate-300 transition-colors flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-slate-600" />
                  <span>2. Member Directory & Review Assignments</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Row-by-row directory of all {people.length} employees showing their allocated review panel and reviewing duties
                </div>
              </div>
              <button
                onClick={() => exportMemberDirectoryToCsv(people, groups, memberToGroupMap, peopleMap)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded flex items-center gap-1.5 shrink-0"
              >
                <Download className="w-3.5 h-3.5" />
                <span>CSV</span>
              </button>
            </div>
          </div>
        </div>

        {/* Pinned Footer */}
        <div className="p-4 border-t border-slate-100 flex justify-end shrink-0 bg-slate-50/70">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
