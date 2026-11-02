import React from 'react';
import { AllocatedGroup, Person, DepartmentCluster } from '../types';
import { getAffinityType } from '../utils/groupingEngine';
import { findMatchingAnnexARule } from '../data/annexASpecifications';
import { Printer, X, UserCheck, Users, Building, ShieldCheck } from 'lucide-react';

interface PrintableGroupSheetModalProps {
  group: AllocatedGroup | null;
  peopleMap: Map<string, Person>;
  clusters?: DepartmentCluster[];
  onClose: () => void;
}

export const PrintableGroupSheetModal: React.FC<PrintableGroupSheetModalProps> = ({
  group,
  peopleMap,
  clusters = [],
  onClose,
}) => {
  if (!group) return null;

  const reviewee = peopleMap.get(group.revieweeId);
  const members = group.memberIds.map((id) => peopleMap.get(id)).filter(Boolean) as Person[];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-xl max-w-3xl w-full p-6 sm:p-8 border border-slate-200 shadow-2xl space-y-6 my-auto max-h-[92vh] overflow-y-auto">
        {/* Modal Controls (No print) */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4 no-print shrink-0">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Printable Group Review Sheet
            </h3>
            <p className="text-xs text-slate-500">
              Formatted document for meeting sign-in, peer review session, and record keeping.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Print Sheet</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="p-4 bg-white text-slate-900 space-y-6">
          {/* Header */}
          <div className="border-b-2 border-slate-900 pb-4">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-xl font-bold tracking-tight text-slate-900">
                  {group.name} — Review Roster Sheet
                </h1>
                <p className="text-xs text-slate-600 mt-1">
                  Primary Department: <strong>{group.primaryDepartment}</strong>
                </p>
              </div>
              <div className="text-right text-xs font-mono text-slate-500">
                <div>Panel Size: {members.length} Reviewers</div>
                <div>Status: Confirmed</div>
              </div>
            </div>

            {/* EMPLOYEE BEING REVIEWED CALLOUT */}
            {reviewee && (
              <div className="mt-4 p-3 bg-slate-50 border border-slate-300 rounded-lg">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5 mb-1">
                  <UserCheck className="w-4 h-4 text-slate-900" />
                  <span>Employee Being Reviewed:</span>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-900">
                  <div>
                    <strong className="text-sm">{reviewee.name}</strong> ({reviewee.id})
                  </div>
                  <div className="text-slate-700">
                    Department: <strong>{reviewee.department}</strong> · Role: <strong>{reviewee.role}</strong>
                  </div>
                </div>
                {(() => {
                  const rule = findMatchingAnnexARule(reviewee.role, reviewee.department);
                  if (!rule) return null;
                  return (
                    <div className="mt-2 pt-1.5 border-t border-slate-200 text-[10px] text-slate-700 flex items-center gap-1.5 font-medium">
                      <ShieldCheck className="w-3.5 h-3.5 text-indigo-700 inline" />
                      <span>
                        <strong>Annex A Statutory Panel:</strong> {rule.functionTitle} — Required: "{rule.originalAppraisersText}"
                      </span>
                    </div>
                  );
                })()}
                <p className="text-[10px] text-slate-500 italic mt-1">
                  * Note: This employee is the subject of review and is not considered a member of the reviewing panel.
                </p>
              </div>
            )}
          </div>

          {/* Group Member Table */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-4 h-4 text-slate-700" />
                <span>Allocated Reviewing Panel Members ({members.length})</span>
              </h2>
              <span className="text-[11px] text-slate-500 font-mono">
                Drawn from same & close departments
              </span>
            </div>

            <table className="w-full text-xs text-left border border-slate-300 border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 border-b border-slate-300">
                  <th className="p-2 border-r border-slate-300 w-10 font-mono">#</th>
                  <th className="p-2 border-r border-slate-300">Reviewer Name</th>
                  <th className="p-2 border-r border-slate-300">Department</th>
                  <th className="p-2 border-r border-slate-300">Role</th>
                  <th className="p-2 border-r border-slate-300 text-center w-24">Affinity</th>
                  <th className="p-2 border-r border-slate-300 text-center w-24">Attendance</th>
                  <th className="p-2 text-center w-36">Reviewer Signature</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-300">
                {members.map((person, idx) => {
                  const aff = reviewee ? getAffinityType(reviewee.department, person.department, clusters) : 'cross_dept';

                  return (
                    <tr key={person.id} className="h-10">
                      <td className="p-2 border-r border-slate-300 font-mono text-slate-500">
                        {idx + 1}
                      </td>
                      <td className="p-2 border-r border-slate-300 font-semibold text-slate-900">
                        {person.name}
                      </td>
                      <td className="p-2 border-r border-slate-300 text-slate-700">
                        {person.department}
                      </td>
                      <td className="p-2 border-r border-slate-300 text-slate-600">
                        {person.role}
                      </td>
                      <td className="p-2 border-r border-slate-300 text-center text-[10px] font-mono">
                        {aff === 'same_dept' ? 'Same Dept' : aff === 'close_cluster' ? 'Close Dept' : 'Cross Dept'}
                      </td>
                      <td className="p-2 border-r border-slate-300 text-center">
                        <div className="border border-slate-400 w-4 h-4 mx-auto rounded-xs"></div>
                      </td>
                      <td className="p-2 text-center">
                        <div className="border-b border-dotted border-slate-400 w-28 mx-auto h-4"></div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Group Notes */}
          <div className="border border-slate-200 rounded-lg p-4 text-xs text-slate-600 space-y-1.5 bg-slate-50">
            <h3 className="font-bold text-slate-800">Review Panel Guidelines:</h3>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              This panel has been formed with peers clustered from the same and adjacent departments to provide constructive, balanced feedback for the Employee Being Reviewed. All panel members should complete their appraisal rubric or discussion notes before session sign-off.
            </p>
          </div>

          {/* Signoff Footer */}
          <div className="pt-6 border-t border-slate-200 flex justify-between items-end text-xs text-slate-600">
            <div>
              <div className="border-b border-slate-400 w-52 mb-1"></div>
              <span>Session Moderator / HR Lead</span>
            </div>
            <div>
              <div className="border-b border-slate-400 w-36 mb-1"></div>
              <span>Date Completed</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
