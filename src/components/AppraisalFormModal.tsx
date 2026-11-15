import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  CheckCircle2,
  Save,
  Send,
  AlertTriangle,
  ShieldCheck,
  Lock,
  Users,
  Star,
  Trophy,
  MessageSquare,
  ChevronRight,
  Info,
} from 'lucide-react';
import { Person, AppraisalSubmission, RelationshipType, PerformanceRatingItem, isPersonSupervisor } from '../types';
import { loadPerformanceRatings, loadSupervisorRatings } from '../data/performanceRatings';

// ── helpers ────────────────────────────────────────────────────────────────────

function getRatingBand(score: number): { label: string; color: string; bg: string } {
  if (score >= 9) return { label: 'Excellent',  color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-300' };
  if (score >= 7) return { label: 'Very Good',  color: 'text-blue-700',    bg: 'bg-blue-50 border-blue-300' };
  if (score >= 5) return { label: 'Good',       color: 'text-amber-700',   bg: 'bg-amber-50 border-amber-300' };
  if (score >= 3) return { label: 'Fair',       color: 'text-orange-700',  bg: 'bg-orange-50 border-orange-300' };
  if (score >= 1) return { label: 'Poor',       color: 'text-rose-700',    bg: 'bg-rose-50 border-rose-300' };
  return               { label: 'Not rated',   color: 'text-slate-500',   bg: 'bg-slate-100 border-slate-200' };
}

function calcAverage(ratings: Record<string, number>): number {
  const vals = Object.values(ratings).filter((v) => typeof v === 'number' && v >= 1);
  if (!vals.length) return 0;
  return Number((vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1));
}

// ── props ──────────────────────────────────────────────────────────────────────

interface AppraisalFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  reviewer: Person;
  /** If provided the reviewer picked the reviewee via the selector; otherwise it was pre-set by the portal */
  reviewee: Person;
  /** All people — used for the "employee being reviewed" dropdown */
  allPeople: Person[];
  groupId: string;
  isSelfAppraisal?: boolean;
  annexRuleTitle?: string;
  annexSlotName?: string;
  initialSubmission?: AppraisalSubmission;
  onSaveDraft: (submission: AppraisalSubmission) => void;
  onSubmitFinal: (submission: AppraisalSubmission) => void;
}

// ── Rating slider row ─────────────────────────────────────────────────────────

interface RatingRowProps {
  item: PerformanceRatingItem;
  value: number;
  comment: string;
  disabled: boolean;
  onChange: (val: number) => void;
  onCommentChange: (val: string) => void;
  index: number;
  isSupervisorSection?: boolean;
}

