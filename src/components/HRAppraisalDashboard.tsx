import React, { useState, useMemo } from 'react';
import {
  Users,
  CheckCircle2,
  Clock,
  Download,
  Search,
  Sparkles,
  Trash2,
  ChevronDown,
  ChevronRight,
  ShieldCheck,
  Star,
  FileSpreadsheet,
  AlertCircle,
  Eye,
  Filter,
  KeyRound,
  Copy,
  Check,
  Share2,
  ClipboardList,
} from 'lucide-react';
import { Person, AllocatedGroup, AppraisalSubmission, DepartmentCluster, AppraisalCriterion } from '../types';
import { APPRAISAL_CRITERIA, loadCriteria } from '../data/appraisalRubric';
import { RubricEditorModal } from './RubricEditorModal';
import { ANNEX_A_RULES } from '../data/annexASpecifications';
import {
  calculateAverageRating,
  getAppraisalKey,
  getAppraisalSubmission,
  seedRealisticAppraisals,
} from '../utils/appraisalStorage';
import workspaceHeroImg from '../assets/images/workspace_hero_banner_1793256996760.jpg';
import { ConfirmModal } from './ConfirmModal';

interface HRAppraisalDashboardProps {
  people: Person[];
  groups: AllocatedGroup[];
  clusters: DepartmentCluster[];
  submissions: Record<string, AppraisalSubmission>;
  onUpdateSubmissions: (subs: Record<string, AppraisalSubmission>) => void;
  onSelectEmployeeInPortal: (personId: string) => void;
  onOpenAnnexA: () => void;
}

