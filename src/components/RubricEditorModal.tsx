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
  ShieldCheck,
} from 'lucide-react';
import { PerformanceRatingItem } from '../types';
import {
  loadPerformanceRatings,
  savePerformanceRatings,
  resetPerformanceRatings,
  DEFAULT_PERFORMANCE_RATINGS,
  loadSupervisorRatings,
  saveSupervisorRatings,
  resetSupervisorRatings,
  DEFAULT_SUPERVISOR_RATINGS,
} from '../data/performanceRatings';

interface RubricEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

function newItem(supervisorOnly = false): PerformanceRatingItem {
  return {
    id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    title: '',
    description: '',
    lowLabel: '',
    highLabel: '',
    supervisorOnly,
  };
}

// ── Shared editable list component ───────────────────────────────────────────

interface ItemListProps {
  items: PerformanceRatingItem[];
  disabled: boolean;
  onChange: (items: PerformanceRatingItem[]) => void;
  isSupervisorList?: boolean;
}

const ItemList: React.FC<ItemListProps> = ({ items, disabled, onChange, isSupervisorList }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const updateField = (id: string, field: keyof PerformanceRatingItem, value: string | boolean) => {
    onChange(items.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
  };

  const moveUp = (idx: number) => {
    if (idx === 0) return;
    const next = [...items];
    [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
    onChange(next);
  };

  const moveDown = (idx: number) => {
    if (idx === items.length - 1) return;
    const next = [...items];
    [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
    onChange(next);
  };

  const deleteItem = (id: string) => {
    onChange(items.filter((item) => item.id !== id));
    setExpandedId((curr) => (curr === id ? null : curr));
  };

  const addItem = () => {
    const item = newItem(isSupervisorList);
    onChange([...items, item]);
    setExpandedId(item.id);
  };

  return (
    <div className="space-y-2">
      {items.map((item, idx) => {
        const isExpanded = expandedId === item.id;
        const hasTitle = item.title.trim().length > 0;

        return (
          <div
            key={item.id}
            className={`border rounded-xl bg-white transition-colors ${
              isExpanded ? 'border-indigo-300 shadow-sm' : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            {/* Row header */}
            <div
              className="flex items-center gap-2 px-4 py-3 cursor-pointer select-none"
              onClick={() => setExpandedId(isExpanded ? null : item.id)}
            >
              <GripVertical className="w-4 h-4 text-slate-300 shrink-0" />

              <div className="flex flex-col gap-0.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => moveUp(idx)}
                  disabled={idx === 0 || disabled}
                  className="text-slate-400 hover:text-slate-700 disabled:opacity-25"
                >
                  <ChevronUp className="w-3 h-3" />
                </button>
                <button
                  onClick={() => moveDown(idx)}
                  disabled={idx === items.length - 1 || disabled}
                  className="text-slate-400 hover:text-slate-700 disabled:opacity-25"
                >
                  <ChevronDown className="w-3 h-3" />
                </button>
              </div>

              <span className="text-xs font-mono text-slate-400 shrink-0 w-5 text-center">
                {isSupervisorList ? `S${idx + 1}.` : `${idx + 1}.`}
              </span>

              <div className="flex-1 min-w-0">
                <span className={`text-sm font-semibold truncate block ${hasTitle ? 'text-slate-900' : 'text-slate-400 italic'}`}>
                  {hasTitle ? item.title : 'Untitled question'}
                </span>
                {item.description && (
                  <span className="text-[10px] text-slate-400 truncate block">{item.description}</span>
                )}
              </div>

              <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => deleteItem(item.id)}
                  disabled={disabled}
                  className="text-slate-300 hover:text-rose-500 disabled:opacity-30 p-1 rounded transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Expanded fields */}
            {isExpanded && (
              <div className="border-t border-slate-100 px-4 pb-4 pt-3 space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Question Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={item.title}
                    disabled={disabled}
                    onChange={(e) => updateField(item.id, 'title', e.target.value)}
                    placeholder="e.g. Time Keeping (Punctuality)"
                    className="w-full text-xs text-slate-900 bg-white border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-50"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Description / Guidance
                  </label>
                  <textarea
                    rows={2}
                    value={item.description}
                    disabled={disabled}
                    onChange={(e) => updateField(item.id, 'description', e.target.value)}
                    placeholder="e.g. Does he/she report for work and meetings on time?"
                    className="w-full text-xs text-slate-900 bg-white border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-50 resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Score 1 Label (low end)
                    </label>
                    <input
                      type="text"
                      value={item.lowLabel}
                      disabled={disabled}
                      onChange={(e) => updateField(item.id, 'lowLabel', e.target.value)}
                      placeholder="e.g. Always late"
                      className="w-full text-xs text-slate-900 bg-white border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-50"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Score 10 Label (high end)
                    </label>
                    <input
                      type="text"
                      value={item.highLabel}
                      disabled={disabled}
                      onChange={(e) => updateField(item.id, 'highLabel', e.target.value)}
                      placeholder="e.g. Always on time"
                      className="w-full text-xs text-slate-900 bg-white border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-50"
                    />
                  </div>
                </div>

                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={!!item.commentRequired}
                    disabled={disabled}
                    onChange={(e) => updateField(item.id, 'commentRequired', e.target.checked)}
                    className="rounded accent-indigo-600"
                  />
                  <span className="text-[11px] text-slate-700 font-medium">Make comment field required</span>
                </label>
              </div>
            )}
          </div>
        );
      })}

      {/* Add button */}
      <button
        type="button"
        disabled={disabled}
        onClick={addItem}
        className="w-full border-2 border-dashed border-slate-300 hover:border-indigo-400 hover:bg-indigo-50/40 disabled:opacity-40 text-slate-500 hover:text-indigo-700 rounded-xl py-3 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
      >
        <Plus className="w-4 h-4" />
        Add Question
      </button>
    </div>
  );
};

// ── Main modal ────────────────────────────────────────────────────────────────

export const RubricEditorModal: React.FC<RubricEditorModalProps> = ({
  isOpen,
  onClose,
  onSaved,
}) => {
  const [activeTab, setActiveTab] = useState<'standard' | 'supervisor'>('standard');
  const [perfItems, setPerfItems] = useState<PerformanceRatingItem[]>([]);
  const [supItems, setSupItems] = useState<PerformanceRatingItem[]>([]);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [saveFlash, setSaveFlash] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setPerfItems(loadPerformanceRatings());
      setSupItems(loadSupervisorRatings());
      setShowResetConfirm(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentItems = activeTab === 'standard' ? perfItems : supItems;
  const isValid = currentItems.every((item) => item.title.trim().length > 0);

  const handleSave = () => {
    savePerformanceRatings(perfItems);
    saveSupervisorRatings(supItems);
    onSaved();
    setSaveFlash(true);
    setTimeout(() => setSaveFlash(false), 2000);
  };

  const handleReset = () => {
    resetPerformanceRatings();
    resetSupervisorRatings();
    setPerfItems([...DEFAULT_PERFORMANCE_RATINGS]);
    setSupItems([...DEFAULT_SUPERVISOR_RATINGS]);
    onSaved();
    setShowResetConfirm(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-2.5">
            <ClipboardList className="w-5 h-5 text-indigo-600" />
            <div>
              <h2 className="text-base font-black text-slate-900">Edit Appraisal Questions</h2>
              <p className="text-[11px] text-slate-500">
                Customise the 1–10 rating questions shown in every appraisal form.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/60 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-slate-200 bg-slate-50 flex px-6 gap-6 shrink-0">
          <button
            onClick={() => setActiveTab('standard')}
            className={`pb-3 pt-2 text-xs font-bold transition-colors flex items-center gap-1.5 ${
              activeTab === 'standard'
                ? 'text-indigo-700 border-b-2 border-indigo-600'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <ClipboardList className="w-3.5 h-3.5" />
            Standard Questions ({perfItems.length})
          </button>
          <button
            onClick={() => setActiveTab('supervisor')}
            className={`pb-3 pt-2 text-xs font-bold transition-colors flex items-center gap-1.5 ${
              activeTab === 'supervisor'
                ? 'text-indigo-700 border-b-2 border-indigo-600'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Supervisor-Only Questions ({supItems.length})
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5">
          {activeTab === 'standard' ? (
            <div>
              <p className="text-[11px] text-slate-500 mb-4">
                These questions appear for <strong>all employees</strong> regardless of their role.
              </p>
              <ItemList items={perfItems} disabled={false} onChange={setPerfItems} />
            </div>
          ) : (
            <div>
              <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3 mb-4 text-[11px] text-indigo-800">
                <strong>Supervisor-only questions</strong> are automatically shown when the employee being evaluated holds a supervisor, manager, lead, coordinator, head, controller or director role.
              </div>
              <ItemList items={supItems} disabled={false} onChange={setSupItems} isSupervisorList />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setShowResetConfirm(true)}
            className="text-xs font-medium text-slate-500 hover:text-rose-600 flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset All to Defaults
          </button>

          <div className="flex items-center gap-2">
            {saveFlash && (
              <span className="text-xs font-medium text-emerald-600">Changes saved!</span>
            )}
            {!isValid && (
              <span className="text-[11px] text-amber-600">All questions need a title.</span>
            )}
            <button type="button" onClick={onClose} className="px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-200/60 rounded-lg">
              Close
            </button>
            <button
              type="button"
              disabled={!isValid}
              onClick={handleSave}
              className={`px-4 py-2 text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-sm ${
                isValid
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <Save className="w-3.5 h-3.5" />Save Changes
            </button>
          </div>
        </div>

        {/* Reset confirm */}
        {showResetConfirm && (
          <div className="fixed inset-0 z-60 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 border border-slate-200">
              <div className="w-10 h-10 rounded-full bg-rose-50 border border-rose-200 text-rose-500 flex items-center justify-center mb-3">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-base font-black text-slate-900">Reset All Questions?</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                This restores both standard and supervisor-only questions to the original defaults. Already submitted appraisals are not affected.
              </p>
              <div className="mt-5 flex items-center justify-end gap-2">
                <button type="button" onClick={() => setShowResetConfirm(false)} className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg">
                  Cancel
                </button>
                <button type="button" onClick={handleReset} className="px-4 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg">
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