const RatingRow: React.FC<RatingRowProps> = ({
  item,
  value,
  comment,
  disabled,
  onChange,
  onCommentChange,
  index,
  isSupervisorSection,
}) => {
  const band = getRatingBand(value);

  return (
    <div className={`border rounded-xl p-4 bg-white transition-colors ${value > 0 ? 'border-slate-300' : 'border-slate-200'}`}>
      {/* Title row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-mono font-bold text-slate-400 shrink-0">
              {isSupervisorSection ? `S${index + 1}.` : `${index + 1}.`}
            </span>
            <h4 className="text-sm font-bold text-slate-900">{item.title}</h4>
            {value > 0 && (
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${band.bg} ${band.color}`}>
                {band.label}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">{item.description}</p>
        </div>
        {/* Score badge */}
        {value > 0 && (
          <div className={`shrink-0 w-10 h-10 rounded-lg flex items-center justify-center font-black text-lg border ${band.bg} ${band.color}`}>
            {value}
          </div>
        )}
      </div>

      {/* 1-10 slider */}
      <div className="space-y-2">
        <div className="flex items-center gap-1 flex-wrap">
          {Array.from({ length: 10 }, (_, i) => i + 1).map((score) => {
            const isSelected = value === score;
            let btnClass = 'w-8 h-8 rounded-lg font-bold text-xs transition-all flex items-center justify-center ';
            if (isSelected) {
              if (score >= 9) btnClass += 'bg-emerald-600 text-white ring-2 ring-emerald-600 ring-offset-1 shadow-sm';
              else if (score >= 7) btnClass += 'bg-blue-600 text-white ring-2 ring-blue-600 ring-offset-1 shadow-sm';
              else if (score >= 5) btnClass += 'bg-amber-500 text-white ring-2 ring-amber-500 ring-offset-1 shadow-sm';
              else if (score >= 3) btnClass += 'bg-orange-500 text-white ring-2 ring-orange-500 ring-offset-1 shadow-sm';
              else btnClass += 'bg-rose-500 text-white ring-2 ring-rose-500 ring-offset-1 shadow-sm';
            } else if (disabled) {
              btnClass += 'bg-slate-100 text-slate-400 cursor-not-allowed';
            } else {
              btnClass += 'bg-slate-100 hover:bg-slate-200 text-slate-700 active:scale-95 cursor-pointer';
            }
            return (
              <button
                key={score}
                type="button"
                disabled={disabled}
                onClick={() => onChange(score)}
                className={btnClass}
              >
                {score}
              </button>
            );
          })}
        </div>
        <div className="flex justify-between text-[10px] text-slate-400 font-medium px-0.5">
          <span>1 = {item.lowLabel}</span>
          <span>10 = {item.highLabel}</span>
        </div>
      </div>

      {/* Comment box */}
      <div className="mt-3">
        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
          Comment{item.commentRequired ? <span className="text-rose-500 ml-0.5">*</span> : ' (optional)'}
        </label>
        <textarea
          rows={2}
          disabled={disabled}
          value={comment}
          onChange={(e) => onCommentChange(e.target.value)}
          placeholder="e.g. Usually on time, sometimes late for early morning shifts…"
          className="w-full text-xs text-slate-900 bg-white border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-slate-50 disabled:text-slate-500 transition-colors resize-none"
        />
      </div>
    </div>
  );
};

// ── Main component ────────────────────────────────────────────────────────────

