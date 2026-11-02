import React, { useState, useMemo } from 'react';
import { Person, AllocatedGroup, DepartmentCluster, ALL_FACILITIES, isPersonSupervisor, getPersonFacility } from '../types';
import { findMatchingAnnexARule } from '../data/annexASpecifications';
import {
  Users,
  Building,
  MapPin,
  Shield,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Star,
  RotateCcw,
  Sparkles,
  Edit2,
  Trash2,
  Plus,
  AlertTriangle,
} from 'lucide-react';
import { EditPanelModal } from './EditPanelModal';
import { ConfirmModal } from './ConfirmModal';

interface GroupsViewProps {
  groups: AllocatedGroup[];
  peopleMap: Map<string, Person>;
  clusters: DepartmentCluster[];
  allPeople?: Person[];
  onSwapMembers: (personId1: string, personId2: string) => void;
  onMoveMember: (personId: string, targetGroupId: string) => void;
  onSelectPerson: (personId: string) => void;
  onPrintGroup: (group: AllocatedGroup) => void;
  searchQuery: string;
  selectedDept: string;
  selectedFacility?: string;
  onOpenAnnexA?: () => void;
  onResetAllocations?: () => void;
  onUpdateGroup?: (updatedGroup: AllocatedGroup) => void;
  onDeleteGroup?: (groupId: string) => void;
  onCreateGroup?: (newGroup: AllocatedGroup) => void;
}

