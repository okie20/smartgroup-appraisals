import React, { useState, useMemo } from 'react';
import { Person, DepartmentCluster, FacilityLocation, ALL_FACILITIES, isPersonSupervisor, getPersonFacility } from '../types';
import { parseRosterText } from '../utils/exportUtils';
import { allocateEmployeeIds } from '../utils/employeeIds';
import { DEFAULT_ROSTER, generateSyntheticRoster } from '../data/defaultRoster';
import {
  Plus,
  Upload,
  Trash2,
  Edit2,
  RotateCcw,
  Download,
  Check,
  Sparkles,
  X,
  FileSpreadsheet,
  Building,
  MapPin,
  Shield,
  UserCheck,
  Search,
  Filter,
} from 'lucide-react';
import { ConfirmModal } from './ConfirmModal';

interface RosterViewProps {
  people: Person[];
  onUpdatePeople: (people: Person[]) => void;
  clusters: DepartmentCluster[];
  onUpdateClusters?: (clusters: DepartmentCluster[]) => void;
  onExportRosterCsv: () => void;
  onOpenExcelWordImport: () => void;
  onClearAllData?: () => void;
  onRestoreSampleData?: () => void;
}

export const RosterView: React.FC<RosterViewProps> = ({
  people,
  onUpdatePeople,
  clusters,
  onUpdateClusters,
  onExportRosterCsv,
  onOpenExcelWordImport,
  onClearAllData,
  onRestoreSampleData,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('ALL');
  const [selectedFacilityFilter, setSelectedFacilityFilter] = useState<string>('ALL');
  const [supervisorFilter, setSupervisorFilter] = useState<'ALL' | 'SUPERVISOR' | 'NON_SUPERVISOR'>('ALL');

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeptFormulatorModal, setShowDeptFormulatorModal] = useState(false);
  const [editingPerson, setEditingPerson] = useState<Person | null>(null);
  const [personToDelete, setPersonToDelete] = useState<Person | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Employee Form State
  const [formName, setFormName] = useState('');
  const [formDept, setFormDept] = useState('');
  const [isCustomDept, setIsCustomDept] = useState(false);
  const [customDeptName, setCustomDeptName] = useState('');
  const [formRole, setFormRole] = useState('');
  const [formFacility, setFormFacility] = useState<FacilityLocation>('Kampala');
  const [formIsSupervisor, setFormIsSupervisor] = useState(false);
  const [formEmail, setFormEmail] = useState('');

  // Department formulation state
  const [newDepartmentName, setNewDepartmentName] = useState('');
  const [selectedClusterForNewDept, setSelectedClusterForNewDept] = useState(clusters[0]?.id || '');

  // Collect all known departments from clusters and people
  const allDepts = useMemo(() => {
    return Array.from(
      new Set([
        ...clusters.flatMap((c) => c.departments),
        ...people.map((p) => p.department),
      ])
    ).sort();
  }, [clusters, people]);

  const handleOpenAdd = () => {
    setEditingPerson(null);
    setFormName('');
    setFormDept(allDepts[0] || 'Operations & Field Services');
    setIsCustomDept(false);
    setCustomDeptName('');
    setFormRole('');
    setFormFacility('Kampala');
    setFormIsSupervisor(false);
    setFormEmail('');
    setShowAddModal(true);
  };

  const handleOpenEdit = (p: Person) => {
    setEditingPerson(p);
    setFormName(p.name);
    setFormDept(p.department);
    setIsCustomDept(false);
    setCustomDeptName('');
    setFormRole(p.role);
    setFormFacility(getPersonFacility(p));
    setFormIsSupervisor(isPersonSupervisor(p));
    setFormEmail(p.email);
    setShowAddModal(true);
  };

  const handleSavePerson = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    const targetDept = isCustomDept && customDeptName.trim() ? customDeptName.trim() : formDept || allDepts[0] || 'Operations';

    // If a brand new custom department was entered, add it to clusters
    if (isCustomDept && customDeptName.trim() && onUpdateClusters) {
      const exists = allDepts.includes(customDeptName.trim());
      if (!exists && clusters.length > 0) {
        const copy = [...clusters];
        copy[0] = {
          ...copy[0],
          departments: [...copy[0].departments, customDeptName.trim()],
        };
        onUpdateClusters(copy);
      }
    }

    if (editingPerson) {
      // Update existing employee
      const updated = people.map((p) =>
        p.id === editingPerson.id
          ? {
              ...p,
              name: formName.trim(),
              department: targetDept,
              role: formRole.trim() || 'Team Member',
              email: formEmail.trim() || `${formName.toLowerCase().replace(/\s+/g, '.')}@org.project`,
              facility: formFacility,
              isSupervisor: formIsSupervisor,
            }
          : p
      );
      onUpdatePeople(updated);
    } else {
      // Add new employee
      const newPerson: Person = {
        id: allocateEmployeeIds(people.map((p) => p.id), 1)[0],
        name: formName.trim(),
        department: targetDept,
        role: formRole.trim() || 'Team Member',
        email: formEmail.trim() || `${formName.toLowerCase().replace(/\s+/g, '.')}@org.project`,
        facility: formFacility,
        isSupervisor: formIsSupervisor,
      };
      onUpdatePeople([...people, newPerson]);
    }
    setShowAddModal(false);
  };

  const handleDelete = (id: string) => {
    const person = people.find((p) => p.id === id);
    if (person) {
      setPersonToDelete(person);
    }
  };

  // Add department handler
  const handleAddNewDepartment = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newDepartmentName.trim();
    if (!trimmed) return;
    if (allDepts.includes(trimmed)) {
      alert('This department already exists.');
      return;
    }

    if (onUpdateClusters && clusters.length > 0) {
      const targetClusterId = selectedClusterForNewDept || clusters[0].id;
      const updatedClusters = clusters.map((c) =>
        c.id === targetClusterId ? { ...c, departments: [...c.departments, trimmed] } : c
      );
      onUpdateClusters(updatedClusters);
    }
    setNewDepartmentName('');
    setShowDeptFormulatorModal(false);
  };

  // Filtered people
  const filteredPeople = useMemo(() => {
    return people.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.id.toLowerCase().includes(searchTerm.toLowerCase());

      const matchDept = selectedDeptFilter === 'ALL' || p.department === selectedDeptFilter;
      const matchFacility = selectedFacilityFilter === 'ALL' || getPersonFacility(p) === selectedFacilityFilter;

      let matchSupervisor = true;
      if (supervisorFilter === 'SUPERVISOR') {
        matchSupervisor = isPersonSupervisor(p);
      } else if (supervisorFilter === 'NON_SUPERVISOR') {
        matchSupervisor = !isPersonSupervisor(p);
      }

      return matchSearch && matchDept && matchFacility && matchSupervisor;
    });
  }, [people, searchTerm, selectedDeptFilter, selectedFacilityFilter, supervisorFilter]);

  // Headcount by Facility
  const facilityCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    ALL_FACILITIES.forEach((fac) => (counts[fac] = 0));
    people.forEach((p) => {
      const fac = getPersonFacility(p);
      counts[fac] = (counts[fac] || 0) + 1;
    });
    return counts;
  }, [people]);

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white border border-[#E2E8F0] rounded-3xl p-6 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FFC700] gold-glow"></span>
            <span className="font-semibold text-[#0A192F]">HR Personnel & Department Formulator</span>
            <span aria-hidden="true" className="text-slate-400">·</span>
            <span>7 Operational Facilities</span>
          </div>
          <h1 className="text-2xl font-black text-[#0A192F] tracking-tight">
            Organization Roster & Facilities Directory
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
            Formulate departments, feed in and manage employee assignments across all 7 facilities
            (Kampala, Mbarara, Jinja, Gulu, Mbale, Arua, Fort Portal). Non-supervisors are automatically
            constrained to local peer reviews within their facility.
          </p>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-auto shrink-0">
          <button
            onClick={() => setShowDeptFormulatorModal(true)}
            className="px-4 py-2 text-xs font-bold text-white bg-[#0A192F] hover:bg-[#132E52] border border-[#FFC700]/40 rounded-xl transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <Building className="w-4 h-4 text-[#FFD700]" />
            <span>+ Formulate Department</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 text-xs font-black text-[#0A192F] bg-[#FFC700] hover:bg-[#F5B800] rounded-xl transition-all flex items-center gap-1.5 shadow-sm shadow-[#FFC700]/30 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[#0A192F] stroke-[3]" />
            <span>+ Add Employee</span>
          </button>

          <button
            onClick={onOpenExcelWordImport}
            title="Import or paste from Excel / Word for future bulk uploads"
            className="px-3.5 py-2 text-xs font-bold text-[#0A192F] bg-[#F4F6F9] hover:bg-[#EAEFF5] border border-[#E2E8F0] rounded-xl transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Import Excel / Word</span>
          </button>

          <button
            onClick={onExportRosterCsv}
            title="Export full roster to CSV"
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-[#F4F6F9] hover:bg-[#EAEFF5] border border-[#E2E8F0] rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-600" />
            <span>Export CSV</span>
          </button>

          {people.length > 0 && onClearAllData && (
            <button
              onClick={() => setShowClearConfirm(true)}
              title="Remove all personnel and appraisal data to start fresh"
              className="px-3 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="w-4 h-4 text-rose-600" />
              <span>Clear Data</span>
            </button>
          )}

          {onRestoreSampleData && (
            <button
              onClick={onRestoreSampleData}
              title="Load the 2026 Schedule & Facilities dataset (117 staff from test_5c862727.csv)"
              className="px-3.5 py-2 text-xs font-semibold text-[#0A192F] bg-[#F4F6F9] hover:bg-[#EAEFF5] border border-[#E2E8F0] rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4 text-[#FFC700]" />
              <span>Reload 2026 Schedule (117 Staff)</span>
            </button>
          )}
        </div>
      </div>

      {/* Facility Distribution Quick Bar */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-2xs">
        <div className="flex items-center justify-between text-xs font-bold text-[#0A192F] mb-2.5 px-1">
          <span className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-[#FFC700]" />
            <span>7 Operational Facilities:</span>
          </span>
          <span className="text-[11px] text-slate-500 font-normal">
            Non-supervisors reviewed only by peers in their facility
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 text-xs">
          {ALL_FACILITIES.map((fac) => {
            const count = facilityCounts[fac] || 0;
            const isSelected = selectedFacilityFilter === fac;
            return (
              <button
                key={fac}
                onClick={() => setSelectedFacilityFilter(isSelected ? 'ALL' : fac)}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#0A192F] text-white border-[#FFC700]/40 shadow-sm'
                    : 'bg-[#F8FAFC] text-slate-800 border-[#E2E8F0] hover:border-[#FFC700] hover:bg-white'
                }`}
              >
                <div className={`text-[11px] font-bold truncate ${isSelected ? 'text-[#FFD700]' : 'text-[#0A192F]'}`}>{fac}</div>
                <div className={`text-sm font-black font-mono mt-0.5 ${isSelected ? 'text-white' : 'text-[#0A192F]'}`}>
                  {count} staff
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          {/* Search box */}
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by name, role, department, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0A192F] focus:border-[#FFC700] text-[#0A192F]"
            />
          </div>

          {/* Department Filter */}
          <select
            value={selectedDeptFilter}
            onChange={(e) => setSelectedDeptFilter(e.target.value)}
            className="py-2 px-3 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0A192F] text-[#0A192F] font-medium cursor-pointer"
          >
            <option value="ALL">All Departments ({allDepts.length})</option>
            {allDepts.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>

          {/* Facility Filter */}
          <select
            value={selectedFacilityFilter}
            onChange={(e) => setSelectedFacilityFilter(e.target.value)}
            className="py-2 px-3 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0A192F] text-[#0A192F] font-medium cursor-pointer"
          >
            <option value="ALL">All Facilities (7)</option>
            {ALL_FACILITIES.map((f) => (
              <option key={f} value={f}>
                {f} Facility ({facilityCounts[f] || 0})
              </option>
            ))}
          </select>

          {/* Supervisory Level Filter */}
          <div className="flex items-center gap-1 bg-[#F4F6F9] p-1 rounded-xl text-xs font-semibold border border-[#EAEFF5]">
            <button
              onClick={() => setSupervisorFilter('ALL')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                supervisorFilter === 'ALL' ? 'bg-[#0A192F] text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setSupervisorFilter('SUPERVISOR')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                supervisorFilter === 'SUPERVISOR' ? 'bg-[#0A192F] text-[#FFD700] shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Supervisors
            </button>
            <button
              onClick={() => setSupervisorFilter('NON_SUPERVISOR')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                supervisorFilter === 'NON_SUPERVISOR' ? 'bg-[#0A192F] text-emerald-400 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Staff Only
            </button>
          </div>
        </div>

        <div className="text-xs text-slate-500 font-medium shrink-0">
          Showing <strong className="text-[#0A192F]">{filteredPeople.length}</strong> of <strong className="text-[#0A192F]">{people.length}</strong> personnel
        </div>
      </div>

      {/* Roster Table */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#0A192F]">
            <thead className="bg-[#0A192F] border-b border-[#132E52] text-[11px] font-bold uppercase tracking-wider text-slate-300">
              <tr>
                <th className="py-3.5 px-4">Staff ID & Name</th>
                <th className="py-3.5 px-4">Role & Level</th>
                <th className="py-3.5 px-4">Department</th>
                <th className="py-3.5 px-4">Facility / Location</th>
                <th className="py-3.5 px-4">Review Scope</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAEFF5]">
              {filteredPeople.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    {people.length === 0 ? (
                      <div className="max-w-md mx-auto space-y-3 px-4">
                        <div className="w-12 h-12 rounded-2xl bg-[#0A192F] text-[#FFD700] flex items-center justify-center mx-auto shadow-sm border border-[#FFC700]/30">
                          <Plus className="w-6 h-6" />
                        </div>
                        <h4 className="text-base font-bold text-[#0A192F]">Roster is Clean & Empty</h4>
                        <p className="text-xs text-slate-500 leading-relaxed">
                          Previous demo data has been removed. You can now add your own employees, formulate custom departments, or import directly from an Excel spreadsheet.
                        </p>
                        <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                          <button
                            onClick={handleOpenAdd}
                            className="px-3.5 py-2 bg-[#FFC700] hover:bg-[#F5B800] text-[#0A192F] font-black text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5 text-[#0A192F] stroke-[3]" />
                            <span>Add First Employee</span>
                          </button>
                          <button
                            onClick={() => setShowDeptFormulatorModal(true)}
                            className="px-3.5 py-2 bg-[#0A192F] hover:bg-[#132E52] text-[#FFD700] hover:text-white font-bold text-xs rounded-xl border border-[#FFC700]/40 transition-colors flex items-center gap-1.5 cursor-pointer"
                          >
                            <Building className="w-3.5 h-3.5 text-[#FFD700]" />
                            <span>Formulate Department</span>
                          </button>
                          <button
                            onClick={onOpenExcelWordImport}
                            className="px-3.5 py-2 bg-[#F4F6F9] hover:bg-[#EAEFF5] text-[#0A192F] font-bold text-xs rounded-xl border border-[#E2E8F0] transition-colors flex items-center gap-1.5 cursor-pointer"
                          >
                            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Import Excel Sheet</span>
                          </button>
                          {onRestoreSampleData && (
                            <button
                              onClick={onRestoreSampleData}
                              className="px-3.5 py-2 bg-[#F4F6F9] hover:bg-[#EAEFF5] text-slate-700 font-medium text-xs rounded-xl border border-[#E2E8F0] transition-colors flex items-center gap-1.5 cursor-pointer"
                              title="Load the 2026 Schedule & Facilities dataset (117 staff from test_5c862727.csv)"
                            >
                              <RotateCcw className="w-3.5 h-3.5 text-[#FFC700]" />
                              <span>Load 2026 Schedule (117 Staff)</span>
                            </button>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="text-slate-400 text-xs">
                        No employees found matching the filters.
                      </div>
                    )}
                  </td>
                </tr>
              ) : (
                filteredPeople.map((person) => {
                  const isSup = isPersonSupervisor(person);
                  const fac = getPersonFacility(person);

                  return (
                    <tr key={person.id} className="hover:bg-[#F8FAFC] transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#0A192F] border border-[#FFC700]/40 text-[#FFD700] font-bold flex items-center justify-center text-xs shrink-0 shadow-2xs">
                            {person.name
                              .split(' ')
                              .map((n) => n[0])
                              .slice(0, 2)
                              .join('')}
                          </div>
                          <div>
                            <div className="font-bold text-[#0A192F]">{person.name}</div>
                            <div className="text-[10px] font-mono text-slate-400">{person.id}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-semibold text-[#0A192F]">{person.role}</div>
                        <div className="mt-0.5">
                          {isSup ? (
                            <span className="text-[10px] font-bold bg-purple-50 text-purple-800 border border-purple-200 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                              <Shield className="w-3 h-3 text-purple-600" />
                              Supervisor / Manager
                            </span>
                          ) : (
                            <span className="text-[10px] font-medium bg-[#EAEFF5] text-slate-700 px-2 py-0.5 rounded-full">
                              Facility Staff
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-medium text-slate-700">{person.department}</span>
                      </td>

                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#0A192F] bg-[#EAEFF5] border border-[#E2E8F0] px-2.5 py-1 rounded-lg">
                          <MapPin className="w-3.5 h-3.5 text-slate-500" />
                          <span>{fac}</span>
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        {isSup ? (
                          <span className="text-[11px] text-purple-700 font-medium">
                            Cross-facility & management
                          </span>
                        ) : (
                          <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Strictly {fac} peers only</span>
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(person)}
                            className="p-1.5 text-slate-500 hover:text-[#0A192F] hover:bg-[#EAEFF5] rounded-lg transition-colors cursor-pointer"
                            title="Edit employee details, facility or supervisor status"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(person.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Remove from roster"
                          >
                            <Trash2 className="w-4 h-4" />
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

      {/* MODAL: ADD / EDIT EMPLOYEE */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-[#071224]/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-4 sm:p-5 shadow-2xl border border-[#E2E8F0] my-auto animate-in fade-in flex flex-col max-h-[92vh]">
            <div className="flex items-center justify-between pb-3 border-b border-[#EAEFF5] mb-3 shrink-0">
              <div>
                <h3 className="text-base font-black text-[#0A192F]">
                  {editingPerson ? 'Edit Employee Details' : 'Add New Employee'}
                </h3>
                <p className="text-[11px] text-slate-500">
                  Set department, role, facility branch, and supervisory level.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="w-7 h-7 rounded-full bg-[#F4F6F9] hover:bg-[#EAEFF5] flex items-center justify-center text-slate-500 font-bold cursor-pointer transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSavePerson} className="flex-1 overflow-y-auto pr-1 space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#0A192F] uppercase tracking-wider mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Sarah Namubiru"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0A192F] focus:border-[#FFC700] text-[#0A192F]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#0A192F] uppercase tracking-wider mb-1">
                    Job Role / Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Enrolment Operator"
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0A192F] focus:border-[#FFC700] text-[#0A192F]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-bold text-[#0A192F] uppercase tracking-wider">
                      Department *
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsCustomDept(!isCustomDept)}
                      className="text-[10px] text-[#D49B00] hover:text-[#B48200] hover:underline font-bold"
                    >
                      {isCustomDept ? 'Choose Existing' : '+ Formulate'}
                    </button>
                  </div>

                  {isCustomDept ? (
                    <input
                      type="text"
                      required
                      placeholder="Type new department..."
                      value={customDeptName}
                      onChange={(e) => setCustomDeptName(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-amber-50/50 border border-[#FFC700] rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0A192F] text-[#0A192F]"
                    />
                  ) : (
                    <select
                      value={formDept}
                      onChange={(e) => setFormDept(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0A192F] text-[#0A192F] font-medium"
                    >
                      {allDepts.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#0A192F] uppercase tracking-wider mb-1">
                    Facility / Branch *
                  </label>
                  <select
                    value={formFacility}
                    onChange={(e) => setFormFacility(e.target.value as FacilityLocation)}
                    className="w-full px-3 py-1.5 text-xs bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0A192F] text-[#0A192F] font-medium"
                  >
                    {ALL_FACILITIES.map((fac) => (
                      <option key={fac} value={fac}>
                        {fac}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#0A192F] uppercase tracking-wider mb-1">
                    Supervisory Level *
                  </label>
                  <select
                    value={formIsSupervisor ? 'yes' : 'no'}
                    onChange={(e) => setFormIsSupervisor(e.target.value === 'yes')}
                    className="w-full px-3 py-1.5 text-xs bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0A192F] text-[#0A192F] font-medium"
                  >
                    <option value="no">Staff Member (Facility Only)</option>
                    <option value="yes">Supervisor / Manager</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#0A192F] uppercase tracking-wider mb-1">
                    Work Email (Optional)
                  </label>
                  <input
                    type="email"
                    placeholder="name@org.project"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0A192F] text-[#0A192F]"
                  />
                </div>
              </div>

              <div className="bg-[#0A192F] border border-[#132E52] rounded-lg px-3 py-2 text-white text-[11px] leading-tight flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FFC700] shrink-0"></span>
                <span>
                  <strong className="text-[#FFD700]">Branch Policy:</strong> Non-supervisors are evaluated strictly by peers in <strong className="text-[#FFD700]">{formFacility}</strong>.
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2.5 border-t border-[#EAEFF5] shrink-0">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3.5 py-1.5 text-xs text-slate-600 hover:bg-[#F4F6F9] rounded-lg font-bold cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#FFC700] hover:bg-[#F5B800] text-[#0A192F] rounded-lg font-black text-xs shadow-sm shadow-[#FFC700]/30 cursor-pointer transition-all"
                >
                  {editingPerson ? 'Save Changes' : 'Add to Roster'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: FORMULATE NEW DEPARTMENT */}
      {showDeptFormulatorModal && (
        <div className="fixed inset-0 z-50 bg-[#071224]/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-md w-full p-4 sm:p-5 shadow-2xl border border-[#E2E8F0] my-auto animate-in fade-in">
            <div className="flex items-center justify-between pb-4 border-b border-[#EAEFF5] mb-5">
              <div>
                <h3 className="text-lg font-black text-[#0A192F]">Formulate New Department</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Add a department directly to your company structure.
                </p>
              </div>
              <button
                onClick={() => setShowDeptFormulatorModal(false)}
                className="w-8 h-8 rounded-full bg-[#F4F6F9] hover:bg-[#EAEFF5] flex items-center justify-center text-slate-500 font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddNewDepartment} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#0A192F] uppercase tracking-wider mb-1">
                  Department Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Regional Logistics, Corporate Legal, etc."
                  value={newDepartmentName}
                  onChange={(e) => setNewDepartmentName(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0A192F] focus:border-[#FFC700] text-[#0A192F]"
                  autoFocus
                />
              </div>

              <div>
                <label className="block font-bold text-[#0A192F] uppercase tracking-wider mb-1">
                  Assign to Organizational Cluster
                </label>
                <select
                  value={selectedClusterForNewDept}
                  onChange={(e) => setSelectedClusterForNewDept(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0A192F] text-[#0A192F] font-medium"
                >
                  {clusters.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#EAEFF5]">
                <button
                  type="button"
                  onClick={() => setShowDeptFormulatorModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-[#F4F6F9] rounded-xl font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#0A192F] hover:bg-[#132E52] text-[#FFD700] hover:text-white rounded-xl font-bold shadow-md shadow-[#0A192F]/20 cursor-pointer border border-[#FFC700]/50"
                >
                  Create Department
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM MODAL: DELETE INDIVIDUAL EMPLOYEE */}
      <ConfirmModal
        isOpen={Boolean(personToDelete)}
        title="Remove Employee from Roster?"
        message={
          personToDelete ? (
            <div>
              Are you sure you want to remove{' '}
              <strong className="text-[#0A192F]">{personToDelete.name}</strong> ({personToDelete.id}) from{' '}
              <strong className="text-[#0A192F]">{personToDelete.department}</strong>?
              <div className="mt-1.5 text-slate-500">
                This will remove them from the staff roster and re-balance their active review committees.
              </div>
            </div>
          ) : (
            ''
          )
        }
        confirmText="Remove Employee"
        confirmVariant="danger"
        onConfirm={() => {
          if (personToDelete) {
            onUpdatePeople(people.filter((p) => p.id !== personToDelete.id));
            setPersonToDelete(null);
          }
        }}
        onCancel={() => setPersonToDelete(null)}
      />

      {/* CONFIRM MODAL: CLEAR ALL ROSTER DATA */}
      <ConfirmModal
        isOpen={showClearConfirm}
        title="Clean Roster & Clear All Data?"
        message="Are you sure you want to remove all roster data to start fresh? All employees and evaluations will be removed."
        confirmText="Clear All Data"
        confirmVariant="danger"
        onConfirm={() => {
          if (onClearAllData) {
            onClearAllData();
          }
          setShowClearConfirm(false);
        }}
        onCancel={() => setShowClearConfirm(false)}
      />
    </div>
  );
};