export const AppraisalFormModal: React.FC<AppraisalFormModalProps> = ({
  isOpen,
  onClose,
  reviewer,
  reviewee: initialReviewee,
  allPeople,
  groupId,
  isSelfAppraisal = false,
  annexRuleTitle,
  annexSlotName,
  initialSubmission,
  onSaveDraft,
  onSubmitFinal,
}) => {
  // ── Section A ──
  const [selectedRevieweeId, setSelectedRevieweeId] = useState(initialReviewee.id);
  const [relationship, setRelationship] = useState<RelationshipType | ''>('');

  // ── Section B ──
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [ratingComments, setRatingComments] = useState<Record<string, string>>({});

  // ── Section C ──
  const [keyAchievements, setKeyAchievements] = useState('');

  // ── Section D ──
  const [finalComment, setFinalComment] = useState('');

  // ── UI state ──
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  // Live question lists
  const [perfItems, setPerfItems] = useState<PerformanceRatingItem[]>(() => loadPerformanceRatings());
  const [supItems, setSupItems] = useState<PerformanceRatingItem[]>(() => loadSupervisorRatings());

  const reviewee = useMemo(
    () => allPeople.find((p) => p.id === selectedRevieweeId) || initialReviewee,
    [selectedRevieweeId, allPeople, initialReviewee]
  );

  const revieweeIsSupervisor = useMemo(() => isPersonSupervisor(reviewee), [reviewee]);

  // Which rating items to show
  const activeItems = useMemo(
    () => (revieweeIsSupervisor ? [...perfItems, ...supItems] : perfItems),
    [revieweeIsSupervisor, perfItems, supItems]
  );

  // ── Init / reset on open ──────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;
    // Reload questions in case admin edited them
    setPerfItems(loadPerformanceRatings());
    setSupItems(loadSupervisorRatings());

    setSelectedRevieweeId(initialReviewee.id);

    if (initialSubmission) {
      setRelationship((initialSubmission.relationship as RelationshipType | '') || '');
      setRatings(initialSubmission.ratings || {});
      setRatingComments(initialSubmission.ratingComments || {});
      setKeyAchievements(initialSubmission.keyAchievements || '');
      setFinalComment(initialSubmission.finalComment || '');
    } else {
      setRelationship('');
      setRatings({});
      setRatingComments({});
      setKeyAchievements('');
      setFinalComment('');
    }

    setShowConfirmSubmit(false);
    setSaveStatus(null);
  }, [isOpen, initialSubmission, initialReviewee.id]);

  if (!isOpen) return null;

  const isSubmitted = initialSubmission?.status === 'submitted';
  const avgScore = calcAverage(ratings);
  const avgBand = getRatingBand(avgScore);

  // Validation
  const allRated = activeItems.every(
    (item) => typeof ratings[item.id] === 'number' && ratings[item.id] >= 1
  );
  const canSubmit =
    !isSelfAppraisal && relationship !== '' &&
    allRated &&
    keyAchievements.trim().length >= 10;

  // ── handlers ─────────────────────────────────────────────────────────────
  const handleRating = (id: string, val: number) => {
    if (isSubmitted) return;
    setRatings((p) => ({ ...p, [id]: val }));
  };

  const handleComment = (id: string, val: string) => {
    if (isSubmitted) return;
    setRatingComments((p) => ({ ...p, [id]: val }));
  };

  const buildSubmission = (status: 'draft' | 'submitted'): AppraisalSubmission => ({
    id: `${reviewer.id}__${reviewee.id}`,
    reviewerId: reviewer.id,
    revieweeId: reviewee.id,
    groupId,
    isSelfAppraisal,
    relationship: relationship as RelationshipType,
    ratings,
    ratingComments,
    keyAchievements,
    finalComment,
    // Legacy compat
    feedback: {
      strengths: keyAchievements,
      improvements: finalComment,
      specificObservation: '',
    },
    status,
    updatedAt: new Date().toISOString(),
    submittedAt: status === 'submitted' ? new Date().toISOString() : undefined,
    annexRuleTitle,
    annexSlotName,
  });

  const handleSaveDraft = () => {
    onSaveDraft(buildSubmission('draft'));
    setSaveStatus('Draft saved');
    setTimeout(() => setSaveStatus(null), 2500);
  };

  const handleConfirmSubmit = () => {
    onSubmitFinal(buildSubmission('submitted'));
    setShowConfirmSubmit(false);
    onClose();
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-3xl w-full max-h-[94vh] flex flex-col overflow-hidden">

        {/* ── Header ── */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-start justify-between gap-4 shrink-0">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              {isSelfAppraisal ? (
                <span className="text-[11px] font-bold uppercase tracking-wider text-purple-700 bg-purple-100 px-2.5 py-0.5 rounded-full">
                  Self-Assessment
                </span>
              ) : (
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-100 px-2.5 py-0.5 rounded-full">
                  360° Peer Appraisal
                </span>
              )}
              {annexRuleTitle && (
                <span className="text-[11px] font-medium text-slate-700 bg-white border border-slate-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-indigo-500" />
                  {annexRuleTitle}
                </span>
              )}
              {isSubmitted && (
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Submitted
                </span>
              )}
            </div>
            <h2 className="text-base font-black text-slate-900">
              {isSelfAppraisal ? 'Self-Assessment Form' : 'Staff Performance Appraisal Form'}
            </h2>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Reviewer: <strong className="text-slate-700">{reviewer.name}</strong>
              {' · '}{reviewer.department}
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/60 transition-colors shrink-0">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── Scrollable body ── */}
        <div className="flex-1 overflow-y-auto">

          {/* Submitted banner */}
          {isSubmitted && (
            <div className="mx-5 mt-5 bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 flex items-start gap-3 text-xs text-emerald-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong>This appraisal has been finalised and submitted to HR.</strong>
                <p className="mt-0.5 text-emerald-700">
                  Submitted{' '}
                  {initialSubmission?.submittedAt
                    ? new Date(initialSubmission.submittedAt).toLocaleString()
                    : 'in an earlier session'}
                  . Read-only audit view.
                </p>
              </div>
            </div>
          )}

          <div className="p-5 space-y-8">

            {/* ════ SECTION A: DEMOGRAPHICS ════ */}
            <section>
              <SectionHeader icon={<Users className="w-4 h-4 text-indigo-500" />} label="SECTION A" title="Demographics" />

              <div className="space-y-4 mt-4">
                {/* Employee being reviewed */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Employee Being Reviewed <span className="text-rose-500">*</span>
                  </label>
                  <p className="text-[11px] text-slate-500 mb-1.5">
                    Select or type the name of the employee you are evaluating.
                  </p>
                  {isSelfAppraisal ? (
                    <div className="text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 font-medium">
                      {reviewee.name} — {reviewee.role} · {reviewee.department}
                    </div>
                  ) : (
                    <select
                      disabled={isSubmitted}
                      value={selectedRevieweeId}
                      onChange={(e) => setSelectedRevieweeId(e.target.value)}
                      className="w-full text-xs text-slate-900 bg-white border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-50 disabled:text-slate-500"
                    >
                      {allPeople.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} — {p.role} · {p.department}
                        </option>
                      ))}
                    </select>
                  )}
                  {revieweeIsSupervisor && (
                    <p className="mt-1.5 text-[11px] text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg px-2.5 py-1.5 flex items-center gap-1.5">
                      <Info className="w-3 h-3 shrink-0" />
                      This employee holds a supervisory/management role — additional supervisor-specific questions will appear in Section B.
                    </p>
                  )}
                </div>

                {/* Relationship */}
                {!isSelfAppraisal && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Your Relationship to the Employee <span className="text-rose-500">*</span>
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {(['Manager / Supervisor', 'Peer / Colleague', 'Direct Report'] as RelationshipType[]).map((r) => (
                        <button
                          key={r}
                          type="button"
                          disabled={isSubmitted}
                          onClick={() => setRelationship(r)}
                          className={`px-4 py-2 rounded-lg text-xs font-semibold border transition-all ${
                            relationship === r
                              ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                              : isSubmitted
                              ? 'bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed'
                              : 'bg-white text-slate-700 border-slate-300 hover:border-indigo-400 hover:text-indigo-700'
                          }`}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                    {!relationship && !isSubmitted && (
                      <p className="text-[11px] text-amber-600 mt-1.5">Please select your relationship to continue.</p>
                    )}
                  </div>
                )}
              </div>
            </section>

            {/* ════ 1-10 SCALE LEGEND ════ */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Info className="w-4 h-4 text-slate-500 shrink-0" />
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">Rating Scale Guide (1 – 10)</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px]">
                {[
                  { range: '1 – 2', label: 'Poor', desc: 'Consistently fails to meet expectations. Immediate intervention needed.', color: 'text-rose-700 bg-rose-50 border-rose-200' },
                  { range: '3 – 4', label: 'Fair', desc: 'Frequently falls short or needs constant reminders.', color: 'text-orange-700 bg-orange-50 border-orange-200' },
                  { range: '5 – 6', label: 'Good', desc: 'Meets standard expectations consistently and reliably.', color: 'text-amber-700 bg-amber-50 border-amber-200' },
                  { range: '7 – 8', label: 'Very Good', desc: 'Exceeds standard expectations regularly; highly reliable.', color: 'text-blue-700 bg-blue-50 border-blue-200' },
                  { range: '9 – 10', label: 'Excellent', desc: 'Sets a benchmark for others; exemplary performance.', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
                ].map((b) => (
                  <div key={b.range} className={`flex items-start gap-2 rounded-lg border px-2.5 py-1.5 ${b.color}`}>
                    <span className="font-black shrink-0 w-9">{b.range}</span>
                    <span><strong>{b.label}:</strong> {b.desc}</span>
                  </div>
                ))}
              </div>

              {/* Average score strip */}
              {avgScore > 0 && (
                <div className={`mt-3 flex items-center gap-3 rounded-lg border px-3 py-2 ${avgBand.bg}`}>
                  <Star className={`w-4 h-4 shrink-0 ${avgBand.color}`} />
                  <div className="text-xs">
                    <span className={`font-black text-lg ${avgBand.color}`}>{avgScore}</span>
                    <span className="text-slate-500 ml-1">/ 10 avg · </span>
                    <span className={`font-bold ${avgBand.color}`}>{avgBand.label}</span>
                  </div>
                  <div className="ml-auto text-[11px] text-slate-500">
                    {Object.values(ratings).filter((v) => v >= 1).length} / {activeItems.length} rated
                  </div>
                </div>
              )}
            </div>

            {/* ════ SECTION B: PERFORMANCE RATINGS ════ */}
            <section>
              <SectionHeader icon={<Star className="w-4 h-4 text-amber-500" />} label="SECTION B" title="Performance Ratings" />

              <div className="mt-4 space-y-4">
                {perfItems.map((item, idx) => (
                  <RatingRow
                    key={item.id}
                    item={item}
                    value={ratings[item.id] || 0}
                    comment={ratingComments[item.id] || ''}
                    disabled={isSubmitted}
                    onChange={(v) => handleRating(item.id, v)}
                    onCommentChange={(v) => handleComment(item.id, v)}
                    index={idx}
                  />
                ))}
              </div>
            </section>

            {/* ════ SECTION B2: SUPERVISOR-SPECIFIC ════ */}
            {revieweeIsSupervisor && supItems.length > 0 && (
              <section>
                <SectionHeader
                  icon={<ShieldCheck className="w-4 h-4 text-indigo-500" />}
                  label="SECTION B2"
                  title="Supervisor / Manager Specific Ratings"
                  subtitle="These additional questions apply because the employee being evaluated holds a supervisory or management role."
                />
                <div className="mt-4 space-y-4">
                  {supItems.map((item, idx) => (
                    <RatingRow
                      key={item.id}
                      item={item}
                      value={ratings[item.id] || 0}
                      comment={ratingComments[item.id] || ''}
                      disabled={isSubmitted}
                      onChange={(v) => handleRating(item.id, v)}
                      onCommentChange={(v) => handleComment(item.id, v)}
                      index={idx}
                      isSupervisorSection
                    />
                  ))}
                </div>
              </section>
            )}

            {/* ════ SECTION C: KEY ACHIEVEMENTS ════ */}
            <section>
              <SectionHeader icon={<Trophy className="w-4 h-4 text-amber-500" />} label="SECTION C" title="Key Achievements" />
              <div className="mt-4">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  What are the KEY ACHIEVEMENTS made by this staff in this period?{' '}
                  <span className="text-rose-500">*</span>
                </label>
                <div className="mb-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2.5 text-[11px] text-blue-800 space-y-1">
                  <p className="font-semibold">Please list 2–3 specific achievements. Examples:</p>
                  <ul className="space-y-0.5 ml-2">
                    <li>• Reduced errors at verification desk from 10% to 2%</li>
                    <li>• Trained 5 new staff</li>
                    <li>• Led queue management during peak month of August</li>
                    <li>• Received positive client feedback / No complaints</li>
                  </ul>
                  <p className="text-blue-700">If no major achievement: write "No major achievement noted" or "Maintained good performance"</p>
                </div>
                <textarea
                  rows={4}
                  disabled={isSubmitted}
                  value={keyAchievements}
                  onChange={(e) => setKeyAchievements(e.target.value)}
                  placeholder="List key achievements here…"
                  className="w-full text-xs text-slate-900 bg-white border border-slate-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-slate-50 disabled:text-slate-500 transition-colors"
                />
                {keyAchievements.trim().length > 0 && keyAchievements.trim().length < 10 && (
                  <p className="text-[11px] text-amber-600 mt-1">Please provide at least 10 characters.</p>
                )}
              </div>
            </section>

            {/* ════ SECTION D: FINAL COMMENT ════ */}
            <section>
              <SectionHeader icon={<MessageSquare className="w-4 h-4 text-slate-500" />} label="SECTION D" title="Final Comments" />
              <div className="mt-4">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Any other comment or recommendation for improvement / reward?{' '}
                  <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <textarea
                  rows={3}
                  disabled={isSubmitted}
                  value={finalComment}
                  onChange={(e) => setFinalComment(e.target.value)}
                  placeholder="e.g. Recommend for promotion consideration / Needs coaching on time management…"
                  className="w-full text-xs text-slate-900 bg-white border border-slate-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-slate-50 disabled:text-slate-500 transition-colors"
                />
              </div>
            </section>

          </div>{/* /p-5 */}
        </div>{/* /scrollable */}

        {/* ── Footer ── */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            {saveStatus && (
              <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />{saveStatus}
              </span>
            )}
            {!isSubmitted && !saveStatus && (
              <span className="text-[11px] text-slate-400">Drafts save to your device.</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button type="button" onClick={onClose} className="px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded-lg transition-colors">
              Close
            </button>

            {!isSubmitted && (
              <>
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <Save className="w-3.5 h-3.5 text-slate-500" />Save Draft
                </button>

                <button
                  type="button"
                  disabled={!canSubmit}
                  onClick={() => setShowConfirmSubmit(true)}
                  title={!canSubmit ? 'Complete all required fields to submit.' : 'Submit final appraisal'}
                  className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-sm ${
                    canSubmit
                      ? 'bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <Send className="w-3.5 h-3.5" />Submit Final
                </button>
              </>
            )}
          </div>
        </div>

        {/* ── Confirm overlay ── */}
        {showConfirmSubmit && (
          <div className="fixed inset-0 z-60 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 border border-slate-200">
              <div className="w-10 h-10 rounded-full bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mb-3">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-base font-black text-slate-900">Confirm Final Submission</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                You are submitting your evaluation for{' '}
                <strong className="text-slate-900">{reviewee.name}</strong> with an average score of{' '}
                <strong className={avgBand.color}>{avgScore} / 10</strong> ({avgBand.label}).
              </p>
              <div className="mt-3 p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-[11px] text-amber-800">
                Once submitted, this record is sealed and forwarded to HR. It cannot be changed afterwards.
              </div>
              <div className="mt-5 flex items-center justify-end gap-2">
                <button type="button" onClick={() => setShowConfirmSubmit(false)} className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg">
                  Go Back
                </button>
                <button type="button" onClick={handleConfirmSubmit} className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm">
                  Yes, Submit
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

// ── Helper: section header ─────────────────────────────────────────────────────
const SectionHeader: React.FC<{
  icon: React.ReactNode;
  label: string;
  title: string;
  subtitle?: string;
}> = ({ icon, label, title, subtitle }) => (
  <div className="border-b border-slate-200 pb-3">
    <div className="flex items-center gap-2">
      {icon}
      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</span>
      <ChevronRight className="w-3 h-3 text-slate-300" />
      <h3 className="text-sm font-black text-slate-900">{title}</h3>
    </div>
    {subtitle && <p className="text-[11px] text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg px-2.5 py-1.5 mt-2">{subtitle}</p>}
  </div>
);
