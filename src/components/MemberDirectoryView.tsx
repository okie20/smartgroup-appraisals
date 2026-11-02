import React, { useState } from 'react';
import { Person, AllocatedGroup, DepartmentCluster } from '../types';
import { getAffinityType } from '../utils/groupingEngine';
import { findMatchingAnnexARule } from '../data/annexASpecifications';
import {
  Users,
  X,
  ArrowRightLeft,
  Building,
  UserCheck,
  CheckCircle,
  ExternalLink,
  ChevronRight,
  Shield,
  Layers,
  ShieldCheck,
  Copy,
  Check,
  KeyRound,
} from 'lucide-react';

interface MemberDirectoryViewProps {
  people: Person[];
  peopleMap: Map<string, Person>;
  groups: AllocatedGroup[];
  memberToGroupMap: Record<string, string>;
  clusters: DepartmentCluster[];
  selectedPersonId: string | null;
  onSelectPerson: (id: string | null) => void;
  onMoveMember: (personId: string, targetGroupId: string) => void;
  searchQuery: string;
  selectedDept: string;
}

export const MemberDirectoryView: React.FC<MemberDirectoryViewProps> = ({
  people,
  peopleMap,
  groups,
  memberToGroupMap,
  clusters,
  selectedPersonId,
  onSelectPerson,
  onMoveMember,
  searchQuery,
  selectedDept,
}) => {
  const [sortBy, setSortBy] = useState<'name' | 'department' | 'group'>('name');
  const [copiedLinkId, setCopiedLinkId] = useState<string | null>(null);

  const getDirectLinkForPerson = (personId: string) => {
    if (typeof window === 'undefined') return `?staff=${personId}`;
    return `${window.location.origin}${window.location.pathname}?staff=${personId}`;
  };

  const handleCopyLink = (personId: string) => {
    const url = getDirectLinkForPerson(personId);
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(url);
    }
    setCopiedLinkId(personId);
    setTimeout(() => setCopiedLinkId((curr) => (curr === personId ? null : curr)), 2500);
  };

  const groupById = new Map<string, AllocatedGroup>(groups.map((g) => [g.id, g]));

  // Pre-calculate which review groups each person serves on as a reviewer
  const reviewerAssignmentsMap = new Map<string, AllocatedGroup[]>();
  people.forEach((p) => {
    reviewerAssignmentsMap.set(p.id, []);
  });
  groups.forEach((g) => {
    g.memberIds.forEach((mId) => {
      const list = reviewerAssignmentsMap.get(mId);
      if (list) list.push(g);
    });
  });

  // Filter people
  const filtered = people.filter((p) => {
    if (selectedDept !== 'ALL' && p.department !== selectedDept) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      if (!p.name.toLowerCase().includes(q) && !p.role.toLowerCase().includes(q) && !p.id.toLowerCase().includes(q)) {
        return false;
      }
    }
    return true;
  });

  // Sort
  filtered.sort((a, b) => {
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    if (sortBy === 'department') return a.department.localeCompare(b.department);
    if (sortBy === 'group') {
      const gA = groupById.get(memberToGroupMap[a.id])?.number || 0;
      const gB = groupById.get(memberToGroupMap[b.id])?.number || 0;
      return gA - gB;
    }
    return 0;
  });

  const activePerson = selectedPersonId ? peopleMap.get(selectedPersonId) : null;
  // Group where activePerson is the Employee Being Reviewed
  const activeReviewGroup = activePerson ? groupById.get(memberToGroupMap[activePerson.id]) : null;

  // Reviewers allocated to evaluate activePerson
  const reviewersForActivePerson = (activeReviewGroup && activePerson)
    ? activeReviewGroup.memberIds
        .map((id) => peopleMap.get(id))
        .filter(Boolean) as Person[]
    : [];

  // Groups where activePerson is serving as a reviewer
  const reviewingPanelsForActivePerson = activePerson
    ? reviewerAssignmentsMap.get(activePerson.id) || []
    : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Company Member Directory & Review Allocation Status
          </h2>
          <p className="text-xs text-slate-500">
            Every employee has a dedicated review panel assigned to them, and simultaneously serves on peer review panels.
          </p>
        </div>

        {/* Sort selector */}
        <div className="flex items-center gap-2 text-xs text-slate-600">
          <span className="font-medium">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-2.5 py-1 text-xs bg-white border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-slate-900"
          >
            <option value="name">Name (A-Z)</option>
            <option value="department">Department</option>
            <option value="group">Review Group #</option>
          </select>
        </div>
      </div>

      {/* Main split view */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Table of Members */}
        <div
          className={`${
            activePerson ? 'lg:col-span-6 xl:col-span-6' : 'lg:col-span-12'
          } bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden flex flex-col`}
        >
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between text-xs text-slate-500 bg-slate-50/60">
            <span className="font-semibold text-slate-800">
              All Members ({filtered.length})
            </span>
            <span className="font-mono text-emerald-700 font-medium">
              100% have an allocated review panel
            </span>
          </div>

          <div className="divide-y divide-slate-100 max-h-[750px] overflow-y-auto">
            {filtered.map((person) => {
              const groupId = memberToGroupMap[person.id];
              const group = groupId ? groupById.get(groupId) : null;
              const isSelected = selectedPersonId === person.id;
              const reviewingCount = reviewerAssignmentsMap.get(person.id)?.length || 0;

              return (
                <div
                  key={person.id}
                  onClick={() => onSelectPerson(isSelected ? null : person.id)}
                  className={`px-4 py-3 cursor-pointer transition-colors flex items-center justify-between gap-3 text-xs ${
                    isSelected
                      ? 'bg-indigo-50/80 border-l-4 border-indigo-600'
                      : 'hover:bg-slate-50/80'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 truncate">
                        {person.name}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">
                        {person.id}
                      </span>
                    </div>
                    <div className="text-slate-500 text-[11px] truncate flex flex-wrap items-center gap-1.5 mt-0.5">
                      <span>{person.role}</span>
                      <span>·</span>
                      <span>{person.department}</span>
                      {findMatchingAnnexARule(person.role, person.department) && (
                        <span className="text-[10px] bg-indigo-50 text-indigo-700 px-1.5 py-0.2 rounded border border-indigo-200 font-semibold flex items-center gap-1 shrink-0">
                          <ShieldCheck className="w-2.5 h-2.5" />
                          Annex A
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Allocation Status Badges */}
                  <div className="flex items-center gap-2 shrink-0">
                    {group && (
                      <span className="font-mono text-[11px] px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded border border-indigo-200/60 font-semibold" title="Allocated review panel for this employee">
                        Panel #{group.number} ({group.memberIds.length} revs)
                      </span>
                    )}

                    <span
                      className="font-mono text-[11px] px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200/60 rounded font-semibold"
                      title="Number of colleague review panels they actively serve on"
                    >
                      Reviews {reviewingCount} peers
                    </span>

                    <ChevronRight className="w-4 h-4 text-slate-300" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Member Detail Card */}
        {activePerson && activeReviewGroup ? (
          <div className="lg:col-span-6 xl:col-span-6 bg-white border border-slate-200 rounded-xl shadow-2xs p-5 sm:p-6 space-y-6 max-h-[850px] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm font-mono">
                    {activePerson.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      {activePerson.name}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {activePerson.role} · <span className="font-medium text-slate-700">{activePerson.department}</span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleCopyLink(activePerson.id)}
                  title="Copy direct auto-login magic link for this employee"
                  className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors flex items-center gap-1 shadow-2xs"
                >
                  {copiedLinkId === activePerson.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">Copied!</span>
                    </>
                  ) : (
                    <>
                      <KeyRound className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Copy Magic Link</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => onSelectPerson(null)}
                  className="text-slate-400 hover:text-slate-600 p-1.5 rounded-md hover:bg-slate-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Annex A Mandate if applicable */}
            {(() => {
              const rule = findMatchingAnnexARule(activePerson.role, activePerson.department);
              if (!rule) return null;
              return (
                <div className="p-3.5 bg-indigo-50/70 border border-indigo-200 rounded-xl space-y-1.5 text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-indigo-950">
                    <ShieldCheck className="w-4 h-4 text-indigo-700 shrink-0" />
                    <span>Annex A Statutory Role: Rule #{rule.orderNumber} ({rule.functionTitle})</span>
                  </div>
                  <p className="text-[11px] text-indigo-900/90 italic">
                    Mandated Appraisers: "{rule.originalAppraisersText}"
                  </p>
                </div>
              );
            })()}

            {/* SECTION 1: THE ALLOCATED REVIEW GROUP FOR THIS PERSON */}
            <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-indigo-900">
                  <UserCheck className="w-4 h-4 text-indigo-600" />
                  <span>Their Allocated Review Panel ({activeReviewGroup.name})</span>
                </div>
                <span className="font-mono text-[11px] px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded font-semibold">
                  {reviewersForActivePerson.length} Reviewers
                </span>
              </div>

              <p className="text-[11px] text-slate-600">
                In this group, <strong className="text-slate-900">{activePerson.name}</strong> is classified as the{' '}
                <strong className="text-indigo-900 font-semibold">Employee Being Reviewed</strong>. They are the subject of
                review and are <em>not</em> part of the reviewing panel.
              </p>

              {/* Reviewers List */}
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden bg-white">
                {reviewersForActivePerson.map((reviewer) => {
                  const aff = getAffinityType(activePerson.department, reviewer.department, clusters);
                  return (
                    <div
                      key={reviewer.id}
                      className="p-2.5 flex items-center justify-between text-xs hover:bg-slate-50/70"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-slate-900 truncate">
                          {reviewer.name}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate">
                          {reviewer.department} · {reviewer.role}
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded shrink-0 ${
                          aff === 'same_dept'
                            ? 'text-emerald-700 bg-emerald-50 border border-emerald-200/60'
                            : aff === 'close_cluster'
                            ? 'text-indigo-700 bg-indigo-50 border border-indigo-200/60'
                            : 'text-slate-500 bg-slate-100'
                        }`}
                      >
                        {aff === 'same_dept' ? 'Same Dept' : aff === 'close_cluster' ? 'Close Dept' : 'Cross Dept'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* SECTION 2: OTHER COLLEAGUES THIS PERSON IS REVIEWING */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-slate-700" />
                    <span>Panels They Serve On as a Reviewer ({reviewingPanelsForActivePerson.length})</span>
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Colleagues that {activePerson.name} has been assigned to evaluate
                  </p>
                </div>
              </div>

              {reviewingPanelsForActivePerson.length === 0 ? (
                <div className="p-4 border border-slate-200 rounded-lg text-center text-xs text-slate-400">
                  No reviewing assignments.
                </div>
              ) : (
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden bg-white">
                  {reviewingPanelsForActivePerson.map((group) => {
                    const subject = peopleMap.get(group.revieweeId);
                    if (!subject) return null;
                    const aff = getAffinityType(activePerson.department, subject.department, clusters);

                    return (
                      <div
                        key={group.id}
                        className="p-2.5 flex items-center justify-between text-xs hover:bg-slate-50/70"
                      >
                        <div className="min-w-0 flex-1">
                          <button
                            onClick={() => onSelectPerson(subject.id)}
                            className="font-bold text-slate-900 hover:text-indigo-600 text-left transition-colors truncate"
                          >
                            {subject.name}
                          </button>
                          <div className="text-[11px] text-slate-500 truncate">
                            {subject.department} · {subject.role} ({group.name})
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span
                            className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                              aff === 'same_dept'
                                ? 'text-emerald-700 bg-emerald-50 border border-emerald-200/60'
                                : aff === 'close_cluster'
                                ? 'text-indigo-700 bg-indigo-50 border border-indigo-200/60'
                                : 'text-slate-500 bg-slate-100'
                            }`}
                          >
                            {aff === 'same_dept' ? 'Same Dept' : aff === 'close_cluster' ? 'Close Dept' : 'Cross Dept'}
                          </span>

                          <button
                            onClick={() => onSelectPerson(subject.id)}
                            className="p-1 text-slate-400 hover:text-slate-700 rounded"
                            title="Inspect this colleague's profile"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="hidden lg:flex lg:col-span-6 xl:col-span-6 border-2 border-dashed border-slate-200 rounded-xl p-8 items-center justify-center text-center text-xs text-slate-400">
            <div>
              <UserCheck className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="font-semibold text-slate-600">Select any member from the list</p>
              <p className="text-slate-400 mt-1">
                View their designated review panel and the other colleague groups they review.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
