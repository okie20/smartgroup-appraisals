import React, { useState, useMemo } from 'react';
import {
  CheckCircle2,
  Clock,
  FileText,
  ShieldCheck,
  Search,
  ArrowRight,
  LogOut,
  Lock,
  KeyRound,
  Smartphone,
} from 'lucide-react';
import { Person, AllocatedGroup, AppraisalSubmission, DepartmentCluster } from '../types';
import { AppraisalFormModal } from './AppraisalFormModal';
import { ANNEX_A_RULES } from '../data/annexASpecifications';
import { getAppraisalSubmission } from '../utils/appraisalStorage';
import workspaceHeroImg from '../assets/images/workspace_hero_banner_1793256996760.jpg';

interface AppraisalPortalViewProps {
  people: Person[];
  groups: AllocatedGroup[];
  clusters: DepartmentCluster[];
  submissions: Record<string, AppraisalSubmission>;
  onSaveDraft: (submission: AppraisalSubmission) => void;
  onSubmitFinal: (submission: AppraisalSubmission) => void;
  currentUserId: string | null;
  onSelectUser: (userId: string | null) => void;
  /** True when the user arrived via their personal ?staff= link — locks them to their own dashboard */
  lockedByDirectLink?: boolean;
}

export const AppraisalPortalView: React.FC<AppraisalPortalViewProps> = ({
  people,
  groups,
  clusters,
  submissions,
  onSaveDraft,
  onSubmitFinal,
  currentUserId,
  onSelectUser,
  lockedByDirectLink = false,
}) => {
  const [loginSearch, setLoginSearch] = useState('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Active appraisal modal state
  const [activeReviewee, setActiveReviewee] = useState<Person | null>(null);
  const [activeGroupId, setActiveGroupId] = useState<string>('');
  const [activeAnnexRuleTitle, setActiveAnnexRuleTitle] = useState<string | undefined>(undefined);

  const peopleMap = useMemo(
    () => new Map<string, Person>(people.map((p) => [p.id, p])),
    [people]
  );

  const departments = useMemo(
    () => Array.from(new Set(people.map((p) => p.department))).sort(),
    [people]
  );

  const currentUser = useMemo(
    () => (currentUserId ? peopleMap.get(currentUserId) || null : null),
    [currentUserId, peopleMap]
  );

  // Groups where the current user is a reviewer (panel member)
  const assignedGroupsToReview = useMemo(() => {
    if (!currentUser) return [];
    return groups.filter((g) => g.memberIds.includes(currentUser.id));
  }, [currentUser, groups]);

  // Submission progress for the current user as a reviewer
  const reviewerStats = useMemo(() => {
    if (!currentUser) return { total: 0, completed: 0, drafts: 0, pending: 0 };
    let completed = 0;
    let drafts = 0;
    let pending = 0;
    for (const group of assignedGroupsToReview) {
      const sub = getAppraisalSubmission(submissions, currentUser.id, group.revieweeId);
      if (sub?.status === 'submitted') completed++;
      else if (sub?.status === 'draft') drafts++;
      else pending++;
    }
    return { total: assignedGroupsToReview.length, completed, drafts, pending };
  }, [currentUser, assignedGroupsToReview, submissions]);

  // Login search filter
  const filteredLoginPeople = useMemo(() => {
    return people.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(loginSearch.toLowerCase()) ||
        p.role.toLowerCase().includes(loginSearch.toLowerCase()) ||
        p.department.toLowerCase().includes(loginSearch.toLowerCase()) ||
        p.id.toLowerCase().includes(loginSearch.toLowerCase());
      const matchDept = selectedDeptFilter === 'ALL' || p.department === selectedDeptFilter;
      return matchSearch && matchDept;
    });
  }, [people, loginSearch, selectedDeptFilter]);

  const getDirectLink = (personId: string) => {
    if (typeof window === 'undefined') return `?staff=${personId}`;
    return `${window.location.origin}${window.location.pathname}?staff=${personId}`;
  };

  const handleCopyLink = (personId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const url = getDirectLink(personId);
    if (navigator?.clipboard?.writeText) navigator.clipboard.writeText(url);
    setCopiedId(personId);
    setTimeout(() => setCopiedId((curr) => (curr === personId ? null : curr)), 2500);
  };

  const handleOpenAppraisalModal = (
    reviewee: Person,
    groupId: string,
    annexTitle?: string
  ) => {
    setActiveReviewee(reviewee);
    setActiveGroupId(groupId);
    setActiveAnnexRuleTitle(annexTitle);
  };

  const handleCloseModal = () => setActiveReviewee(null);

  const getRevieweeAnnexRule = (reviewee: Person) => {
    const text = `${reviewee.role} ${reviewee.department}`.toLowerCase();
    return ANNEX_A_RULES.find((r) => {
      if (text.includes(r.functionTitle.toLowerCase())) return true;
      return r.aliases.some((alias) => text.includes(alias.toLowerCase()));
    });
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && filteredLoginPeople.length > 0) {
      onSelectUser(filteredLoginPeople[0].id);
    }
  };

  // ── Sign-in screen (no user selected) ──────────────────────────────────────
  if (!currentUser) {
    // If they arrived via a direct link but no match was found, show a simple message
    if (lockedByDirectLink) {
      return (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="bg-white border border-slate-200 rounded-xl p-8 max-w-sm text-center shadow-sm">
            <div className="text-3xl mb-3">🔒</div>
            <h2 className="text-base font-black text-slate-900 mb-2">Link not recognised</h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              Your direct link could not be matched to a staff member. Please contact HR for a new link.
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Banner */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1.5">
              <span className="font-semibold text-indigo-700">Employee Appraisal Portal</span>
              <span aria-hidden="true">·</span>
              <span>{people.length} Team Members</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Sign In to Your Appraisal Workspace
            </h1>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Select your name below to open your personal workspace. Your browser will{' '}
              <strong>automatically remember you</strong> so returning visits open straight
              to your workspace without selecting again.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-100 text-xs">
            <div className="bg-slate-50 rounded-lg p-3 border border-slate-100 flex items-start gap-2.5">
              <Smartphone className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-800 font-semibold block">Automatic Device Remember:</strong>
                <span className="text-slate-500">
                  Select your profile once. Your session persists for the entire appraisal cycle.
                </span>
              </div>
            </div>
            <div className="bg-slate-50 rounded-lg p-3 border border-slate-100 flex items-start gap-2.5">
              <KeyRound className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-800 font-semibold block">Personal Direct Link:</strong>
                <span className="text-slate-500">
                  HR can share your unique link (e.g.{' '}
                  <code className="text-indigo-700 font-mono">?staff=EMP-014</code>) via
                  WhatsApp or SMS for instant access.
                </span>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-4 border-t border-slate-100">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={loginSearch}
                onChange={(e) => setLoginSearch(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                placeholder="Type your name, staff ID or department…"
                className="w-full pl-9 pr-3 py-2 text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all"
              />
            </div>
            <select
              value={selectedDeptFilter}
              onChange={(e) => setSelectedDeptFilter(e.target.value)}
              className="px-3 py-2 text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
            >
              <option value="ALL">All Departments ({departments.length})</option>
              {departments.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Staff directory grid */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              {filteredLoginPeople.length} staff member{filteredLoginPeople.length !== 1 ? 's' : ''} found
            </span>
            <span className="text-[11px] text-slate-400">
              Click your name to open your workspace
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {filteredLoginPeople.map((person) => {
              const rule = getRevieweeAnnexRule(person);
              const assignedGroups = groups.filter((g) => g.memberIds.includes(person.id));
              const subsDone = assignedGroups.filter((g) => {
                const s = getAppraisalSubmission(submissions, person.id, g.revieweeId);
                return s?.status === 'submitted';
              }).length;
              const isCopied = copiedId === person.id;

              return (
                <div
                  key={person.id}
                  onClick={() => onSelectUser(person.id)}
                  className="bg-white border border-slate-200 hover:border-slate-900 hover:shadow-md rounded-xl p-4 transition-all group flex flex-col justify-between cursor-pointer"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                        {person.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-mono text-slate-500 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">
                          {person.id}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => handleCopyLink(person.id, e)}
                          title="Copy personal direct link"
                          className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                        >
                          {isCopied
                            ? <Check className="w-3.5 h-3.5 text-emerald-600" />
                            : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900">{person.name}</h3>
                    <p className="text-xs text-slate-600 line-clamp-1">{person.role}</p>
                    <span className="inline-block text-[11px] font-medium text-slate-500 mt-0.5">
                      {person.department}
                    </span>

                    {rule && (
                      <div className="mt-2 text-[10px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded flex items-center gap-1 w-fit">
                        <ShieldCheck className="w-3 h-3 text-indigo-600" />
                        Rule #{rule.orderNumber}: {rule.functionTitle}
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-slate-500">
                      {subsDone} of {assignedGroups.length} reviews submitted
                    </span>
                    <span className="text-xs font-semibold text-slate-900 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                      Sign In <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ── Logged-in workspace ─────────────────────────────────────────────────────
  const myAnnexRule = getRevieweeAnnexRule(currentUser);

  return (
    <div className="space-y-6 animate-in fade-in">

      {/* Hero header */}
      <div className="relative rounded-3xl overflow-hidden bg-[#0A192F] text-white shadow-xl border border-[#132E52]">
        <img
          src={workspaceHeroImg}
          alt="Workspace"
          className="absolute inset-0 w-full h-full object-cover opacity-25 mix-blend-luminosity scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#071224] via-[#0A192F]/85 to-[#102A45]/70" />

        <div className="relative z-10 p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#FFC700] via-[#FFD700] to-[#FFE566] text-[#0A192F] font-black text-xl flex items-center justify-center shrink-0 shadow-lg shadow-[#FFC700]/30 border border-white/20">
              {currentUser.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {currentUser.name}
                </h1>
                <span className="text-xs font-mono text-[#FFD700] bg-[#071224] px-2.5 py-0.5 rounded border border-[#FFC700]/40 font-bold">
                  {currentUser.id}
                </span>
                {myAnnexRule && (
                  <span className="text-xs font-semibold text-[#FFD700] flex items-center gap-1 bg-[#FFC700]/15 border border-[#FFC700]/40 px-2.5 py-0.5 rounded-md">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#FFC700]" />
                    Annex A Role #{myAnnexRule.orderNumber}
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-300 mt-1">
                <strong className="text-white font-semibold">{currentUser.role}</strong>
                <span className="mx-2 text-slate-500">·</span>
                Department:{' '}
                <span className="font-semibold text-[#FFD700]">{currentUser.department}</span>
              </p>
            </div>
          </div>

          {/* Only show sign-out when NOT locked by a direct link */}
          {!lockedByDirectLink && (
            <button
              onClick={() => onSelectUser(null)}
              className="px-4 py-2 text-xs font-bold text-slate-200 hover:text-white bg-white/10 hover:bg-white/15 border border-white/20 rounded-xl transition-all flex items-center gap-2 cursor-pointer backdrop-blur-sm self-start md:self-auto shrink-0"
            >
              <LogOut className="w-4 h-4 text-slate-300" />
              Sign Out
            </button>
          )}
        </div>
      </div>

      {/* Progress summary */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Your Appraisal Progress
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900">{reviewerStats.completed}</span>
              <span className="text-sm text-slate-400 font-medium">
                of {reviewerStats.total} evaluations submitted
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap text-[11px]">
            {reviewerStats.completed === reviewerStats.total && reviewerStats.total > 0 && (
              <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> All submitted — well done!
              </span>
            )}
            {reviewerStats.drafts > 0 && (
              <span className="text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full font-semibold">
                {reviewerStats.drafts} draft{reviewerStats.drafts > 1 ? 's' : ''} in progress
              </span>
            )}
            {reviewerStats.pending > 0 && (
              <span className="text-slate-600 bg-slate-100 border border-slate-200 px-3 py-1 rounded-full">
                {reviewerStats.pending} still pending
              </span>
            )}
          </div>
        </div>

        {/* Progress bar */}
        {reviewerStats.total > 0 && (
          <div className="mt-3 h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-500 rounded-full transition-all"
              style={{ width: `${(reviewerStats.completed / reviewerStats.total) * 100}%` }}
            />
          </div>
        )}
      </div>

      {/* Assigned colleagues list */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-4 h-4 text-slate-500" />
          <h2 className="text-sm font-black text-slate-900">
            Colleagues Assigned to You for Evaluation
          </h2>
          <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
            {assignedGroupsToReview.length}
          </span>
        </div>

        {assignedGroupsToReview.length === 0 ? (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-8 text-center text-sm text-slate-500">
            No colleagues have been assigned to you yet. Please check back after HR finalises the allocation.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {assignedGroupsToReview.map((group) => {
              const reviewee = peopleMap.get(group.revieweeId);
              if (!reviewee) return null;

              const submission = getAppraisalSubmission(submissions, currentUser.id, reviewee.id);
              const rule = getRevieweeAnnexRule(reviewee);
              const isSubmitted = submission?.status === 'submitted';
              const isDraft = submission?.status === 'draft';

              return (
                <div
                  key={group.id}
                  className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0">
                          {reviewee.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-slate-900">{reviewee.name}</h3>
                          <p className="text-xs text-slate-500">{reviewee.role}</p>
                          <span className="text-[11px] text-slate-400">{reviewee.department}</span>
                        </div>
                      </div>

                      {isSubmitted ? (
                        <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Submitted
                        </span>
                      ) : isDraft ? (
                        <span className="text-[11px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0">
                          <Clock className="w-3 h-3 text-amber-600" /> Draft Saved
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full shrink-0">
                          Pending
                        </span>
                      )}
                    </div>

                    {rule && (
                      <div className="mt-1 text-[11px] font-medium text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                        Annex A #{rule.orderNumber}: {rule.functionTitle}
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">Panel #{group.number}</span>
                    <button
                      onClick={() =>
                        handleOpenAppraisalModal(
                          reviewee,
                          group.id,
                          rule ? `Rule #${rule.orderNumber}: ${rule.functionTitle}` : undefined
                        )
                      }
                      className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-xs ${
                        isSubmitted
                          ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          : isDraft
                          ? 'bg-amber-500 hover:bg-amber-600 text-white'
                          : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                      }`}
                    >
                      {isSubmitted ? (
                        <><Lock className="w-3 h-3" /> View Submitted</>
                      ) : isDraft ? (
                        <><Clock className="w-3 h-3" /> Resume Draft</>
                      ) : (
                        <><FileText className="w-3 h-3" /> Start Appraisal</>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Appraisal form modal */}
      {activeReviewee && (
        <AppraisalFormModal
          isOpen={true}
          onClose={handleCloseModal}
          reviewer={currentUser}
          reviewee={activeReviewee}
          groupId={activeGroupId}
          isSelfAppraisal={false}
          annexRuleTitle={activeAnnexRuleTitle}
          initialSubmission={getAppraisalSubmission(
            submissions,
            currentUser.id,
            activeReviewee.id
          )}
          onSaveDraft={onSaveDraft}
          onSubmitFinal={onSubmitFinal}
        />
      )}
    </div>
  );
};
