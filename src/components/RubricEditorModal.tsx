import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Trash2,
  GripVertical,
  ChevronUp,
  ChevronDown,
  RotateCcw,
  Save,
  AlertTriangle,
  ClipboardList,
} from 'lucide-react';
import { AppraisalCriterion } from '../types';
import {
  loadCriteria,
  saveCriteria,
  resetCriteriaToDefaults,
  DEFAULT_APPRAISAL_CRITERIA,
} from '../data/appraisalRubric';

interface RubricEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Called after save so the parent can refresh its local copy of criteria */
  onCriteriaSaved: (criteria: AppraisalCriterion[]) => void;
}

function newCriterion(): AppraisalCriterion {
  return {
    id: `crit-${Date.now()}`,
    category: '',
    title: '',
    description: '',
    anchors: {
      1: '',
      2: '',
      3: '',
      4: '',
      5: '',
    },
  };
}

export const RubricEditorModal: React.FC<RubricEditorModalProps> = ({
  isOpen,
  onClose,
  onCriteriaSaved,
}) => {
  const [criteria, setCriteria] = useState<AppraisalCriterion[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [saveFlash, setSaveFlash] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCriteria(loadCriteria());
      setExpandedId(null);
      setShowResetConfirm(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // ── field helpers ──────────────────────────────────────────────────
  const updateField = (
    id: string,
    field: 'category' | 'title' | 'description',
    value: string
  ) => {
    setCriteria((prev) =>
      prev.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    );
  };

  const updateAnchor = (id: string, score: 1 | 2 | 3 | 4 | 5, value: string) => {
    setCriteria((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, anchors: { ...c.anchors, [score]: value } } : c
      )
    );
  };

  // ── reorder ────────────────────────────────────────────────────────
  const moveUp = (idx: number) => {
    if (idx === 0) return;
    setCriteria((prev) => {
      const next = [...prev];
      [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
      return next;
    });
  };

  const moveDown = (idx: number) => {
    setCriteria((prev) => {
      if (idx === prev.length - 1) return prev;
      const next = [...prev];
      [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
      return next;
    });
  };

  // ── add / delete ───────────────────────────────────────────────────
  const addCriterion = () => {
    const c = newCriterion();
    setCriteria((prev) => [...prev, c]);
    setExpandedId(c.id);
  };

  const deleteCriterion = (id: string) => {
    setCriteria((prev) => prev.filter((c) => c.id !== id));
    setExpandedId((curr) => (curr === id ? null : curr));
  };

  // ── save ───────────────────────────────────────────────────────────
  const handleSave = () => {
    saveCriteria(criteria);
    onCriteriaSaved(criteria);
    setSaveFlash(true);
    setTimeout(() => setSaveFlash(false), 2000);
  };

  // ── reset ──────────────────────────────────────────────────────────
  const handleReset = () => {
    resetCriteriaToDefaults();
    const defaults = [...DEFAULT_APPRAISAL_CRITERIA];
    setCriteria(defaults);
    onCriteriaSaved(defaults);
    setShowResetConfirm(false);
  };

  // ── validation ─────────────────────────────────────────────────────
  const isValid = criteria.length > 0 && criteria.every((c) => c.title.trim().length > 0);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <ClipboardList className="w-5 h-5 text-indigo-600" />
            <div>
              <h2 className="text-base font-bold text-slate-900">Edit Appraisal Questions</h2>
              <p className="text-[11px] text-slate-500">
                Add, remove, reorder, or rewrite the criteria used in every appraisal form.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {criteria.map((c, idx) => {
            const isExpanded = expandedId === c.id;
            const hasTitle = c.title.trim().length > 0;
            return (
              <div
                key={c.id}
                className={`border rounded-lg bg-white transition-colors ${
                  isExpanded ? 'border-indigo-300 shadow-sm' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Row header */}
                <div
                  className="flex items-center gap-2 px-4 py-3 cursor-pointer select-none"
                  onClick={() => setExpandedId(isExpanded ? null : c.id)}
                >
                  <GripVertical className="w-4 h-4 text-slate-300 shrink-0" />

                  {/* Reorder buttons */}
                  <div className="flex flex-col gap-0.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => moveUp(idx)}
                      disabled={idx === 0}
                      className="text-slate-400 hover:text-slate-700 disabled:opacity-25"
                    >
                      <ChevronUp className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => moveDown(idx)}
                      disabled={idx === criteria.length - 1}
                      className="text-slate-400 hover:text-slate-700 disabled:opacity-25"
                    >
                      <ChevronDown className="w-3 h-3" />
                    </button>
                  </div>

                  <span className="text-xs font-mono text-slate-400 shrink-0 w-5 text-center">
                    {idx + 1}.
                  </span>

                  <div className="flex-1 min-w-0">
                    <span
                      className={`text-sm font-semibold truncate block ${
                        hasTitle ? 'text-slate-900' : 'text-slate-400 italic'
                      }`}
                    >
                      {hasTitle ? c.title : 'Untitled criterion'}
                    </span>
                    {c.category && (
                      <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                        {c.category}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => deleteCriterion(c.id)}
                      className="text-slate-300 hover:text-rose-500 p-1 rounded transition-colors"
                      title="Delete this criterion"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Expanded edit panel */}
                {isExpanded && (
                  <div className="border-t border-slate-100 px-4 pb-4 pt-3 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          Question / Criterion Title <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={c.title}
                          onChange={(e) => updateField(c.id, 'title', e.target.value)}
                          placeholder="e.g. Job Competence & Execution Quality"
                          className="w-full text-xs text-slate-900 bg-white border border-slate-200 rounded-lg px-3 py-2 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          Category Tag
                        </label>
                        <input
                          type="text"
                          value={c.category}
                          onChange={(e) => updateField(c.id, 'category', e.target.value)}
                          placeholder="e.g. Core Execution"
                          className="w-full text-xs text-slate-900 bg-white border border-slate-200 rounded-lg px-3 py-2 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Description / Guidance for Reviewers
                      </label>
                      <textarea
                        rows={2}
                        value={c.description}
                        onChange={(e) => updateField(c.id, 'description', e.target.value)}
                        placeholder="Briefly explain what this criterion measures..."
                        className="w-full text-xs text-slate-900 bg-white border border-slate-200 rounded-lg px-3 py-2 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>

                    {/* Rating anchors */}
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-2">
                        Rating Anchor Labels (what each score means)
                      </label>
                      <div className="space-y-2">
                        {([1, 2, 3, 4, 5] as const).map((score) => (
                          <div key={score} className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-md bg-slate-100 flex items-center justify-center text-[11px] font-bold text-slate-700 shrink-0">
                              {score}
                            </span>
                            <input
                              type="text"
                              value={c.anchors[score]}
                              onChange={(e) => updateAnchor(c.id, score, e.target.value)}
                              placeholder={`Score ${score} description…`}
                              className="flex-1 text-xs text-slate-900 bg-white border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Add new */}
          <button
            type="button"
            onClick={addCriterion}
            className="w-full border-2 border-dashed border-slate-300 hover:border-indigo-400 hover:bg-indigo-50/40 text-slate-500 hover:text-indigo-700 rounded-lg py-3 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add New Criterion / Question
          </button>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setShowResetConfirm(true)}
            className="text-xs font-medium text-slate-500 hover:text-rose-600 flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset to Defaults
          </button>

          <div className="flex items-center gap-2">
            {saveFlash && (
              <span className="text-xs font-medium text-emerald-600 animate-in fade-in">
                Changes saved!
              </span>
            )}
            {!isValid && (
              <span className="text-[11px] text-amber-600">
                All criteria need a title.
              </span>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded-lg transition-colors"
            >
              Close
            </button>
            <button
              type="button"
              disabled={!isValid}
              onClick={handleSave}
              className={`px-4 py-2 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-sm ${
                isValid
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <Save className="w-3.5 h-3.5" />
              Save Changes
            </button>
          </div>
        </div>

        {/* Reset confirmation overlay */}
        {showResetConfirm && (
          <div className="fixed inset-0 z-60 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 border border-slate-200 animate-in fade-in zoom-in-95">
              <div className="w-10 h-10 rounded-full bg-rose-50 border border-rose-200 text-rose-500 flex items-center justify-center mb-3">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Reset to Default Questions?</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                This will discard all your customisations and restore the original 5 default criteria.
                Any appraisals already submitted will not be affected.
              </p>
              <div className="mt-5 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowResetConfirm(false)}
                  className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm"
                >
                  Yes, Reset
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