export const GroupsView: React.FC<GroupsViewProps> = ({
  groups,
  peopleMap,
  clusters = [],
  allPeople = [],
  onSelectPerson,
  searchQuery,
  selectedDept,
  selectedFacility = 'ALL',
  onOpenAnnexA,
  onResetAllocations,
  onUpdateGroup,
  onDeleteGroup,
  onCreateGroup,
}) => {
  // Simple pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  // Panel Editing and Deleting state
  const [editingGroup, setEditingGroup] = useState<AllocatedGroup | null>(null);
  const [groupToDelete, setGroupToDelete] = useState<AllocatedGroup | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createRevieweeId, setCreateRevieweeId] = useState('');

  // Filter groups
  const filteredGroups = useMemo(() => {
    return groups.filter((group) => {
      const reviewee = peopleMap.get(group.revieweeId);
      const members = group.memberIds.map((id) => peopleMap.get(id)).filter(Boolean) as Person[];

      if (selectedFacility !== 'ALL') {
        if (!reviewee || getPersonFacility(reviewee) !== selectedFacility) {
          return false;
        }
      }

      if (selectedDept !== 'ALL') {
        const matchesRevieweeDept = reviewee?.department === selectedDept;
        const matchesMemberDept = members.some((m) => m.department === selectedDept);
        if (!matchesRevieweeDept && !matchesMemberDept) return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesReviewee =
          reviewee &&
          (reviewee.name.toLowerCase().includes(q) ||
            reviewee.role.toLowerCase().includes(q) ||
            reviewee.department.toLowerCase().includes(q) ||
            getPersonFacility(reviewee).toLowerCase().includes(q));

        const matchesGroup = group.name.toLowerCase().includes(q);

        const matchesMembers = members.some(
          (m) =>
            m.name.toLowerCase().includes(q) ||
            m.role.toLowerCase().includes(q) ||
            getPersonFacility(m).toLowerCase().includes(q)
        );

        if (!matchesReviewee && !matchesGroup && !matchesMembers) return false;
      }

      return true;
    });
  }, [groups, peopleMap, selectedDept, searchQuery, selectedFacility]);

  // Reset page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedDept, selectedFacility]);

  const totalPages = Math.max(1, Math.ceil(filteredGroups.length / pageSize));
  const displayedGroups = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredGroups.slice(start, start + pageSize);
  }, [filteredGroups, currentPage, pageSize]);

  return (
    <div className="space-y-6">
      {/* Executive Mandated Supervisor Rules Status & Quick Reset Banner */}
      <div className="bg-[#0A192F] text-white rounded-2xl p-5 border border-[#1E3A5F] shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-[#FFC700]/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-[11px] font-black uppercase tracking-wider text-[#FFD700] bg-[#FFD700]/15 border border-[#FFD700]/40 px-2.5 py-0.5 rounded-md flex items-center gap-1.5 shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-[#FFD700]" />
                Mandated Supervisor Allocations: Active & Applied
              </span>
              <span className="text-[11px] text-slate-300 font-medium">
                Locked into Reviewer Slot 1 for All Kampala & Regional Facilities
              </span>
            </div>

            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Executive Department-Supervisor Rules & Panel Controls
            </h2>

            {/* Quick Badges of the Mandated Rules */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 pt-1 text-xs">
              <div className="bg-[#10243E] border border-[#1E3A5F] rounded-xl p-2.5">
                <div className="text-[10px] font-bold text-[#FFD700] uppercase">
                  Enrollment, Reception, Approval, DL, VIP
                </div>
                <div className="font-bold text-white mt-0.5 flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 text-[#FFD700] fill-[#FFD700]" />
                  <span>Catherine Komujuni</span>
                </div>
                <div className="text-[10px] text-slate-400">Supervisor reviewing 43+ staff</div>
              </div>

              <div className="bg-[#10243E] border border-[#1E3A5F] rounded-xl p-2.5">
                <div className="text-[10px] font-bold text-[#FFD700] uppercase">
                  Order Batching & Personalisation, Shipment
                </div>
                <div className="font-bold text-white mt-0.5 flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 text-[#FFD700] fill-[#FFD700]" />
                  <span>Dickson Muhangi</span>
                </div>
                <div className="text-[10px] text-slate-400">Supervisor reviewing 4 staff</div>
              </div>

              <div className="bg-[#10243E] border border-[#1E3A5F] rounded-xl p-2.5">
                <div className="text-[10px] font-bold text-[#FFD700] uppercase">
                  Quality Assurance
                </div>
                <div className="font-bold text-white mt-0.5 flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 text-[#FFD700] fill-[#FFD700]" />
                  <span>Basuna Julius</span>
                </div>
                <div className="text-[10px] text-slate-400">Supervisor reviewing QA team</div>
              </div>

              <div className="bg-[#10243E] border border-[#1E3A5F] rounded-xl p-2.5">
                <div className="text-[10px] font-bold text-[#FFD700] uppercase">
                  Customer Care & Call Center
                </div>
                <div className="font-bold text-white mt-0.5 flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 text-[#FFD700] fill-[#FFD700]" />
                  <span>Doris Nalwanga</span>
                </div>
                <div className="text-[10px] text-slate-400">Supervisor reviewing 8 staff</div>
              </div>

              <div className="bg-[#10243E] border border-[#1E3A5F] rounded-xl p-2.5">
                <div className="text-[10px] font-bold text-[#FFD700] uppercase">
                  Technical Staff
                </div>
                <div className="font-bold text-white mt-0.5 flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 text-[#FFD700] fill-[#FFD700]" />
                  <span>Clare Tukahiirwa</span>
                </div>
                <div className="text-[10px] text-emerald-400">Apart from Ryan Karl (excluded)</div>
              </div>

              <div className="bg-[#10243E] border border-[#1E3A5F] rounded-xl p-2.5">
                <div className="text-[10px] font-bold text-[#FFD700] uppercase">
                  Regional Branches (100% In-Branch)
                </div>
                <div className="font-bold text-white mt-0.5 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#FFD700]" />
                  <span>Facility Supervisors</span>
                </div>
                <div className="text-[10px] text-slate-400">Jinja, Mbale, Gulu, Arua, Fort Portal, Mbarara</div>
              </div>
            </div>
          </div>

          {/* Reset Action Button */}
          {onResetAllocations && (
            <div className="shrink-0 flex flex-col items-start lg:items-end justify-center gap-2 pt-2 lg:pt-0">
              <button
                type="button"
                onClick={onResetAllocations}
                className="w-full sm:w-auto px-5 py-3 bg-gradient-to-r from-[#FFC700] via-[#FFD700] to-[#FFE566] hover:brightness-105 active:scale-98 text-[#0A192F] font-black text-xs rounded-xl shadow-lg shadow-[#FFC700]/30 transition-all flex items-center justify-center gap-2.5 cursor-pointer uppercase tracking-wider"
                title="Immediately reset & re-generate all 117 panels with new random seed"
              >
                <RotateCcw className="w-4 h-4 text-[#0A192F]" />
                <span>Reset & Re-generate Panels</span>
              </button>
              <span className="text-[11px] text-slate-400">
                Instant reset with mandated supervisors locked in
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Page Header and Pagination Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-[#E2E8F0] text-[#0A192F] shadow-xs">
        <div>
          <h2 className="text-sm font-bold text-[#0A192F] flex items-center gap-2">
            <span>Allocated Review Panels</span>
            <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-[#0A192F] text-[#FFD700] font-bold border border-[#FFC700]/30 shadow-xs">
              {filteredGroups.length}
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Each employee has a dedicated panel of 7 peer appraisers configured according to branch location, statutory rules, and supervisor mandates.
          </p>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto">
          {onCreateGroup && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-3 py-1.5 text-xs font-bold text-[#0A192F] bg-[#FFC700] hover:bg-[#F5B800] rounded-xl transition-all flex items-center gap-1.5 shadow-xs cursor-pointer shrink-0"
              title="Create a new custom review panel"
            >
              <Plus className="w-3.5 h-3.5 text-[#0A192F]" />
              <span>+ Create Panel</span>
            </button>
          )}

          {totalPages > 1 && (
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500 font-medium">
                Page <strong className="text-[#0A192F]">{currentPage}</strong> of {totalPages}
              </span>
              <div className="flex items-center gap-1">
                <button
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="p-1.5 rounded-lg border border-[#E2E8F0] bg-[#F4F6F9] hover:bg-[#EAEFF5] disabled:opacity-30 cursor-pointer text-[#0A192F]"
                  title="Previous page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="p-1.5 rounded-lg border border-[#E2E8F0] bg-[#F4F6F9] hover:bg-[#EAEFF5] disabled:opacity-30 cursor-pointer text-[#0A192F]"
                  title="Next page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Empty State */}
      {displayedGroups.length === 0 && (
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-12 text-center text-xs text-slate-500 space-y-3 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-[#0A192F] text-[#FFD700] flex items-center justify-center mx-auto shadow-sm border border-[#FFC700]/30">
            <Users className="w-6 h-6" />
          </div>
          <p className="font-bold text-[#0A192F] text-base">No Review Panels Yet</p>
          <p className="text-slate-500 max-w-md mx-auto leading-relaxed">
            All previous data has been cleared. Add employees and formulate departments in Staff & Facilities to automatically generate balanced 7-peer review panels.
          </p>
          <div className="pt-2">
            <button
              onClick={() => onSelectPerson('')}
              className="px-4 py-2 bg-[#0A192F] hover:bg-[#132E52] text-[#FFD700] hover:text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer border border-[#FFC700]/50"
            >
              Go to Staff & Facilities →
            </button>
          </div>
        </div>
      )}

      {/* Clean Executive Grid of Review Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {displayedGroups.map((group) => {
          const reviewee = peopleMap.get(group.revieweeId);
          const members = group.memberIds
            .map((id) => peopleMap.get(id))
            .filter(Boolean) as Person[];

          const annexRule = reviewee ? findMatchingAnnexARule(reviewee.role, reviewee.department) : undefined;
          const facility = reviewee ? getPersonFacility(reviewee) : 'Kampala';
          const isSupervisor = reviewee ? isPersonSupervisor(reviewee) : false;

          return (
            <div
              key={group.id}
              className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden hover:border-[#FFC700] hover:shadow-lg transition-all flex flex-col justify-between shadow-xs group/card"
            >
              <div>
                {/* Panel Header */}
                <div className="px-4 py-3 bg-[#0A192F] text-white flex items-center justify-between border-b border-[#132E52]">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#FFD700] bg-[#071224] border border-[#FFC700]/50 px-2 py-0.5 rounded shadow-2xs">
                      #{group.number}
                    </span>
                    <span className="text-xs font-semibold text-slate-100 truncate">
                      {group.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold text-[#FFE566]">
                      {group.memberIds.length} Appraisers
                    </span>
                    <button
                      onClick={() => setEditingGroup(group)}
                      className="p-1 rounded text-slate-300 hover:text-[#FFD700] hover:bg-[#132E52] transition-colors cursor-pointer"
                      title={`Edit Panel #${group.number}`}
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Person Being Reviewed (The Subject) */}
                <div className="p-4 bg-[#F8FAFC] border-b border-[#EAEFF5] space-y-2">
                  <div className="text-[10px] font-bold text-[#D49B00] uppercase tracking-wider">
                    Employee Being Reviewed
                  </div>

                  {reviewee ? (
                    <div>
                      <div className="flex items-baseline justify-between gap-2">
                        <h3 className="font-bold text-sm text-[#0A192F] truncate">
                          {reviewee.name}
                        </h3>
                        <span className="text-[10px] text-slate-500 font-mono font-semibold">
                          {reviewee.id}
                        </span>
                      </div>

                      <div className="text-xs text-slate-600 mt-1">
                        <span className="font-semibold text-[#0A192F]">{reviewee.role}</span>
                        <span className="text-slate-400 mx-1.5">·</span>
                        <span className="text-slate-500">{reviewee.department}</span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <span className="text-[10px] font-semibold text-slate-700 bg-[#EAEFF5] border border-[#E2E8F0] px-2 py-0.5 rounded-md flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-500" />
                          <span>{facility} Branch</span>
                        </span>

                        {isSupervisor ? (
                          <span className="text-[10px] font-semibold text-purple-800 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                            <Shield className="w-3 h-3 text-purple-600" />
                            <span>Supervisor</span>
                          </span>
                        ) : (
                          <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Facility-Scoped</span>
                          </span>
                        )}

                        {annexRule && (
                          <button
                            onClick={onOpenAnnexA}
                            className="text-[10px] font-semibold text-[#946800] bg-[#FFF9DB] border border-[#FFC700]/60 px-2 py-0.5 rounded-md flex items-center gap-1 hover:bg-[#FFF3B8] transition-colors cursor-pointer"
                            title={`Annex A Mandate: ${annexRule.functionTitle}`}
                          >
                            <ShieldCheck className="w-3 h-3 text-[#D49B00]" />
                            <span>Annex A #{annexRule.orderNumber}</span>
                          </button>
                        )}
                      </div>

                      {group.designatedSupervisorName && (
                        <div className="mt-2.5 pt-2 border-t border-[#EAEFF5] flex items-center justify-between text-[11px]">
                          <span className="text-slate-600 font-semibold flex items-center gap-1">
                            <Star className="w-3.5 h-3.5 text-[#D49B00] fill-[#FFC700]" />
                            <span>Line Supervisor:</span>
                          </span>
                          <span className="font-bold text-[#0A192F] bg-[#FFF8D6] border border-[#FFC700]/70 px-2.5 py-0.5 rounded shadow-2xs text-[11px] flex items-center gap-1">
                            <span>{group.designatedSupervisorName}</span>
                          </span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-xs text-slate-400 italic">No employee assigned</div>
                  )}
                </div>

                {/* Appraiser Committee List (7 Peers) */}
                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <span>Assigned Peer Reviewers</span>
                    <span className="font-mono text-[#0A192F]">(7)</span>
                  </div>

                  <div className="divide-y divide-[#EAEFF5]">
                    {members.map((m, idx) => {
                      const isDesignatedSupervisor =
                        group.designatedSupervisorId === m.id ||
                        (idx === 0 &&
                          Boolean(
                            group.designatedSupervisorName &&
                              m.name.toLowerCase().includes(group.designatedSupervisorName.toLowerCase().split(' ')[0])
                          ));

                      return (
                        <div
                          key={m.id}
                          className={`py-1.5 px-2 rounded-lg flex items-center justify-between gap-2 text-xs transition-colors ${
                            isDesignatedSupervisor
                              ? 'bg-[#FFFDF0] border border-[#FFC700]/60 shadow-2xs font-semibold'
                              : ''
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span
                              className={`font-mono text-[11px] w-4 text-center font-bold ${
                                isDesignatedSupervisor ? 'text-[#D49B00]' : 'text-slate-400'
                              }`}
                            >
                              {idx + 1}.
                            </span>
                            <div className="min-w-0 flex items-center gap-1.5">
                              <span
                                className={`truncate ${
                                  isDesignatedSupervisor
                                    ? 'text-[#0A192F] font-bold'
                                    : 'text-[#0A192F] font-semibold'
                                }`}
                              >
                                {m.name}
                              </span>
                              {isDesignatedSupervisor && (
                                <span className="shrink-0 text-[9px] font-black uppercase tracking-wider bg-[#FFC700] text-[#0A192F] px-1.5 py-0.5 rounded shadow-2xs flex items-center gap-0.5">
                                  <Star className="w-2.5 h-2.5 fill-[#0A192F]" />
                                  <span>Supervisor</span>
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0 text-[11px] text-slate-500">
                            <span className="hidden sm:inline truncate max-w-[100px]">
                              {m.department}
                            </span>
                            <span className="text-slate-400">·</span>
                            <span className="font-semibold text-slate-700">
                              {getPersonFacility(m)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="p-3 bg-[#F8FAFC] border-t border-[#EAEFF5] flex items-center justify-between gap-2 text-xs">
                {/* Edit Panel Button */}
                <button
                  type="button"
                  onClick={() => setEditingGroup(group)}
                  className="flex-1 py-2 px-3 bg-[#0A192F] hover:bg-[#132E52] text-[#FFD700] hover:text-white font-bold rounded-xl border border-[#FFC700]/40 transition-colors flex items-center justify-center gap-1.5 cursor-pointer text-xs shadow-2xs group"
                  title={`Edit Panel #${group.number} appraisers and supervisor`}
                >
                  <Edit2 className="w-3.5 h-3.5 text-[#FFD700] group-hover:scale-110 transition-transform" />
                  <span>Edit Panel</span>
                </button>

                {reviewee && (
                  <button
                    type="button"
                    onClick={() => onSelectPerson(reviewee.id)}
                    className="py-2 px-3 bg-white hover:bg-[#F4F6F9] text-[#0A192F] font-semibold rounded-xl border border-[#E2E8F0] transition-colors flex items-center justify-center gap-1 cursor-pointer text-xs shadow-2xs"
                    title="View staff profile in Roster"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                    <span className="hidden sm:inline">Profile</span>
                  </button>
                )}

                {/* Delete Panel Button */}
                <button
                  type="button"
                  onClick={() => setGroupToDelete(group)}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl border border-transparent hover:border-rose-200 transition-colors cursor-pointer"
                  title={`Delete Review Panel #${group.number}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between py-4 text-xs text-slate-500 border-t border-[#E2E8F0]">
          <span>
            Showing {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, filteredGroups.length)} of {filteredGroups.length} panels
          </span>
          <div className="flex items-center gap-2">
            <button
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1.5 rounded-lg border border-[#E2E8F0] bg-white hover:bg-[#F4F6F9] disabled:opacity-30 cursor-pointer text-[#0A192F] font-semibold"
            >
              Previous
            </button>
            <span className="px-2 font-bold text-[#0A192F]">
              {currentPage} / {totalPages}
            </span>
            <button
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="px-3 py-1.5 rounded-lg border border-[#E2E8F0] bg-white hover:bg-[#F4F6F9] disabled:opacity-30 cursor-pointer text-[#0A192F] font-semibold"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* EDIT PANEL MODAL */}
      <EditPanelModal
        isOpen={Boolean(editingGroup)}
        group={editingGroup}
        allPeople={allPeople.length > 0 ? allPeople : Array.from(peopleMap.values())}
        onClose={() => setEditingGroup(null)}
        onSaveGroup={(updated) => {
          if (onUpdateGroup) {
            onUpdateGroup(updated);
          }
          setEditingGroup(null);
        }}
        onDeleteGroup={(id) => {
          if (onDeleteGroup) {
            onDeleteGroup(id);
          }
          setEditingGroup(null);
        }}
      />

      {/* CONFIRM MODAL: DELETE REVIEW PANEL */}
      <ConfirmModal
        isOpen={Boolean(groupToDelete)}
        title={`Delete Review Panel #${groupToDelete?.number}?`}
        message={
          groupToDelete ? (
            <div>
              Are you sure you want to delete review panel{' '}
              <strong className="text-[#0A192F]">#{groupToDelete.number} ({groupToDelete.name})</strong>?
              <div className="mt-1.5 text-slate-500">
                This will remove the panel from the active appraisal schedule. You can regenerate or re-add it at any time.
              </div>
            </div>
          ) : (
            ''
          )
        }
        confirmText="Delete Panel"
        confirmVariant="danger"
        onConfirm={() => {
          if (groupToDelete && onDeleteGroup) {
            onDeleteGroup(groupToDelete.id);
          }
          setGroupToDelete(null);
        }}
        onCancel={() => setGroupToDelete(null)}
      />

      {/* CREATE NEW CUSTOM PANEL MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-[#071224]/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#E2E8F0] space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[#EAEFF5]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#0A192F] text-[#FFD700] flex items-center justify-center font-bold">
                  <Plus className="w-4 h-4 text-[#FFD700]" />
                </div>
                <h3 className="text-base font-bold text-[#0A192F]">Create New Review Panel</h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="w-8 h-8 rounded-full bg-[#F4F6F9] hover:bg-[#EAEFF5] text-slate-500 flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <label className="block font-bold text-[#0A192F] uppercase tracking-wider">
                Select Employee to Form Panel For *
              </label>
              <select
                value={createRevieweeId}
                onChange={(e) => setCreateRevieweeId(e.target.value)}
                className="w-full px-3 py-2 border border-[#E2E8F0] rounded-xl bg-[#F8FAFC] font-semibold text-[#0A192F]"
              >
                <option value="">-- Choose an employee --</option>
                {(allPeople.length > 0 ? allPeople : Array.from(peopleMap.values())).map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.role} · {p.department} · {getPersonFacility(p)})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#EAEFF5]">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-[#F4F6F9] rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!createRevieweeId}
                onClick={() => {
                  const p = peopleMap.get(createRevieweeId);
                  if (p && onCreateGroup) {
                    const newPanel: AllocatedGroup = {
                      id: `group-custom-${Date.now()}`,
                      number: groups.length + 1,
                      name: `${p.name} Review Panel`,
                      revieweeId: p.id,
                      primaryDepartment: p.department,
                      clusterId: clusters[0]?.id || 'cluster-1',
                      memberIds: [],
                    };
                    onCreateGroup(newPanel);
                    setShowCreateModal(false);
                    setCreateRevieweeId('');
                    setEditingGroup(newPanel);
                  }
                }}
                className="px-5 py-2.5 bg-[#FFC700] hover:bg-[#F5B800] text-[#0A192F] font-black text-xs rounded-xl shadow-md shadow-[#FFC700]/30 disabled:opacity-40 cursor-pointer"
              >
                Create & Add Appraisers →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