export const HRAppraisalDashboard: React.FC<HRAppraisalDashboardProps> = ({
  people,
  groups,
  clusters,
  submissions,
  onUpdateSubmissions,
  onSelectEmployeeInPortal,
  onOpenAnnexA,
}) => {
  const [subView, setSubView] = useState<'reviewees' | 'reviewers'>('reviewees');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'COMPLETED' | 'IN_PROGRESS' | 'PENDING'>('ALL');
  const [expandedPersonId, setExpandedPersonId] = useState<string | null>(null);
  const [copiedLinkId, setCopiedLinkId] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showRubricEditor, setShowRubricEditor] = useState(false);
  const [liveCriteria, setLiveCriteria] = useState<AppraisalCriterion[]>(() => loadCriteria());

  const getDirectLinkForPerson = (personId: string) => {
    if (typeof window === 'undefined') return `?staff=${personId}`;
    return `${window.location.origin}${window.location.pathname}?staff=${personId}`;
  };

  const handleCopyLink = (person: Person, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const url = getDirectLinkForPerson(person.id);
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(url);
    }
    setCopiedLinkId(person.id);
    setTimeout(() => setCopiedLinkId((curr) => (curr === person.id ? null : curr)), 2500);
  };

  const handleExportMagicLinksCsv = () => {
    const rows = [
      [
        'Employee ID',
        'Full Name',
        'Job Role',
        'Department',
        'Email',
        'Direct Auto-Login URL',
        'WhatsApp Share URL',
      ],
    ];

    for (const p of people) {
      const url = getDirectLinkForPerson(p.id);
      const waMsg = `Hello ${p.name}, here is your confidential direct link for the 360 appraisal portal: ${url}`;
      const waUrl = `https://wa.me/?text=${encodeURIComponent(waMsg)}`;

      rows.push([
        p.id,
        `"${p.name.replace(/"/g, '""')}"`,
        `"${p.role.replace(/"/g, '""')}"`,
        `"${p.department.replace(/"/g, '""')}"`,
        p.email,
        url,
        waUrl,
      ]);
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `SmartGroup_135_Direct_AutoLogin_Links_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const peopleMap = useMemo(() => new Map<string, Person>(people.map((p) => [p.id, p])), [people]);

  const departments = useMemo(() => {
    return Array.from(new Set(people.map((p) => p.department))).sort();
  }, [people]);

  // Total expected peer submissions = sum of all group memberIds
  const totalExpectedReviews = useMemo(() => {
    return groups.reduce((acc, g) => acc + g.memberIds.length, 0);
  }, [groups]);

  // Overall statistics
  const metrics = useMemo(() => {
    const allSubs = Object.values(submissions);
    const peerSubs = allSubs.filter((s) => !s.isSelfAppraisal && s.reviewerId !== s.revieweeId);
    const selfSubs = allSubs.filter((s) => s.isSelfAppraisal || s.reviewerId === s.revieweeId);

    const completedPeerCount = peerSubs.filter((s) => s.status === 'submitted').length;
    const draftPeerCount = peerSubs.filter((s) => s.status === 'draft').length;
    const completedSelfCount = selfSubs.filter((s) => s.status === 'submitted').length;

    // Average organization score
    let scoreSum = 0;
    let scoreCount = 0;
    for (const sub of peerSubs) {
      if (sub.status === 'submitted') {
        const avg = calculateAverageRating(sub.ratings);
        if (avg > 0) {
          scoreSum += avg;
          scoreCount++;
        }
      }
    }

    const orgAvgScore = scoreCount > 0 ? Number((scoreSum / scoreCount).toFixed(2)) : 0;
    const completionPercent =
      totalExpectedReviews > 0
        ? Number(((completedPeerCount / totalExpectedReviews) * 100).toFixed(1))
        : 0;

    return {
      totalExpected: totalExpectedReviews,
      completed: completedPeerCount,
      drafts: draftPeerCount,
      pending: Math.max(0, totalExpectedReviews - completedPeerCount - draftPeerCount),
      completionPercent,
      completedSelfCount,
      totalEmployees: people.length,
      orgAvgScore,
    };
  }, [submissions, totalExpectedReviews, people.length]);

  // Handle Seeding Mock Submissions
  const handleSeedDemoData = () => {
    const updated = seedRealisticAppraisals(people, groups, 60);
    onUpdateSubmissions(updated);
  };

  // Handle Reset All Submissions
  const handleResetSubmissions = () => {
    setShowResetConfirm(true);
  };

  // Export Full CSV Report
  const handleExportCsv = () => {
    const rows = [
      [
        'Reviewee ID',
        'Reviewee Name',
        'Reviewee Role',
        'Reviewee Department',
        'Reviewer ID',
        'Reviewer Name',
        'Reviewer Department',
        'Evaluation Type',
        'Annex A Mandate',
        'Job Competence Score',
        'Collaboration Score',
        'Communication Score',
        'Integrity Score',
        'Problem Solving Score',
        'Overall Average Rating',
        'Status',
        'Key Strengths',
        'Areas for Improvement',
        'Departmental Observations',
        'Submitted At',
      ],
    ];

    for (const sub of Object.values(submissions)) {
      const reviewee = peopleMap.get(sub.revieweeId);
      const reviewer = peopleMap.get(sub.reviewerId);
      const avg = calculateAverageRating(sub.ratings);

      rows.push([
        sub.revieweeId,
        reviewee?.name || 'Unknown',
        reviewee?.role || '',
        reviewee?.department || '',
        sub.reviewerId,
        reviewer?.name || 'Unknown',
        reviewer?.department || '',
        sub.isSelfAppraisal ? 'Self-Assessment' : 'Peer 360 Review',
        sub.annexRuleTitle || 'Standard Group Rotation',
        String(sub.ratings['crit-exec'] || ''),
        String(sub.ratings['crit-collab'] || ''),
        String(sub.ratings['crit-comm'] || ''),
        String(sub.ratings['crit-integrity'] || ''),
        String(sub.ratings['crit-problem'] || ''),
        avg > 0 ? String(avg) : '',
        sub.status.toUpperCase(),
        `"${(sub.feedback?.strengths || '').replace(/"/g, '""')}"`,
        `"${(sub.feedback?.improvements || '').replace(/"/g, '""')}"`,
        `"${(sub.feedback?.specificObservation || '').replace(/"/g, '""')}"`,
        sub.submittedAt || sub.updatedAt || '',
      ]);
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `SmartGroup_Appraisals_Export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Reviewee list data computed
  const revieweeData = useMemo(() => {
    return people.map((person) => {
      const group = groups.find((g) => g.revieweeId === person.id);
      const panelReviewerIds = group?.memberIds || [];
      const totalPanel = panelReviewerIds.length;

      let completedReviews = 0;
      let totalRatingSum = 0;
      let ratedCount = 0;

      const panelDetails = panelReviewerIds.map((reviewerId) => {
        const reviewer = peopleMap.get(reviewerId);
        const sub = getAppraisalSubmission(submissions, reviewerId, person.id);
        const isDone = sub?.status === 'submitted';
        if (isDone) {
          completedReviews++;
          const score = calculateAverageRating(sub.ratings);
          if (score > 0) {
            totalRatingSum += score;
            ratedCount++;
          }
        }
        return {
          reviewer,
          submission: sub,
        };
      });

      const avgReceivedScore = ratedCount > 0 ? Number((totalRatingSum / ratedCount).toFixed(1)) : 0;
      const selfSub = getAppraisalSubmission(submissions, person.id, person.id);

      // Check Annex A
      const text = `${person.role} ${person.department}`.toLowerCase();
      const annexRule = ANNEX_A_RULES.find((r) => {
        if (text.includes(r.functionTitle.toLowerCase())) return true;
        return r.aliases.some((alias) => text.includes(alias.toLowerCase()));
      });

      return {
        person,
        group,
        totalPanel,
        completedReviews,
        panelDetails,
        avgReceivedScore,
        selfSub,
        annexRule,
        isFullyComplete: totalPanel > 0 && completedReviews === totalPanel,
      };
    });
  }, [people, groups, submissions, peopleMap]);

  // Reviewer list data computed
  const reviewerData = useMemo(() => {
    return people.map((person) => {
      const assignedGroups = groups.filter((g) => g.memberIds.includes(person.id));
      const totalAssigned = assignedGroups.length;

      let submittedCount = 0;
      let draftCount = 0;

      const reviewsList = assignedGroups.map((g) => {
        const reviewee = peopleMap.get(g.revieweeId);
        const sub = getAppraisalSubmission(submissions, person.id, g.revieweeId);
        if (sub?.status === 'submitted') submittedCount++;
        else if (sub?.status === 'draft') draftCount++;
        return { reviewee, group: g, submission: sub };
      });

      return {
        person,
        totalAssigned,
        submittedCount,
        draftCount,
        pendingCount: Math.max(0, totalAssigned - submittedCount - draftCount),
        reviewsList,
        isCompliant: totalAssigned > 0 && submittedCount === totalAssigned,
      };
    });
  }, [people, groups, submissions, peopleMap]);

  // Filter Reviewee Data
  const filteredReviewees = useMemo(() => {
    return revieweeData.filter((item) => {
      const matchSearch =
        item.person.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.person.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.person.department.toLowerCase().includes(searchQuery.toLowerCase());
      const matchDept = selectedDept === 'ALL' || item.person.department === selectedDept;

      let matchStatus = true;
      if (statusFilter === 'COMPLETED') {
        matchStatus = item.isFullyComplete;
      } else if (statusFilter === 'IN_PROGRESS') {
        matchStatus = item.completedReviews > 0 && item.completedReviews < item.totalPanel;
      } else if (statusFilter === 'PENDING') {
        matchStatus = item.completedReviews === 0;
      }

      return matchSearch && matchDept && matchStatus;
    });
  }, [revieweeData, searchQuery, selectedDept, statusFilter]);

  // Filter Reviewer Data
  const filteredReviewers = useMemo(() => {
    return reviewerData.filter((item) => {
      const matchSearch =
        item.person.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.person.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.person.department.toLowerCase().includes(searchQuery.toLowerCase());
      const matchDept = selectedDept === 'ALL' || item.person.department === selectedDept;

      let matchStatus = true;
      if (statusFilter === 'COMPLETED') {
        matchStatus = item.isCompliant;
      } else if (statusFilter === 'IN_PROGRESS') {
        matchStatus = item.submittedCount > 0 && item.submittedCount < item.totalAssigned;
      } else if (statusFilter === 'PENDING') {
        matchStatus = item.submittedCount === 0;
      }

      return matchSearch && matchDept && matchStatus;
    });
  }, [reviewerData, searchQuery, selectedDept, statusFilter]);

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Actions */}
      <div className="relative rounded-3xl overflow-hidden bg-[#0A192F] text-white shadow-xl border border-[#132E52]">
        <img
          src={workspaceHeroImg}
          alt="Corporate Review"
          className="absolute inset-0 w-full h-full object-cover opacity-20 mix-blend-luminosity scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#071224] via-[#0A192F]/90 to-[#102A45]/80"></div>

        <div className="relative z-10 p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-xs text-[#FFD700] font-semibold mb-2">
              <ShieldCheck className="w-4 h-4 text-[#FFC700]" />
              <span>HR Administration & Audit Console</span>
              <span aria-hidden="true" className="text-slate-500">·</span>
              <span className="text-slate-300">135 Review Panels</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Appraisal Progress & Compliance Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
              Real-time tracking of peer evaluations across all 135 allocated panels. Audit department
              submission velocity, score distributions, and Annex A statutory rule compliance.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-auto shrink-0">
            <button
              onClick={handleExportMagicLinksCsv}
              title="Download CSV containing direct magic links and WhatsApp share URLs for all 135 staff"
              className="px-4 py-2.5 text-xs font-black text-[#0A192F] bg-[#FFC700] hover:bg-[#F5B800] rounded-xl transition-all flex items-center gap-2 shadow-md shadow-[#FFC700]/30 cursor-pointer"
            >
              <KeyRound className="w-4 h-4 text-[#0A192F]" />
              <span>Export 135 Direct Links</span>
            </button>

            <button
              onClick={handleSeedDemoData}
              title="Populate 60 realistic sample evaluations to preview full analytics"
              className="px-4 py-2.5 text-xs font-bold text-[#FFD700] hover:text-white bg-[#0E223D] hover:bg-[#132E52] border border-[#FFC700]/40 rounded-xl transition-all flex items-center gap-2 backdrop-blur-sm cursor-pointer shadow-2xs"
            >
              <Sparkles className="w-4 h-4 text-[#FFD700]" />
              <span>Seed Demo Data (+60)</span>
            </button>

            <button
              onClick={handleExportCsv}
              title="Export all submitted ratings and feedback to CSV"
              className="px-4 py-2.5 text-xs font-bold text-slate-200 hover:text-white bg-[#0E223D] hover:bg-[#132E52] border border-[#1E3A5F] rounded-xl transition-all flex items-center gap-2 backdrop-blur-sm cursor-pointer"
            >
              <Download className="w-4 h-4 text-slate-300" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={handleResetSubmissions}
              title="Clear all stored appraisal submissions"
              className="px-3.5 py-2 text-xs font-semibold text-rose-300 hover:text-white bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/60 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>

            <button
              onClick={() => setShowRubricEditor(true)}
              title="Edit appraisal questions / criteria"
              className="px-3.5 py-2 text-xs font-semibold text-indigo-200 hover:text-white bg-indigo-900/40 hover:bg-indigo-800/60 border border-indigo-700/60 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <ClipboardList className="w-3.5 h-3.5" />
              <span>Edit Questions</span>
            </button>
          </div>
        </div>
      </div>


      {/* KPI Overview Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            Total Peer Appraisals
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-black text-slate-900">{metrics.totalExpected}</span>
            <span className="text-xs text-slate-400 font-medium">required</span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            135 panels × ~7 members
          </span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            Submitted & Finalized
          </span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-2xl font-black text-emerald-700">{metrics.completed}</span>
            <span className="text-xs font-semibold text-emerald-600">
              ({metrics.completionPercent}%)
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
            <div
              className="bg-emerald-600 h-full rounded-full transition-all"
              style={{ width: `${Math.min(100, metrics.completionPercent)}%` }}
            />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            In-Progress Drafts
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-black text-amber-700">{metrics.drafts}</span>
            <span className="text-xs text-slate-400 font-medium">auto-saved</span>
          </div>
          <span className="text-[11px] text-amber-700 mt-1 block">
            Pending final submission
          </span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            Self-Assessments
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-black text-purple-700">
              {metrics.completedSelfCount}
            </span>
            <span className="text-xs text-slate-400 font-medium">
              / {metrics.totalEmployees}
            </span>
          </div>
          <span className="text-[11px] text-purple-700 mt-1 block">
            Individual self-reviews
          </span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs col-span-2 sm:col-span-4 lg:col-span-1">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            Avg Organization Score
          </span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-2xl font-black text-slate-900">
              {metrics.orgAvgScore > 0 ? metrics.orgAvgScore : '—'}
            </span>
            <span className="text-xs text-slate-400 font-medium">/ 5.0</span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Across 5 core competencies
          </span>
        </div>
      </div>

      {/* Sub-view Navigation & Filters Strip */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          {/* Sub-view Toggle */}
          <div className="flex items-center gap-1 bg-[#F4F6F9] p-1 rounded-lg self-start border border-[#EAEFF5]">
            <button
              onClick={() => setSubView('reviewees')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                subView === 'reviewees'
                  ? 'bg-[#0A192F] text-[#FFD700] shadow-2xs font-bold border border-[#FFC700]/30'
                  : 'text-slate-600 hover:text-[#0A192F]'
              }`}
            >
              Reviewee Progress (135 Panels)
            </button>
            <button
              onClick={() => setSubView('reviewers')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                subView === 'reviewers'
                  ? 'bg-[#0A192F] text-[#FFD700] shadow-2xs font-bold border border-[#FFC700]/30'
                  : 'text-slate-600 hover:text-[#0A192F]'
              }`}
            >
              Reviewer Compliance (135 Appraisers)
            </button>
          </div>

          {/* Status Quick Filters */}
          <div className="flex items-center gap-1 text-xs">
            <span className="text-slate-500 font-medium mr-1 hidden md:inline">Status:</span>
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                statusFilter === 'ALL'
                  ? 'bg-[#0A192F] text-white font-semibold'
                  : 'bg-[#F4F6F9] text-slate-600 hover:bg-[#EAEFF5]'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setStatusFilter('COMPLETED')}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                statusFilter === 'COMPLETED'
                  ? 'bg-emerald-700 text-white font-semibold'
                  : 'bg-[#F4F6F9] text-slate-600 hover:bg-[#EAEFF5]'
              }`}
            >
              Completed
            </button>
            <button
              onClick={() => setStatusFilter('IN_PROGRESS')}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                statusFilter === 'IN_PROGRESS'
                  ? 'bg-[#D49B00] text-white font-semibold'
                  : 'bg-[#F4F6F9] text-slate-600 hover:bg-[#EAEFF5]'
              }`}
            >
              In Progress
            </button>
            <button
              onClick={() => setStatusFilter('PENDING')}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                statusFilter === 'PENDING'
                  ? 'bg-slate-700 text-white font-semibold'
                  : 'bg-[#F4F6F9] text-slate-600 hover:bg-[#EAEFF5]'
              }`}
            >
              Pending
            </button>
          </div>
        </div>

        {/* Search & Department Selector */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-3 border-t border-[#EAEFF5]">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by employee name, role, or department..."
              className="w-full pl-9 pr-3 py-1.5 text-xs text-[#0A192F] bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#0A192F] focus:border-[#FFC700] focus:bg-white"
            />
          </div>

          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="px-3 py-1.5 text-xs text-[#0A192F] bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#0A192F]"
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

      {/* TABLE 1: REVIEWEES PROGRESS VIEW */}
      {subView === 'reviewees' && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">
              Employee Being Reviewed ({filteredReviewees.length} staff)
            </h3>
            <span className="text-xs text-slate-400">
              Click any row to inspect individual 7-peer reviewer statuses
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4 w-8"></th>
                  <th className="py-3 px-4">Employee</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Panel Progress</th>
                  <th className="py-3 px-4">Avg Peer Score</th>
                  <th className="py-3 px-4">Self-Assessment</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredReviewees.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-xs text-slate-400">
                      No employees match the current filters.
                    </td>
                  </tr>
                ) : (
                  filteredReviewees.map((item) => {
                    const isExpanded = expandedPersonId === item.person.id;
                    const percent =
                      item.totalPanel > 0
                        ? Math.round((item.completedReviews / item.totalPanel) * 100)
                        : 0;

                    return (
                      <React.Fragment key={item.person.id}>
                        <tr
                          onClick={() =>
                            setExpandedPersonId((curr) =>
                              curr === item.person.id ? null : item.person.id
                            )
                          }
                          className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                        >
                          <td className="py-3 px-4 text-slate-400">
                            {isExpanded ? (
                              <ChevronDown className="w-4 h-4 text-slate-700" />
                            ) : (
                              <ChevronRight className="w-4 h-4" />
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-bold text-slate-900 flex items-center gap-2">
                              <span>{item.person.name}</span>
                              {item.annexRule && (
                                <span
                                  title={`Annex A Rule #${item.annexRule.orderNumber}: ${item.annexRule.functionTitle}`}
                                  className="text-[10px] text-indigo-700 bg-indigo-50 border border-indigo-200 px-1.5 py-0.2 rounded font-semibold flex items-center gap-0.5"
                                >
                                  <ShieldCheck className="w-3 h-3 text-indigo-600" />
                                  <span>#{item.annexRule.orderNumber}</span>
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500">{item.person.role}</div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-medium text-slate-800">
                              {item.person.department}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <span className="font-bold tabular-nums text-slate-900">
                                {item.completedReviews} / {item.totalPanel}
                              </span>
                              <div className="w-24 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all ${
                                    item.isFullyComplete ? 'bg-emerald-600' : 'bg-slate-700'
                                  }`}
                                  style={{ width: `${percent}%` }}
                                />
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            {item.avgReceivedScore > 0 ? (
                              <div className="flex items-center gap-1.5 font-bold text-slate-900">
                                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                                <span>{item.avgReceivedScore}</span>
                                <span className="text-slate-400 font-normal text-[11px]">/ 5.0</span>
                              </div>
                            ) : (
                              <span className="text-slate-400 italic">No ratings yet</span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            {item.selfSub?.status === 'submitted' ? (
                              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded flex items-center gap-1 w-fit">
                                <CheckCircle2 className="w-3 h-3" /> Submitted
                              </span>
                            ) : item.selfSub?.status === 'draft' ? (
                              <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded flex items-center gap-1 w-fit">
                                <Clock className="w-3 h-3" /> Draft
                              </span>
                            ) : (
                              <span className="text-[11px] text-slate-400">Pending</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={(e) => handleCopyLink(item.person, e)}
                                title={`Copy direct auto-login link for ${item.person.name}`}
                                className="px-2 py-1 rounded text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 transition-colors flex items-center gap-1 text-[11px] font-medium border border-slate-200 bg-white shadow-2xs"
                              >
                                {copiedLinkId === item.person.id ? (
                                  <>
                                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                                    <span className="text-emerald-700 font-semibold">Copied!</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                                    <span className="hidden sm:inline">Copy Link</span>
                                  </>
                                )}
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onSelectEmployeeInPortal(item.person.id);
                                }}
                                className="text-xs font-semibold text-slate-900 hover:text-slate-700 underline"
                              >
                                Open Portal →
                              </button>
                            </div>
                          </td>
                        </tr>

                        {/* Expanded Panel Breakdown */}
                        {isExpanded && (
                          <tr className="bg-slate-50/70 border-b border-slate-200">
                            <td colSpan={7} className="p-4 sm:p-6">
                              <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs space-y-3">
                                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                                    7-Member Appraiser Panel for {item.person.name}
                                  </h4>
                                  <span className="text-xs text-slate-500">
                                    Group #{item.group?.number || '—'}
                                  </span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
                                  {item.panelDetails.map((pd, pidx) => {
                                    const reviewer = pd.reviewer;
                                    const sub = pd.submission;
                                    const isDone = sub?.status === 'submitted';
                                    const score = sub ? calculateAverageRating(sub.ratings) : 0;

                                    if (!reviewer) return null;

                                    return (
                                      <div
                                        key={reviewer.id}
                                        className="border border-slate-200 rounded-lg p-3 bg-slate-50/50 flex flex-col justify-between"
                                      >
                                        <div>
                                          <div className="flex items-start justify-between gap-1 mb-1">
                                            <span className="text-[11px] font-bold text-slate-900">
                                              {pidx + 1}. {reviewer.name}
                                            </span>
                                            {isDone ? (
                                              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                                                Submitted
                                              </span>
                                            ) : sub?.status === 'draft' ? (
                                              <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
                                                Draft
                                              </span>
                                            ) : (
                                              <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                                                Pending
                                              </span>
                                            )}
                                          </div>
                                          <div className="text-[11px] text-slate-500">
                                            {reviewer.role} ({reviewer.department})
                                          </div>
                                        </div>

                                        {isDone && (
                                          <div className="mt-2 pt-2 border-t border-slate-200 text-[11px] flex items-center justify-between">
                                            <span className="text-slate-500">Peer Rating:</span>
                                            <span className="font-bold text-slate-900">
                                              {score} / 5.0
                                            </span>
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TABLE 2: REVIEWERS COMPLIANCE VIEW */}
      {subView === 'reviewers' && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">
              Reviewer Submission Compliance ({filteredReviewers.length} staff)
            </h3>
            <span className="text-xs text-slate-400">
              Track which employees have finished their required ~7 peer evaluations
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Reviewer</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Submitted</th>
                  <th className="py-3 px-4">Drafts</th>
                  <th className="py-3 px-4">Pending</th>
                  <th className="py-3 px-4">Compliance Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredReviewers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-xs text-slate-400">
                      No reviewers match the current filter.
                    </td>
                  </tr>
                ) : (
                  filteredReviewers.map((item) => {
                    const percent =
                      item.totalAssigned > 0
                        ? Math.round((item.submittedCount / item.totalAssigned) * 100)
                        : 0;

                    return (
                      <tr key={item.person.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900">{item.person.name}</div>
                          <div className="text-[11px] text-slate-500">{item.person.role}</div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-medium text-slate-800">
                            {item.person.department}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-bold text-emerald-700">
                            {item.submittedCount} / {item.totalAssigned}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-amber-700 font-semibold">{item.draftCount}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-slate-500">{item.pendingCount}</span>
                        </td>
                        <td className="py-3 px-4">
                          {item.isCompliant ? (
                            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded flex items-center gap-1 w-fit">
                              <CheckCircle2 className="w-3 h-3" /> Fully Compliant
                            </span>
                          ) : item.submittedCount > 0 ? (
                            <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded w-fit block">
                              {percent}% Done
                            </span>
                          ) : (
                            <span className="text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded w-fit block">
                              Not Started
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={(e) => handleCopyLink(item.person, e)}
                              title={`Copy direct auto-login link for ${item.person.name}`}
                              className="px-2 py-1 rounded text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 transition-colors flex items-center gap-1 text-[11px] font-medium border border-slate-200 bg-white shadow-2xs"
                            >
                              {copiedLinkId === item.person.id ? (
                                <>
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                  <span className="text-emerald-700 font-semibold">Copied!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                                  <span className="hidden sm:inline">Copy Link</span>
                                </>
                              )}
                            </button>
                            <button
                              onClick={() => onSelectEmployeeInPortal(item.person.id)}
                              className="text-xs font-semibold text-slate-900 hover:text-slate-700 underline"
                            >
                              Open Portal →
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={showResetConfirm}
        title="Clear All Appraisal Evaluations?"
        message="Are you sure you want to clear all appraisal drafts and finalized submissions? This will reset all evaluation progress to 0% across all departments."
        confirmText="Clear Submissions"
        confirmVariant="danger"
        onConfirm={() => {
          localStorage.removeItem('smartgroup_appraisals');
          localStorage.removeItem('smartgroup_appraisal_submissions_v1');
          onUpdateSubmissions({});
          setShowResetConfirm(false);
        }}
        onCancel={() => setShowResetConfirm(false)}
      />

      <RubricEditorModal
        isOpen={showRubricEditor}
        onClose={() => setShowRubricEditor(false)}
        onCriteriaSaved={(updated) => setLiveCriteria(updated)}
      />
    </div>
  );
};
