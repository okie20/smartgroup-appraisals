import React, { useState } from 'react';
import { DepartmentCluster, Person, GroupingConfig } from '../types';
import {
  Network,
  Plus,
  Trash2,
  Sliders,
  ArrowRight,
  Edit2,
  Check,
  X,
  Building,
  Sparkles,
  ClipboardList,
  AlertTriangle,
} from 'lucide-react';

interface DepartmentClustersViewProps {
  clusters: DepartmentCluster[];
  onUpdateClusters: (clusters: DepartmentCluster[]) => void;
  people: Person[];
  config: GroupingConfig;
  onUpdateConfig: (config: GroupingConfig) => void;
  onRegroup: () => void;
  onRenameDepartment: (oldName: string, newName: string) => void;
  onDeleteDepartment: (deptName: string, reassignToDept?: string) => void;
  onRenameCluster: (clusterId: string, newName: string) => void;
}

export const DepartmentClustersView: React.FC<DepartmentClustersViewProps> = ({
  clusters,
  onUpdateClusters,
  people,
  config,
  onUpdateConfig,
  onRegroup,
  onRenameDepartment,
  onDeleteDepartment,
  onRenameCluster,
}) => {
  const [newClusterName, setNewClusterName] = useState('');
  const [newDeptName, setNewDeptName] = useState('');
  const [selectedClusterForDept, setSelectedClusterForDept] = useState(clusters[0]?.id || '');

  // Editing state for departments
  const [editingDeptName, setEditingDeptName] = useState<string | null>(null);
  const [deptDraftName, setDeptDraftName] = useState('');

  // Editing state for clusters
  const [editingClusterId, setEditingClusterId] = useState<string | null>(null);
  const [clusterDraftName, setClusterDraftName] = useState('');

  // Delete department confirmation modal
  const [deletingDept, setDeletingDept] = useState<string | null>(null);
  const [reassignTargetDept, setReassignTargetDept] = useState<string>('');

  // Bulk department modal
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkText, setBulkText] = useState('');

  // Calculate headcount per department
  const headcountByDept: Record<string, number> = {};
  people.forEach((p) => {
    headcountByDept[p.department] = (headcountByDept[p.department] || 0) + 1;
  });

  const allDepts = Array.from(new Set(clusters.flatMap((c) => c.departments))).sort();

  const handleStartEditDept = (dept: string) => {
    setEditingDeptName(dept);
    setDeptDraftName(dept);
  };

  const handleSaveDeptName = (oldName: string) => {
    if (!deptDraftName.trim() || deptDraftName.trim() === oldName) {
      setEditingDeptName(null);
      return;
    }
    onRenameDepartment(oldName, deptDraftName.trim());
    setEditingDeptName(null);
  };

  const handleStartEditCluster = (cluster: DepartmentCluster) => {
    setEditingClusterId(cluster.id);
    setClusterDraftName(cluster.name);
  };

  const handleSaveClusterName = (clusterId: string) => {
    if (!clusterDraftName.trim()) {
      setEditingClusterId(null);
      return;
    }
    onRenameCluster(clusterId, clusterDraftName.trim());
    setEditingClusterId(null);
  };

  const handleAddCluster = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClusterName.trim()) return;
    const newCluster: DepartmentCluster = {
      id: `cluster-${Date.now()}`,
      name: newClusterName.trim(),
      color: 'slate',
      departments: [],
    };
    onUpdateClusters([...clusters, newCluster]);
    setNewClusterName('');
  };

  const handleRemoveCluster = (clusterId: string) => {
    onUpdateClusters(clusters.filter((c) => c.id !== clusterId));
  };

  const handleAddDept = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeptName.trim() || !selectedClusterForDept) return;
    const updated = clusters.map((c) => {
      if (c.id === selectedClusterForDept && !c.departments.includes(newDeptName.trim())) {
        return { ...c, departments: [...c.departments, newDeptName.trim()] };
      }
      return c;
    });
    onUpdateClusters(updated);
    setNewDeptName('');
  };

  const handleMoveDept = (deptName: string, targetClusterId: string) => {
    const updated = clusters.map((c) => {
      const filtered = c.departments.filter((d) => d !== deptName);
      if (c.id === targetClusterId) {
        return { ...c, departments: [...filtered, deptName] };
      }
      return { ...c, departments: filtered };
    });
    onUpdateClusters(updated);
  };

  const handleConfirmDeleteDept = () => {
    if (!deletingDept) return;
    onDeleteDepartment(deletingDept, reassignTargetDept || undefined);
    setDeletingDept(null);
  };

  // Bulk apply pasted departments
  const handleApplyBulkDepartments = () => {
    const lines = bulkText
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    if (lines.length === 0) return;

    // Create a new cluster or place into clusters
    const newCluster: DepartmentCluster = {
      id: `cluster-${Date.now()}`,
      name: 'Company Departments',
      color: 'indigo',
      departments: lines,
    };

    onUpdateClusters([...clusters, newCluster]);
    setShowBulkModal(false);
    setBulkText('');
  };

  // Pre-configured industry templates
  const applyIndustryPreset = (presetName: string) => {
    let presetClusters: DepartmentCluster[] = [];

    if (presetName === 'tech') {
      presetClusters = [
        {
          id: 'c-tech',
          name: 'Engineering & Product',
          color: 'indigo',
          departments: ['Software Engineering', 'Quality Assurance & DevOps', 'Product Management', 'Product Design'],
        },
        {
          id: 'c-gtm',
          name: 'Commercial & Growth',
          color: 'emerald',
          departments: ['Marketing & Brand', 'Sales & Accounts', 'Customer Success & Support'],
        },
        {
          id: 'c-corp',
          name: 'Operations & Corporate',
          color: 'amber',
          departments: ['Human Resources & People', 'Finance & Accounting', 'Legal & Compliance'],
        },
      ];
    } else if (presetName === 'corporate') {
      presetClusters = [
        {
          id: 'c-front',
          name: 'Client Services & Sales',
          color: 'indigo',
          departments: ['Business Development', 'Client Relations', 'Marketing & Communications'],
        },
        {
          id: 'c-ops',
          name: 'Operations & Delivery',
          color: 'emerald',
          departments: ['Operations Management', 'Information Technology', 'Supply & Procurement'],
        },
        {
          id: 'c-admin',
          name: 'Administration & Finance',
          color: 'amber',
          departments: ['Accounting & Finance', 'Human Resources', 'Administration'],
        },
      ];
    } else if (presetName === 'healthcare') {
      presetClusters = [
        {
          id: 'c-clinical',
          name: 'Clinical & Patient Care',
          color: 'indigo',
          departments: ['Medical Staff & Physicians', 'Nursing & Inpatient Care', 'Emergency Care'],
        },
        {
          id: 'c-diagnostic',
          name: 'Diagnostics & Pharmacy',
          color: 'emerald',
          departments: ['Pharmacy Services', 'Laboratory & Pathology', 'Radiology & Imaging'],
        },
        {
          id: 'c-admin',
          name: 'Hospital Administration',
          color: 'amber',
          departments: ['Hospital Administration', 'Patient Admissions & Records', 'Facility Operations'],
        },
      ];
    }

    if (presetClusters.length > 0) {
      onUpdateClusters(presetClusters);
      setShowBulkModal(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Header & Fast Setup Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-slate-900">
            Company Departments & Affinity Clusters
          </h2>
          <p className="text-xs text-slate-500">
            Edit, rename, or add departments so they match your exact company structure. Renaming a department automatically updates all employees in that department across the system.
          </p>
        </div>

        <button
          onClick={() => setShowBulkModal(true)}
          className="px-3.5 py-2 text-xs font-semibold text-slate-800 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg shadow-2xs flex items-center gap-2 shrink-0 transition-colors"
        >
          <ClipboardList className="w-4 h-4 text-slate-600" />
          <span>Quick Setup Company Departments</span>
        </button>
      </div>

      {/* Balancing Settings Card */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs space-y-4">
        <h3 className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
          <Sliders className="w-3.5 h-3.5 text-slate-600" />
          <span>Algorithm Balancing Parameters</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          {/* Target Group Size */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="font-medium text-slate-700">Target Group Size</span>
              <span className="font-mono font-bold text-slate-900">{config.targetGroupSize} people</span>
            </div>
            <input
              type="range"
              min="5"
              max="10"
              step="1"
              value={config.targetGroupSize}
              onChange={(e) =>
                onUpdateConfig({ ...config, targetGroupSize: parseInt(e.target.value) })
              }
              className="w-full accent-slate-900 cursor-pointer"
            />
            <span className="text-[11px] text-slate-400 block mt-1">
              Allocates {config.targetGroupSize - 1}–{config.targetGroupSize + 1} peers per appraisal panel
            </span>
          </div>

          {/* Same Dept Preference Weight */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="font-medium text-slate-700">Same Department Preference</span>
              <span className="font-mono font-bold text-slate-900">{config.sameDeptWeight}%</span>
            </div>
            <input
              type="range"
              min="30"
              max="95"
              step="5"
              value={config.sameDeptWeight}
              onChange={(e) =>
                onUpdateConfig({ ...config, sameDeptWeight: parseInt(e.target.value) })
              }
              className="w-full accent-slate-900 cursor-pointer"
            />
            <span className="text-[11px] text-slate-400 block mt-1">
              Higher = priority to peers in exact same department before adjacent depts
            </span>
          </div>

          {/* Apply button */}
          <div className="flex items-end">
            <button
              onClick={onRegroup}
              className="w-full px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-md transition-colors flex items-center justify-center gap-2"
            >
              <span>Recalculate Allocations</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Department Clusters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {clusters.map((cluster) => {
          const totalPeopleInCluster = cluster.departments.reduce(
            (sum, dept) => sum + (headcountByDept[dept] || 0),
            0
          );

          const isEditingCluster = editingClusterId === cluster.id;

          return (
            <div
              key={cluster.id}
              className="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs flex flex-col justify-between"
            >
              <div>
                {/* Cluster Header with Rename & Delete */}
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 pr-2">
                    {isEditingCluster ? (
                      <div className="flex items-center gap-1.5 mb-1">
                        <input
                          type="text"
                          value={clusterDraftName}
                          onChange={(e) => setClusterDraftName(e.target.value)}
                          className="px-2 py-1 text-xs border border-slate-300 rounded font-semibold w-full focus:outline-none focus:ring-1 focus:ring-slate-900"
                          autoFocus
                        />
                        <button
                          onClick={() => handleSaveClusterName(cluster.id)}
                          className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                          title="Save cluster name"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setEditingClusterId(null)}
                          className="p-1 text-slate-400 hover:bg-slate-100 rounded"
                          title="Cancel"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 group">
                        <h4 className="font-semibold text-sm text-slate-900">
                          {cluster.name}
                        </h4>
                        <button
                          onClick={() => handleStartEditCluster(cluster)}
                          className="p-1 text-slate-400 hover:text-slate-700 opacity-60 hover:opacity-100 transition-opacity"
                          title="Rename this cluster"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}

                    <span className="text-xs text-slate-400 font-mono tabular-nums">
                      {totalPeopleInCluster} employees · {cluster.departments.length} departments
                    </span>
                  </div>

                  {clusters.length > 1 && (
                    <button
                      onClick={() => handleRemoveCluster(cluster.id)}
                      className="text-slate-400 hover:text-red-600 p-1"
                      title="Delete Cluster"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Departments inside this cluster */}
                <div className="space-y-2 mt-4">
                  {cluster.departments.map((dept) => {
                    const count = headcountByDept[dept] || 0;
                    const isEditingThisDept = editingDeptName === dept;

                    return (
                      <div
                        key={dept}
                        className="p-2.5 bg-slate-50 border border-slate-200/80 rounded text-xs flex flex-col gap-2"
                      >
                        {isEditingThisDept ? (
                          <div className="flex items-center gap-1.5">
                            <input
                              type="text"
                              value={deptDraftName}
                              onChange={(e) => setDeptDraftName(e.target.value)}
                              className="px-2 py-1 text-xs border border-slate-300 rounded font-medium flex-1 focus:outline-none focus:ring-1 focus:ring-slate-900 bg-white"
                              autoFocus
                            />
                            <button
                              onClick={() => handleSaveDeptName(dept)}
                              className="px-2 py-1 text-[11px] font-semibold text-white bg-slate-900 rounded hover:bg-slate-800"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingDeptName(null)}
                              className="px-2 py-1 text-[11px] text-slate-600 hover:bg-slate-200 rounded"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between">
                            <div className="min-w-0 flex-1 pr-2">
                              <div className="flex items-center gap-1.5">
                                <span className="font-semibold text-slate-800 truncate">
                                  {dept}
                                </span>
                                <button
                                  onClick={() => handleStartEditDept(dept)}
                                  className="text-slate-400 hover:text-slate-800 p-0.5"
                                  title="Rename department (updates all employees)"
                                >
                                  <Edit2 className="w-3 h-3" />
                                </button>
                              </div>
                              <span className="text-[11px] font-mono text-slate-400 tabular-nums">
                                {count} employee{count === 1 ? '' : 's'} assigned
                              </span>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              {/* Move dropdown */}
                              {clusters.length > 1 && (
                                <select
                                  value={cluster.id}
                                  onChange={(e) => handleMoveDept(dept, e.target.value)}
                                  className="text-[11px] bg-white border border-slate-200 rounded px-1.5 py-0.5 text-slate-600 focus:outline-none"
                                  title="Move to another cluster"
                                >
                                  {clusters.map((c) => (
                                    <option key={c.id} value={c.id}>
                                      {c.name.split('&')[0].trim()}
                                    </option>
                                  ))}
                                </select>
                              )}

                              {/* Delete button */}
                              <button
                                onClick={() => {
                                  setDeletingDept(dept);
                                  const fallback = allDepts.find((d) => d !== dept) || '';
                                  setReassignTargetDept(fallback);
                                }}
                                className="text-slate-400 hover:text-red-600 p-1"
                                title="Delete department"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {cluster.departments.length === 0 && (
                    <div className="text-center py-4 text-xs text-slate-400 border border-dashed border-slate-200 rounded">
                      No departments in this cluster yet
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add New Cluster or Department Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-100/60 p-5 rounded-lg border border-slate-200">
        {/* Add Department */}
        <form onSubmit={handleAddDept} className="space-y-2">
          <span className="text-xs font-semibold text-slate-800 block">
            Add Department to Company
          </span>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. IT & Systems, Clinical Care, Warehouse..."
              value={newDeptName}
              onChange={(e) => setNewDeptName(e.target.value)}
              className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
            <select
              value={selectedClusterForDept}
              onChange={(e) => setSelectedClusterForDept(e.target.value)}
              className="px-2 py-1.5 text-xs bg-white border border-slate-200 rounded text-slate-700"
            >
              {clusters.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded transition-colors whitespace-nowrap shadow-2xs"
            >
              Add Department
            </button>
          </div>
        </form>

        {/* Add Cluster */}
        <form onSubmit={handleAddCluster} className="space-y-2">
          <span className="text-xs font-semibold text-slate-800 block">
            Add New Affinity Cluster (Group of Close Departments)
          </span>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. Medical Services, GTM, Supply Chain..."
              value={newClusterName}
              onChange={(e) => setNewClusterName(e.target.value)}
              className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
            <button
              type="submit"
              className="px-3 py-1.5 text-xs font-medium text-slate-800 bg-white border border-slate-200 hover:bg-slate-50 rounded transition-colors whitespace-nowrap"
            >
              Add Cluster
            </button>
          </div>
        </form>
      </div>

      {/* Delete Department Modal */}
      {deletingDept && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-md w-full p-6 border border-slate-200 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto my-auto">
            <div className="flex items-center gap-2 text-amber-600">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <h3 className="text-sm font-semibold text-slate-900">
                Delete Department &quot;{deletingDept}&quot;?
              </h3>
            </div>

            <p className="text-xs text-slate-600">
              There are{' '}
              <strong className="text-slate-900 font-mono">
                {headcountByDept[deletingDept] || 0} employees
              </strong>{' '}
              currently in this department. Choose where to reassign them:
            </p>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Reassign these employees to:
              </label>
              <select
                value={reassignTargetDept}
                onChange={(e) => setReassignTargetDept(e.target.value)}
                className="w-full p-2 text-xs border border-slate-200 rounded bg-white"
              >
                {allDepts
                  .filter((d) => d !== deletingDept)
                  .map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
              </select>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
              <button
                onClick={() => setDeletingDept(null)}
                className="px-3.5 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 rounded hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDeleteDept}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded shadow-xs"
              >
                Reassign & Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Company Department Setup Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-xl w-full border border-slate-200 shadow-2xl flex flex-col max-h-[90vh] my-auto overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 p-5 shrink-0 bg-white">
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-slate-700" />
                <h3 className="text-sm font-bold text-slate-900">
                  Quick Setup Company Departments
                </h3>
              </div>
              <button
                onClick={() => setShowBulkModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <div className="p-5 sm:p-6 space-y-5 overflow-y-auto flex-1 overscroll-contain">
              {/* Quick Industry Presets */}
              <div>
                <span className="text-xs font-semibold text-slate-700 block mb-2">
                  Option 1: Choose a Common Company Structure
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    onClick={() => applyIndustryPreset('tech')}
                    className="p-2.5 text-left border border-slate-200 hover:border-slate-400 hover:bg-slate-50 rounded text-xs transition-colors"
                  >
                    <div className="font-semibold text-slate-900">Technology</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Eng, Product, Sales, CS, HR, Finance</div>
                  </button>
                  <button
                    onClick={() => applyIndustryPreset('corporate')}
                    className="p-2.5 text-left border border-slate-200 hover:border-slate-400 hover:bg-slate-50 rounded text-xs transition-colors"
                  >
                    <div className="font-semibold text-slate-900">Corporate & B2B</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Sales, Ops, IT, Admin, HR, Finance</div>
                  </button>
                  <button
                    onClick={() => applyIndustryPreset('healthcare')}
                    className="p-2.5 text-left border border-slate-200 hover:border-slate-400 hover:bg-slate-50 rounded text-xs transition-colors"
                  >
                    <div className="font-semibold text-slate-900">Healthcare</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Clinical, Pharmacy, Radiology, Admin</div>
                  </button>
                </div>
              </div>

              {/* Paste Custom List */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <span className="text-xs font-semibold text-slate-700 block">
                  Option 2: Paste Your Company&apos;s Exact Departments (1 per line)
                </span>
                <textarea
                  rows={5}
                  value={bulkText}
                  onChange={(e) => setBulkText(e.target.value)}
                  placeholder={"Operations\nFinance & Accounting\nHuman Resources\nLogistics & Supply\nCustomer Support"}
                  className="w-full p-2.5 text-xs font-mono border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>
            </div>

            {/* Pinned Footer */}
            <div className="p-4 border-t border-slate-100 flex justify-end gap-2 shrink-0 bg-slate-50/70">
              <button
                onClick={() => setShowBulkModal(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 bg-slate-100 rounded hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                disabled={!bulkText.trim()}
                onClick={handleApplyBulkDepartments}
                className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded hover:bg-slate-800 disabled:opacity-40"
              >
                Add These Departments
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
