import React, { useState, useMemo } from 'react';
import {
  Users,
  CheckCircle2,
  Clock,
  FileText,
  ShieldCheck,
  Search,
  ArrowRight,
  LogOut,
  UserCheck,
  Award,
  ChevronRight,
  Lock,
  Link as LinkIcon,
  Copy,
  Check,
  KeyRound,
  Smartphone,
  Sparkles,
  Star,
} from 'lucide-react';
import { Person, AllocatedGroup, AppraisalSubmission, DepartmentCluster } from '../types';
import { AppraisalFormModal } from './AppraisalFormModal';
import { ANNEX_A_RULES } from '../data/annexASpecifications';
import { getAppraisalSubmission, getAppraisalKey } from '../utils/appraisalStorage';
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
}) => {
  const [portalTab, setPortalTab] = useState<'assigned' | 'mypanel'>('assigned');
  const [loginSearch, setLoginSearch] = useState('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Currently active appraisal in modal
  const [activeReviewee, setActiveReviewee] = useState<Person | null>(null);
  const [isSelfReviewModal, setIsSelfReviewModal] = useState(false);
  const [activeGroupId, setActiveGroupId] = useState<string>('');
  const [activeAnnexRuleTitle, setActiveAnnexRuleTitle] = useState<string | undefined>(undefined);

  const peopleMap = useMemo(() => new Map<string, Person>(people.map((p) => [p.id, p])), [people]);

  const departments = useMemo(() => {
    return Array.from(new Set(people.map((p) => p.department))).sort();
  }, [people]);

  const currentUser = useMemo(() => {
    if (!currentUserId) return null;
    return peopleMap.get(currentUserId) || null;
  }, [currentUserId, peopleMap]);

  // Which groups has currentUser been assigned to as a REVIEWER?
  // In reciprocal model, currentUser is in group.memberIds for ~7 groups
  const assignedGroupsToReview = useMemo(() => {
    if (!currentUser) return [];
    return groups.filter((g) => g.memberIds.includes(currentUser.id));
  }, [currentUser, groups]);

  // Which group is reviewing currentUser?
  // There is exactly 1 group where currentUser is the revieweeId
  const myReviewGroup = useMemo(() => {
    if (!currentUser) return null;
    return groups.find((g) => g.revieweeId === currentUser.id) || null;
  }, [currentUser, groups]);

  // Submissions status summary for currentUser
  const reviewerStats = useMemo(() => {
    if (!currentUser) return { total: 0, completed: 0, drafts: 0, pending: 0 };
    let completed = 0;
    let drafts = 0;
    let pending = 0;

    for (const group of assignedGroupsToReview) {
      const sub = getAppraisalSubmission(submissions, currentUser.id, group.revieweeId);
      if (sub?.status === 'submitted') {
        completed++;
      } else if (sub?.status === 'draft') {
        drafts++;
      } else {
        pending++;
      }
    }

    return {
      total: assignedGroupsToReview.length,
      completed,
      drafts,
      pending,
    };
  }, [currentUser, assignedGroupsToReview, submissions]);

  // Reviews received for currentUser
  const receivedReviewsCount = useMemo(() => {
    if (!currentUser || !myReviewGroup) return 0;
    return myReviewGroup.memberIds.filter((revId) => {
      const sub = getAppraisalSubmission(submissions, revId, currentUser.id);
      return sub?.status === 'submitted';
    }).length;
  }, [currentUser, myReviewGroup, submissions]);

  // Self submission for currentUser
  const selfSubmission = useMemo(() => {
    if (!currentUser) return undefined;
    return getAppraisalSubmission(submissions, currentUser.id, currentUser.id);
  }, [currentUser, submissions]);

  // Filter login list
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
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(url);
    }
    setCopiedId(personId);
    setTimeout(() => setCopiedId((curr) => (curr === personId ? null : curr)), 2500);
  };

  const handleOpenAppraisalModal = (
    reviewee: Person,
    groupId: string,
    annexTitle?: string,
    isSelf: boolean = false
  ) => {
    setActiveReviewee(reviewee);
    setActiveGroupId(groupId);
    setActiveAnnexRuleTitle(annexTitle);
    setIsSelfReviewModal(isSelf);
  };

  const handleCloseModal = () => {
    setActiveReviewee(null);
    setIsSelfReviewModal(false);
  };

  // Helper to find if reviewee has an Annex A rule
  const getRevieweeAnnexRule = (reviewee: Person) => {
    const text = `${reviewee.role} ${reviewee.department}`.toLowerCase();
    return ANNEX_A_RULES.find((r) => {
      if (text.includes(r.functionTitle.toLowerCase())) return true;
      return r.aliases.some((alias) => text.includes(alias.toLowerCase()));
    });
  };

  // Handle instant enter key on search input
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && filteredLoginPeople.length > 0) {
      onSelectUser(filteredLoginPeople[0].id);
    }
  };

  // If NO USER is logged in, show the Employee Sign-In Portal
  if (!currentUser) {
    return (
      <div className="space-y-6">
        {/* Banner with Auto-Login Explanation */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1.5">
              <span className="font-semibold text-indigo-700">Employee 360° Portal</span>
              <span aria-hidden="true">·</span>
              <span>135 Team Members</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Automatic Sign-In & Personal Workspace
            </h1>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Every staff member can access their personalized appraisal panel directly. Once you
              sign in on your phone or computer, your browser will <strong>automatically remember you</strong>,
              so returning visits will open straight to your workspace without needing a password.
            </p>
          </div>

          {/* Quick Auto-Login Features Strip */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-100 text-xs">
            <div className="bg-slate-50 rounded-lg p-3 border border-slate-100 flex items-start gap-2.5">
              <Smartphone className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-800 font-semibold block">Automatic Device Remember:</strong>
                <span className="text-slate-500">
                  Select your profile once. Your session persists on this device for the entire appraisal cycle.
                </span>
              </div>
            </div>

            <div className="bg-slate-50 rounded-lg p-3 border border-slate-100 flex items-start gap-2.5">
              <KeyRound className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-800 font-semibold block">Personal Direct Link:</strong>
                <span className="text-slate-500">
                  Each employee has a unique link (e.g. <code className="text-indigo-700 font-mono">?staff=EMP-014</code>) sent via WhatsApp/SMS that logs in instantly.
                </span>
              </div>
            </div>
          </div>

          {/* Instant Search Bar */}
          <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-4 border-t border-slate-100">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={loginSearch}
                onChange={(e) => setLoginSearch(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                placeholder="Type your Name, Staff ID (e.g. EMP-014), or Department (Press Enter to auto-login)..."
                className="w-full pl-9 pr-3 py-2 text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all"
              />
            </div>

            <select
              value={selectedDeptFilter}
              onChange={(e) => setSelectedDeptFilter(e.target.value)}
              className="px-3 py-2 text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-slate-900"
            >
              <option value="ALL">All Departments ({departments.length})</option>
              {departments.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Employee Cards Grid for Sign-In */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Organization Directory ({filteredLoginPeople.length} staff found)
            </span>
            <span className="text-[11px] text-slate-400">
              Click any staff member to automatically open their workspace
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
                  className="text-left bg-white border border-slate-200 hover:border-slate-900 hover:shadow-md rounded-xl p-4 transition-all group flex flex-col justify-between cursor-pointer"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                        {person.name
                          .split(' ')
                          .map((n) => n[0])
                          .slice(0, 2)
                          .join('')}
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
                          {isCopied ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-slate-900">
                      {person.name}
                    </h3>
                    <p className="text-xs text-slate-600 line-clamp-1">{person.role}</p>
                    <span className="inline-block text-[11px] font-medium text-slate-500 mt-0.5">
                      {person.department}
                    </span>

                    {rule && (
                      <div className="mt-2 text-[10px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded flex items-center gap-1 w-fit">
                        <ShieldCheck className="w-3 h-3 text-indigo-600" />
                        <span>Rule #{rule.orderNumber}: {rule.functionTitle}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-slate-500">
                      {subsDone} of {assignedGroups.length} reviews submitted
                    </span>
                    <span className="text-xs font-semibold text-slate-900 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                      Auto-Login <ArrowRight className="w-3.5 h-3.5" />
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

  // ACTIVE LOGGED IN EMPLOYEE WORKSPACE
  const myAnnexRule = getRevieweeAnnexRule(currentUser);
  const directLink = getDirectLink(currentUser.id);

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Luxury Visual Hero Card */}
      <div className="relative rounded-3xl overflow-hidden bg-[#0A192F] text-white shadow-xl border border-[#132E52]">
        <img
          src={workspaceHeroImg}
          alt="Corporate Review Boardroom"
          className="absolute inset-0 w-full h-full object-cover opacity-25 mix-blend-luminosity scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#071224] via-[#0A192F]/85 to-[#102A45]/70"></div>

        <div className="relative z-10 p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#FFC700] via-[#FFD700] to-[#FFE566] text-[#0A192F] font-black text-xl flex items-center justify-center shrink-0 shadow-lg shadow-[#FFC700]/30 border border-white/20">
              {currentUser.name
                .split(' ')
                .map((n) => n[0])
                .slice(0, 2)
                .join('')}
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {currentUser.name}
                </h1>
                <span className="text-xs font-mono text-[#FFD700] bg-[#071224] px-2.5 py-0.5 rounded border border-[#FFC700]/40 font-bold shadow-2xs">
                  {currentUser.id}
                </span>
                {myAnnexRule && (
                  <span className="text-xs font-semibold text-[#FFD700] flex items-center gap-1 bg-[#FFC700]/15 border border-[#FFC700]/40 px-2.5 py-0.5 rounded-md">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#FFC700]" />
                    <span>Annex A Role #{myAnnexRule.orderNumber}</span>
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-300 mt-1">
                <strong className="text-white font-semibold">{currentUser.role}</strong>
                <span className="mx-2 text-slate-500">·</span>
                <span>Department:</span>{' '}
                <span className="font-semibold text-[#FFD700]">{currentUser.department}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto shrink-0">
            <button
              onClick={() => onSelectUser(null)}
              className="px-4 py-2 text-xs font-bold text-slate-200 hover:text-white bg-white/10 hover:bg-white/15 border border-white/20 rounded-xl transition-all flex items-center gap-2 cursor-pointer backdrop-blur-sm"
              title="Sign out from this session"
            >
              <LogOut className="w-4 h-4 text-slate-300" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Direct Workspace Magic Link Banner */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-2xs">
        <div className="flex items-start sm:items-center gap-2.5 text-slate-700">
          <KeyRound className="w-4 h-4 text-[#FFC700]" />
          <div>
            <span className="font-semibold text-[#0A192F]">Your Direct Auto-Login Link:</span>{' '}
            <code className="text-[11px] font-mono text-[#0A192F] bg-[#F4F6F9] px-2 py-0.5 rounded border border-[#E2E8F0] break-all select-all font-semibold">
              {directLink}
            </code>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Bookmark this URL or share it with yourself to instantly re-open your appraisal workspace anytime.
            </p>
          </div>
        </div>

        <button
          onClick={() => handleCopyLink(currentUser.id)}
          className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[#F4F6F9] border border-[#E2E8F0] hover:bg-[#EAEFF5] text-[#0A192F] transition-colors flex items-center gap-1.5 shrink-0 shadow-2xs self-start sm:self-auto cursor-pointer"
        >
          {copiedId === currentUser.id ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-emerald-700 font-semibold">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-slate-500" />
              <span>Copy Direct Link</span>
            </>
          )}
        </button>
      </div>

      {/* KPI Overview Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            Reviews To Conduct
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-slate-900">
              {reviewerStats.completed}
            </span>
            <span className="text-xs text-slate-400 font-medium">
              / {reviewerStats.total} submitted
            </span>
          </div>
          <div className="mt-2 flex items-center gap-2 text-[11px]">
            {reviewerStats.drafts > 0 && (
              <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded font-semibold">
                {reviewerStats.drafts} draft saved
              </span>
            )}
            {reviewerStats.pending > 0 && (
              <span className="text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                {reviewerStats.pending} pending
              </span>
            )}
            {reviewerStats.completed === reviewerStats.total && reviewerStats.total > 0 && (
              <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> All completed
              </span>
            )}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            Incoming Peer Appraisals
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-slate-900">
              {receivedReviewsCount}
            </span>
            <span className="text-xs text-slate-400 font-medium">
              / {myReviewGroup?.memberIds.length || 7} peer evaluations received
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            Your reviewing panel consists of 7 designated colleagues.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            My Self-Assessment
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-base font-bold text-slate-900">
              {selfSubmission?.status === 'submitted' ? (
                <span className="text-emerald-700 flex items-center gap-1.5 text-base">
                  <CheckCircle2 className="w-4 h-4" /> Submitted
                </span>
              ) : selfSubmission?.status === 'draft' ? (
                <span className="text-amber-700 flex items-center gap-1.5 text-base">
                  <Clock className="w-4 h-4" /> In-Progress Draft
                </span>
              ) : (
                <span className="text-slate-500 text-base">Pending Completion</span>
              )}
            </span>
          </div>
          <div className="mt-2">
            <button
              onClick={() =>
                handleOpenAppraisalModal(
                  currentUser,
                  myReviewGroup?.id || 'self',
                  undefined,
                  true
                )
              }
              className="text-xs font-semibold text-slate-900 underline hover:text-slate-700"
            >
              {selfSubmission?.status === 'submitted'
                ? 'View Submitted Self-Review'
                : 'Complete Self-Assessment →'}
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 flex items-center gap-6">
        <button
          onClick={() => setPortalTab('assigned')}
          className={`pb-3 text-sm font-semibold transition-colors flex items-center gap-2 ${
            portalTab === 'assigned'
              ? 'text-slate-900 border-b-2 border-slate-900'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Colleagues I Need to Review ({assignedGroupsToReview.length})</span>
        </button>

        <button
          onClick={() => setPortalTab('mypanel')}
          className={`pb-3 text-sm font-semibold transition-colors flex items-center gap-2 ${
            portalTab === 'mypanel'
              ? 'text-slate-900 border-b-2 border-slate-900'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>My Evaluation Panel ({myReviewGroup?.memberIds.length || 7} Peers)</span>
        </button>
      </div>

      {/* TAB 1: Assigned Colleagues */}
      {portalTab === 'assigned' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>
              You have been appointed to evaluate these {assignedGroupsToReview.length} colleagues.
              Your candid ratings and feedback are essential for fair 360° reviews.
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {assignedGroupsToReview.map((group) => {
              const reviewee = peopleMap.get(group.revieweeId);
              if (!reviewee) return null;

              const submission = getAppraisalSubmission(
                submissions,
                currentUser.id,
                reviewee.id
              );
              const rule = getRevieweeAnnexRule(reviewee);
              const isSubmitted = submission?.status === 'submitted';
              const isDraft = submission?.status === 'draft';

              return (
                <div
                  key={group.id}
                  className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0">
                          {reviewee.name
                            .split(' ')
                            .map((n) => n[0])
                            .slice(0, 2)
                            .join('')}
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-slate-900">{reviewee.name}</h3>
                          <p className="text-xs text-slate-600">{reviewee.role}</p>
                        </div>
                      </div>

                      {/* Status Tag */}
                      {isSubmitted ? (
                        <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded flex items-center gap-1 shrink-0">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Submitted
                        </span>
                      ) : isDraft ? (
                        <span className="text-[11px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded flex items-center gap-1 shrink-0">
                          <Clock className="w-3 h-3 text-amber-600" />
                          Draft Saved
                        </span>
                      ) : (
                        <span className="text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded shrink-0">
                          Pending
                        </span>
                      )}
                    </div>

                    <div className="mt-2 text-xs text-slate-600 flex items-center gap-2">
                      <span className="font-medium text-slate-700">Department:</span>
                      <span className="bg-slate-50 px-2 py-0.5 rounded border border-slate-100 text-slate-700">
                        {reviewee.department}
                      </span>
                    </div>

                    {rule && (
                      <div className="mt-2.5 text-[11px] font-medium text-indigo-700 bg-indigo-50 border border-indigo-200/80 px-2.5 py-1 rounded flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                        <span>
                          Annex A Prescribed Role #{rule.orderNumber}:{' '}
                          <strong>{rule.functionTitle}</strong>
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">
                      Group Panel #{group.number}
                    </span>

                    <button
                      onClick={() =>
                        handleOpenAppraisalModal(
                          reviewee,
                          group.id,
                          rule ? `Rule #${rule.orderNumber}: ${rule.functionTitle}` : undefined,
                          false
                        )
                      }
                      className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs ${
                        isSubmitted
                          ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          : isDraft
                          ? 'bg-amber-600 hover:bg-amber-700 text-white'
                          : 'bg-slate-900 hover:bg-slate-800 text-white'
                      }`}
                    >
                      {isSubmitted ? (
                        <>
                          <Lock className="w-3 h-3" />
                          <span>View Submitted Evaluation</span>
                        </>
                      ) : isDraft ? (
                        <>
                          <Clock className="w-3 h-3" />
                          <span>Resume Draft</span>
                        </>
                      ) : (
                        <>
                          <FileText className="w-3 h-3" />
                          <span>Start Appraisal</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: My Evaluation Panel & Self-Assessment */}
      {portalTab === 'mypanel' && (
        <div className="space-y-6">
          {/* Self-Assessment Card */}
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200/80 rounded-xl p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 bg-purple-100 px-2 py-0.5 rounded">
                  Self-Reflection
                </span>
                {selfSubmission?.status === 'submitted' && (
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Submitted
                  </span>
                )}
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Your Annual Self-Assessment
              </h3>
              <p className="text-xs text-slate-600 mt-1 max-w-xl leading-relaxed">
                Reflect on your own achievements, cross-functional partnerships, and growth areas
                over the past cycle. Your self-assessment is compared alongside peer inputs.
              </p>
            </div>

            <button
              onClick={() =>
                handleOpenAppraisalModal(
                  currentUser,
                  myReviewGroup?.id || 'self',
                  myAnnexRule
                    ? `Rule #${myAnnexRule.orderNumber}: ${myAnnexRule.functionTitle}`
                    : undefined,
                  true
                )
              }
              className="px-4 py-2 text-xs font-semibold text-white bg-purple-900 hover:bg-purple-800 rounded-lg transition-colors shrink-0 shadow-sm flex items-center gap-1.5"
            >
              <Award className="w-3.5 h-3.5" />
              <span>
                {selfSubmission?.status === 'submitted'
                  ? 'View My Self-Assessment'
                  : 'Complete Self-Assessment'}
              </span>
            </button>
          </div>

          {/* Incoming Panel Colleagues */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Panel Appointed to Evaluate You
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  These {myReviewGroup?.memberIds.length || 7} colleagues form your dedicated 360°
                  panel. Submissions are compiled by HR.
                </p>
              </div>

              <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-3 py-1 rounded-lg">
                {receivedReviewsCount} of {myReviewGroup?.memberIds.length || 7} completed
              </span>
            </div>

            {/* Designated Supervisor Notice */}
            {myReviewGroup?.designatedSupervisorName && (
              <div className="mb-4 bg-[#FFFDF0] border border-[#FFC700] rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-2xs">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#0A192F] text-[#FFD700] flex items-center justify-center shrink-0 shadow-xs border border-[#FFC700]/30">
                    <Star className="w-5 h-5 fill-[#FFD700]" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-[#D49B00]">
                      Designated Line Supervisor on Your Review Panel
                    </div>
                    <div className="text-sm font-bold text-[#0A192F]">
                      {myReviewGroup.designatedSupervisorName}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {myReviewGroup.designatedSupervisorRole || myReviewGroup.designatedSupervisorReason}
                    </div>
                  </div>
                </div>
                <span className="self-start sm:self-auto text-[10px] font-black uppercase tracking-wider bg-[#FFC700] text-[#0A192F] px-2.5 py-1 rounded shadow-2xs">
                  Reviewer Slot #1
                </span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {myReviewGroup?.memberIds.map((peerId) => {
                const peer = peopleMap.get(peerId);
                if (!peer) return null;

                const peerSub = getAppraisalSubmission(submissions, peer.id, currentUser.id);
                const isPeerSubmitted = peerSub?.status === 'submitted';
                const isSupervisor = myReviewGroup?.designatedSupervisorId === peer.id;

                return (
                  <div
                    key={peer.id}
                    className={`rounded-xl p-4 shadow-2xs flex items-center justify-between gap-3 transition-colors ${
                      isSupervisor
                        ? 'bg-[#FFFDF0] border-2 border-[#FFC700]'
                        : 'bg-white border border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-9 h-9 rounded-full font-bold text-xs flex items-center justify-center shrink-0 ${
                        isSupervisor
                          ? 'bg-[#0A192F] text-[#FFD700] border border-[#FFC700]'
                          : 'bg-slate-100 border border-slate-200 text-slate-700'
                      }`}>
                        {peer.name
                          .split(' ')
                          .map((n) => n[0])
                          .slice(0, 2)
                          .join('')}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="text-xs font-bold text-slate-900 truncate">{peer.name}</h4>
                          {isSupervisor && (
                            <span className="text-[9px] font-black uppercase tracking-wider bg-[#FFC700] text-[#0A192F] px-1 py-0.2 rounded shadow-2xs">
                              ★ Supervisor
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 line-clamp-1">{peer.role}</p>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {peer.department}
                        </span>
                      </div>
                    </div>

                    <div className="shrink-0">
                      {isPeerSubmitted ? (
                        <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded flex items-center gap-1 whitespace-nowrap">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Completed
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded whitespace-nowrap">
                          Pending
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Modal Form */}
      {activeReviewee && (
        <AppraisalFormModal
          isOpen={true}
          onClose={handleCloseModal}
          reviewer={currentUser}
          reviewee={activeReviewee}
          groupId={activeGroupId}
          isSelfAppraisal={isSelfReviewModal}
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
