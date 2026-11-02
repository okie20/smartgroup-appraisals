import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, Save, Send, AlertTriangle, ShieldCheck, Lock, Star, Sparkles } from 'lucide-react';
import { Person, AppraisalSubmission } from '../types';
import { APPRAISAL_CRITERIA } from '../data/appraisalRubric';
import { calculateAverageRating } from '../utils/appraisalStorage';

interface AppraisalFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  reviewer: Person;
  reviewee: Person;
  groupId: string;
  isSelfAppraisal?: boolean;
  annexRuleTitle?: string;
  annexSlotName?: string;
  initialSubmission?: AppraisalSubmission;
  onSaveDraft: (submission: AppraisalSubmission) => void;
  onSubmitFinal: (submission: AppraisalSubmission) => void;
}

export const AppraisalFormModal: React.FC<AppraisalFormModalProps> = ({
  isOpen,
  onClose,
  reviewer,
  reviewee,
  groupId,
  isSelfAppraisal = false,
  annexRuleTitle,
  annexSlotName,
  initialSubmission,
  onSaveDraft,
  onSubmitFinal,
}) => {
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [strengths, setStrengths] = useState('');
  const [improvements, setImprovements] = useState('');
  const [specificObservation, setSpecificObservation] = useState('');
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  // Initialize or reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      if (initialSubmission) {
        setRatings(initialSubmission.ratings || {});
        setStrengths(initialSubmission.feedback?.strengths || '');
        setImprovements(initialSubmission.feedback?.improvements || '');
        setSpecificObservation(initialSubmission.feedback?.specificObservation || '');
      } else {
        setRatings({});
        setStrengths('');
        setImprovements('');
        setSpecificObservation('');
      }
      setShowConfirmSubmit(false);
      setSaveStatus(null);
    }
  }, [isOpen, initialSubmission]);

  if (!isOpen) return null;

  const isSubmitted = initialSubmission?.status === 'submitted';
  const averageScore = calculateAverageRating(ratings);

  const allCriteriaAnswered = APPRAISAL_CRITERIA.every(
    (c) => typeof ratings[c.id] === 'number' && ratings[c.id] >= 1
  );

  const canSubmit =
    allCriteriaAnswered &&
    strengths.trim().length >= 10 &&
    improvements.trim().length >= 10;

  const handleRatingSelect = (criterionId: string, value: number) => {
    if (isSubmitted) return;
    setRatings((prev) => ({ ...prev, [criterionId]: value }));
  };

  const handleSaveDraftClick = () => {
    const submission: AppraisalSubmission = {
      id: `${reviewer.id}__${reviewee.id}`,
      reviewerId: reviewer.id,
      revieweeId: reviewee.id,
      groupId,
      isSelfAppraisal,
      ratings,
      feedback: {
        strengths,
        improvements,
        specificObservation,
      },
      status: 'draft',
      updatedAt: new Date().toISOString(),
      annexRuleTitle,
      annexSlotName,
    };
    onSaveDraft(submission);
    setSaveStatus('Draft saved successfully');
    setTimeout(() => setSaveStatus(null), 2500);
  };

  const handleConfirmFinalSubmit = () => {
    const submission: AppraisalSubmission = {
      id: `${reviewer.id}__${reviewee.id}`,
      reviewerId: reviewer.id,
      revieweeId: reviewee.id,
      groupId,
      isSelfAppraisal,
      ratings,
      feedback: {
        strengths,
        improvements,
        specificObservation,
      },
      status: 'submitted',
      updatedAt: new Date().toISOString(),
      submittedAt: new Date().toISOString(),
      annexRuleTitle,
      annexSlotName,
    };
    onSubmitFinal(submission);
    setShowConfirmSubmit(false);
    onClose();
  };

  const getScoreBadgeColor = (score: number) => {
    if (score >= 4.5) return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    if (score >= 3.5) return 'text-blue-700 bg-blue-50 border-blue-200';
    if (score >= 2.5) return 'text-amber-700 bg-amber-50 border-amber-200';
    if (score > 0) return 'text-rose-700 bg-rose-50 border-rose-200';
    return 'text-slate-600 bg-slate-100 border-slate-200';
  };

  const getScoreDescriptor = (score: number) => {
    if (score >= 4.5) return 'Exceptional Benchmark';
    if (score >= 3.8) return 'Exceeds Expectations';
    if (score >= 2.8) return 'Proficient / Competent';
    if (score >= 2.0) return 'Developing / Needs Coaching';
    if (score > 0) return 'Unsatisfactory';
    return 'Not yet rated';
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              {isSelfAppraisal ? (
                <span className="text-[11px] font-semibold uppercase tracking-wider text-purple-700 bg-purple-100/80 px-2.5 py-0.5 rounded">
                  Self-Assessment
                </span>
              ) : (
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-700 bg-slate-200/80 px-2.5 py-0.5 rounded">
                  Peer 360° Appraisal
                </span>
              )}

              {annexRuleTitle && (
                <span className="text-[11px] font-medium text-indigo-700 bg-indigo-50 border border-indigo-200/80 px-2 py-0.5 rounded flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-indigo-600" />
                  {annexRuleTitle}
                </span>
              )}

              {isSubmitted && (
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded flex items-center gap-1">
                  <Lock className="w-3 h-3 text-emerald-600" />
                  Finalized & Submitted
                </span>
              )}
            </div>

            <h2 className="text-lg font-bold text-slate-900">
              {isSelfAppraisal
                ? `Self-Assessment: ${reviewee.name}`
                : `Appraisal for: ${reviewee.name}`}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Role: <strong className="text-slate-700">{reviewee.role}</strong> · Dept:{' '}
              <strong className="text-slate-700">{reviewee.department}</strong>
              {!isSelfAppraisal && (
                <>
                  {' '}
                  · Evaluating as:{' '}
                  <span className="text-slate-800 font-medium">
                    {reviewer.name} ({reviewer.department})
                  </span>
                </>
              )}
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {isSubmitted && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3.5 flex items-start gap-3 text-xs text-emerald-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-semibold">This appraisal has been finalized and submitted to HR.</strong>
                <p className="mt-0.5 text-emerald-700">
                  Submitted at{' '}
                  {initialSubmission?.submittedAt
                    ? new Date(initialSubmission.submittedAt).toLocaleString()
                    : 'Earlier session'}
                  . You are viewing this record in read-only audit mode.
                </p>
              </div>
            </div>
          )}

          {/* Overall Rating Scorecard Strip */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Calculated Weighted Score
              </span>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-2xl font-black text-slate-900 tracking-tight">
                  {averageScore > 0 ? averageScore : '—'}
                </span>
                <span className="text-xs text-slate-400 font-medium">/ 5.0</span>
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded border ${getScoreBadgeColor(
                    averageScore
                  )}`}
                >
                  {getScoreDescriptor(averageScore)}
                </span>
              </div>
            </div>

            <div className="text-xs text-slate-500 text-left sm:text-right">
              <div>
                Criteria completed:{' '}
                <strong className="text-slate-800">
                  {Object.values(ratings).filter((v) => v > 0).length} of{' '}
                  {APPRAISAL_CRITERIA.length}
                </strong>
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Scale: 1 (Unsatisfactory) to 5 (Exceptional)
              </div>
            </div>
          </div>

          {/* Section 1: Standard Evaluation Criteria */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Star className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm font-bold text-slate-900">
                1. Core Competency Ratings (1 to 5)
              </h3>
            </div>

            <div className="space-y-4">
              {APPRAISAL_CRITERIA.map((criterion, idx) => {
                const currentVal = ratings[criterion.id] || 0;
                return (
                  <div
                    key={criterion.id}
                    className="border border-slate-200 rounded-lg p-4 bg-white hover:border-slate-300 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-semibold text-slate-400">
                            0{idx + 1}.
                          </span>
                          <h4 className="text-sm font-semibold text-slate-900">
                            {criterion.title}
                          </h4>
                          <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                            {criterion.category}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                          {criterion.description}
                        </p>
                      </div>

                      {/* 1-5 Button selector */}
                      <div className="flex items-center gap-1.5 shrink-0 pt-1 sm:pt-0">
                        {[1, 2, 3, 4, 5].map((score) => {
                          const isSelected = currentVal === score;
                          return (
                            <button
                              key={score}
                              type="button"
                              disabled={isSubmitted}
                              onClick={() => handleRatingSelect(criterion.id, score)}
                              title={criterion.anchors[score as 1 | 2 | 3 | 4 | 5]}
                              className={`w-9 h-9 rounded-lg font-bold text-xs transition-all flex items-center justify-center ${
                                isSelected
                                  ? 'bg-slate-900 text-white shadow-sm ring-2 ring-slate-900 ring-offset-1'
                                  : isSubmitted
                                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 active:scale-95'
                              }`}
                            >
                              {score}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Anchor explanation for current choice */}
                    {currentVal > 0 ? (
                      <div className="mt-2 text-[11px] text-slate-600 bg-slate-50 rounded px-2.5 py-1.5 border border-slate-100 flex items-center gap-1.5">
                        <span className="font-bold text-slate-800">
                          Rating {currentVal}:
                        </span>
                        <span>{criterion.anchors[currentVal as 1 | 2 | 3 | 4 | 5]}</span>
                      </div>
                    ) : (
                      <div className="mt-2 text-[11px] text-slate-400 italic">
                        Select a score from 1 to 5 based on direct peer observation.
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 2: Qualitative Feedback */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              <h3 className="text-sm font-bold text-slate-900">
                2. Constructive Feedback & Departmental Observations
              </h3>
            </div>

            <div className="space-y-4">
              {/* Strengths */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Key Strengths & Notable Contributions{' '}
                  <span className="text-rose-500">*</span>
                </label>
                <p className="text-[11px] text-slate-500 mb-1.5">
                  Specific actions, reliable behaviors, or achievements that make this colleague effective.
                </p>
                <textarea
                  rows={3}
                  disabled={isSubmitted}
                  value={strengths}
                  onChange={(e) => setStrengths(e.target.value)}
                  placeholder="e.g. Always responds swiftly when equipment issues arise; meticulously follows daily security procedures..."
                  className="w-full text-xs text-slate-900 bg-white border border-slate-200 rounded-lg p-3 focus:outline-hidden focus:ring-2 focus:ring-slate-900 focus:border-transparent disabled:bg-slate-50 disabled:text-slate-500 transition-colors"
                />
                {strengths.trim().length > 0 && strengths.trim().length < 10 && (
                  <span className="text-[10px] text-amber-600 mt-0.5 block">
                    Please provide at least 10 characters of specific feedback.
                  </span>
                )}
              </div>

              {/* Improvements */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Areas for Development & Practical Recommendations{' '}
                  <span className="text-rose-500">*</span>
                </label>
                <p className="text-[11px] text-slate-500 mb-1.5">
                  Actionable suggestions to improve coordination, communication, or operational efficiency.
                </p>
                <textarea
                  rows={3}
                  disabled={isSubmitted}
                  value={improvements}
                  onChange={(e) => setImprovements(e.target.value)}
                  placeholder="e.g. Would appreciate earlier alerts before maintenance cut-offs to avoid dispatch disruption..."
                  className="w-full text-xs text-slate-900 bg-white border border-slate-200 rounded-lg p-3 focus:outline-hidden focus:ring-2 focus:ring-slate-900 focus:border-transparent disabled:bg-slate-50 disabled:text-slate-500 transition-colors"
                />
                {improvements.trim().length > 0 && improvements.trim().length < 10 && (
                  <span className="text-[10px] text-amber-600 mt-0.5 block">
                    Please provide at least 10 characters of constructive feedback.
                  </span>
                )}
              </div>

              {/* Departmental Specific Observation */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Cross-Functional / Departmental Perspective (Optional)
                </label>
                <p className="text-[11px] text-slate-500 mb-1.5">
                  Observations from your specific unit ({reviewer.department}) when interacting with {reviewee.department}.
                </p>
                <textarea
                  rows={2}
                  disabled={isSubmitted}
                  value={specificObservation}
                  onChange={(e) => setSpecificObservation(e.target.value)}
                  placeholder="e.g. As an Operations team member, handovers during morning shift briefings have been smooth..."
                  className="w-full text-xs text-slate-900 bg-white border border-slate-200 rounded-lg p-3 focus:outline-hidden focus:ring-2 focus:ring-slate-900 focus:border-transparent disabled:bg-slate-50 disabled:text-slate-500 transition-colors"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {saveStatus && (
              <span className="text-xs text-emerald-600 font-medium flex items-center gap-1 animate-in fade-in">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {saveStatus}
              </span>
            )}
            {!isSubmitted && !saveStatus && (
              <span className="text-[11px] text-slate-400">
                Drafts are saved locally on your device.
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded-lg transition-colors"
            >
              Close
            </button>

            {!isSubmitted && (
              <>
                <button
                  type="button"
                  onClick={handleSaveDraftClick}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs"
                >
                  <Save className="w-3.5 h-3.5 text-slate-500" />
                  <span>Save Draft</span>
                </button>

                <button
                  type="button"
                  disabled={!canSubmit}
                  onClick={() => setShowConfirmSubmit(true)}
                  className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-sm ${
                    canSubmit
                      ? 'bg-slate-900 hover:bg-slate-800 text-white cursor-pointer'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                  title={
                    !canSubmit
                      ? 'Please answer all 5 criteria and provide written feedback to submit.'
                      : 'Submit completed appraisal'
                  }
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Final Appraisal</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Confirmation Modal Overlay */}
        {showConfirmSubmit && (
          <div className="fixed inset-0 z-60 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 border border-slate-200 animate-in fade-in zoom-in-95">
              <div className="w-10 h-10 rounded-full bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mb-3">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Confirm Final Submission
              </h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                You are about to submit your 360° evaluation for{' '}
                <strong className="text-slate-900">{reviewee.name}</strong> with an overall score of{' '}
                <strong className="text-slate-900">{averageScore} / 5.0</strong>.
              </p>
              <div className="mt-3 p-2.5 rounded bg-amber-50/70 border border-amber-200 text-[11px] text-amber-800">
                Once submitted, this record will be sealed and forwarded to the HR appraisal records. It cannot be altered afterwards.
              </div>

              <div className="mt-5 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowConfirmSubmit(false)}
                  className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Go Back & Review
                </button>
                <button
                  type="button"
                  onClick={handleConfirmFinalSubmit}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm"
                >
                  Yes, Submit Evaluation
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
