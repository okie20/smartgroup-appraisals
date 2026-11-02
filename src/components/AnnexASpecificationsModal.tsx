import React, { useState, useMemo } from 'react';
import { X, CheckCircle2, AlertCircle, Search, ShieldCheck, FileText, ChevronRight, UserCheck } from 'lucide-react';
import { Person, AllocatedGroup } from '../types';
import { ANNEX_A_RULES, AnnexARule, evaluatePanelCompliance } from '../data/annexASpecifications';

interface AnnexASpecificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  people: Person[];
  groups: AllocatedGroup[];
  peopleMap: Map<string, Person>;
  onSelectGroup?: (groupId: string) => void;
}

export const AnnexASpecificationsModal: React.FC<AnnexASpecificationsModalProps> = ({
  isOpen,
  onClose,
  people,
  groups,
  peopleMap,
  onSelectGroup,
}) => {
  const [search, setSearch] = useState('');
  const [selectedRuleId, setSelectedRuleId] = useState<string>(ANNEX_A_RULES[0]?.id || 'annex-01');

  // Map revieweeId -> group
  const revieweeToGroup = useMemo(() => {
    const map = new Map<string, AllocatedGroup>();
    groups.forEach((g) => map.set(g.revieweeId, g));
    return map;
  }, [groups]);

  // Find people matching each rule
  const ruleToPeopleMap = useMemo(() => {
    const map = new Map<string, Person[]>();
    ANNEX_A_RULES.forEach((rule) => {
      const matched = people.filter((p) => {
        const normRole = p.role.toLowerCase();
        return (
          rule.functionTitle.toLowerCase() === normRole ||
          rule.aliases.some((alias) => normRole.includes(alias) || alias.includes(normRole))
        );
      });
      map.set(rule.id, matched);
    });
    return map;
  }, [people]);

  const filteredRules = useMemo(() => {
    if (!search.trim()) return ANNEX_A_RULES;
    const q = search.toLowerCase();
    return ANNEX_A_RULES.filter(
      (r) =>
        r.functionTitle.toLowerCase().includes(q) ||
        r.department.toLowerCase().includes(q) ||
        r.originalAppraisersText.toLowerCase().includes(q)
    );
  }, [search]);

  const selectedRule = useMemo(() => {
    return ANNEX_A_RULES.find((r) => r.id === selectedRuleId) || ANNEX_A_RULES[0];
  }, [selectedRuleId]);

  const matchedPeopleForSelectedRule = useMemo(() => {
    return ruleToPeopleMap.get(selectedRule.id) || [];
  }, [ruleToPeopleMap, selectedRule.id]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] flex flex-col border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                Annex A: Prescribed Appraisal Panel Specifications
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-indigo-600/60 text-indigo-100 border border-indigo-400/30">
                  18 Key Functions
                </span>
              </h2>
              <p className="text-xs text-slate-300">
                Statutory composition rules for review panels: 7 designated appraisers per role
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Overview Banner */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search specified functions (e.g. IT Coordinator, Facility Supervisor, Driver)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-800 rounded-md border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              18 Standardized Rules
            </span>
            <span className="text-slate-400">·</span>
            <span className="text-slate-500">7 Appraisers per function</span>
          </div>
        </div>

        {/* Modal Body: Master-Detail Layout */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[460px]">
          {/* Left Column: 18 Roles List */}
          <div className="md:col-span-5 border-r border-slate-200 overflow-y-auto max-h-[calc(90vh-140px)] p-3 space-y-1 bg-slate-50/50">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-3 py-1">
              Designated Posts ({filteredRules.length})
            </div>
            {filteredRules.map((rule) => {
              const count = ruleToPeopleMap.get(rule.id)?.length || 0;
              const isSelected = rule.id === selectedRule.id;

              return (
                <button
                  key={rule.id}
                  onClick={() => setSelectedRuleId(rule.id)}
                  className={`w-full text-left p-3 rounded-xl transition-all border flex items-start justify-between gap-2 ${
                    isSelected
                      ? 'bg-white border-indigo-600 shadow-xs ring-1 ring-indigo-500/10'
                      : 'bg-white/80 hover:bg-white border-slate-200/80 text-slate-700'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold flex items-center justify-center shrink-0">
                        {rule.orderNumber}
                      </span>
                      <span
                        className={`text-xs font-bold truncate ${
                          isSelected ? 'text-indigo-950' : 'text-slate-900'
                        }`}
                      >
                        {rule.functionTitle}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 ml-7 truncate mt-0.5">
                      {rule.department}
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        count > 0
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {count} in roster
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right Column: Specification Details & Live Compliance */}
          <div className="md:col-span-7 overflow-y-auto max-h-[calc(90vh-140px)] p-6 space-y-6">
            {/* Header of selected function */}
            <div className="border-b border-slate-200 pb-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md text-[11px] font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                      Rule #{selectedRule.orderNumber}
                    </span>
                    <span className="text-xs font-medium text-slate-500">
                      {selectedRule.department}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mt-1">
                    {selectedRule.functionTitle}
                  </h3>
                </div>
              </div>

              {/* Verbatim quote from Annex A document */}
              <div className="mt-3 p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2.5">
                <FileText className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-amber-950 text-[11px] uppercase tracking-wider mb-0.5">
                    Annex A Mandated Composition (7 Appraisers):
                  </div>
                  <div className="font-medium text-amber-900">
                    "{selectedRule.originalAppraisersText}"
                  </div>
                </div>
              </div>
            </div>

            {/* Prescribed 7-Slot Blueprint */}
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                Prescribed 7-Appraiser Composition Breakdown
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {selectedRule.requirements.map((req, i) => (
                  <div
                    key={req.id}
                    className="p-3 rounded-lg border border-slate-200 bg-slate-50/60 flex items-start gap-2.5"
                  >
                    <span className="w-6 h-6 rounded-md bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center shrink-0">
                      {i + 1}
                    </span>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                        {req.label}
                        <span className="text-[10px] text-indigo-600 bg-indigo-50 px-1.5 py-0.2 rounded font-mono">
                          {req.targetCount} {req.targetCount > 1 ? 'slots' : 'slot'}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {req.roleOrDeptDescription}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Current Active Employees in Roster with this Function */}
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center justify-between">
                <span>Active Roster Review Panels ({matchedPeopleForSelectedRule.length})</span>
                <span className="text-[11px] font-normal text-slate-500 lowercase">
                  live allocation status
                </span>
              </h4>

              {matchedPeopleForSelectedRule.length === 0 ? (
                <div className="p-4 rounded-xl border border-dashed border-slate-300 text-center text-xs text-slate-500">
                  No employee in the current roster currently holds this exact role. You can assign someone to{' '}
                  <strong>{selectedRule.functionTitle}</strong> in the Roster view or import from Excel/Word.
                </div>
              ) : (
                <div className="space-y-3">
                  {matchedPeopleForSelectedRule.map((person) => {
                    const group = revieweeToGroup.get(person.id);
                    const panelMembers = group
                      ? (group.memberIds.map((id) => peopleMap.get(id)).filter(Boolean) as Person[])
                      : [];

                    const compliance = evaluatePanelCompliance(person, panelMembers, selectedRule);

                    return (
                      <div
                        key={person.id}
                        className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs hover:border-slate-300 transition-all"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-900">{person.name}</span>
                              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                                {person.id}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-500 mt-0.5">
                              {person.role} · {person.department}
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <div
                              className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 ${
                                compliance.complianceRate >= 85
                                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                  : 'bg-amber-50 text-amber-800 border border-amber-200'
                              }`}
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>
                                Annex A Match: {compliance.matchedCount}/7 ({compliance.complianceRate}%)
                              </span>
                            </div>

                            {group && onSelectGroup && (
                              <button
                                onClick={() => {
                                  onSelectGroup(group.id);
                                  onClose();
                                }}
                                className="text-xs font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                              >
                                View Panel
                                <ChevronRight className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Slots fulfillment breakdown */}
                        <div className="mt-3 space-y-1.5">
                          <div className="text-[11px] font-semibold text-slate-600 mb-1">
                            Appraiser Slot Assignments:
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {compliance.slots.map((slot) => (
                              <div
                                key={slot.requirementId}
                                className={`p-2 rounded-lg text-xs border flex items-start justify-between gap-2 ${
                                  slot.isFulfilled
                                    ? 'bg-emerald-50/40 border-emerald-200 text-slate-800'
                                    : slot.assignedMembers.length > 0
                                    ? 'bg-amber-50/40 border-amber-200 text-slate-800'
                                    : 'bg-slate-50 border-slate-200 text-slate-500'
                                }`}
                              >
                                <div className="min-w-0">
                                  <div className="font-medium text-[11px] flex items-center gap-1">
                                    <span>{slot.label}</span>
                                    <span className="text-[10px] text-slate-500">
                                      ({slot.assignedMembers.length}/{slot.targetCount})
                                    </span>
                                  </div>
                                  <div className="text-[10px] text-slate-600 mt-0.5 truncate">
                                    {slot.assignedMembers.length > 0
                                      ? slot.assignedMembers.map((m) => m.name).join(', ')
                                      : 'Auto-filled with department peer'}
                                  </div>
                                </div>
                                {slot.isFulfilled ? (
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                                ) : (
                                  <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div>
            Referenced from <strong>Annex A</strong> (Official Company Appraisal Composition Mandate).
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors"
          >
            Close Specifications
          </button>
        </div>
      </div>
    </div>
  );
};
