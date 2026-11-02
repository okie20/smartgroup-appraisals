import React from 'react';
import { AllocationStats, ALL_FACILITIES } from '../types';
import { Search, ShieldCheck } from 'lucide-react';

interface StatsBarProps {
  stats: AllocationStats;
  targetGroupSize: number;
  onTargetSizeChange?: (val: number) => void;
  searchQuery: string;
  onSearchChange: (val: string) => void;
  selectedDept: string;
  onDeptChange: (val: string) => void;
  selectedFacility?: string;
  onFacilityChange?: (val: string) => void;
  departments: string[];
  onOpenAnnexA?: () => void;
}

export const StatsBar: React.FC<StatsBarProps> = ({
  stats,
  searchQuery,
  onSearchChange,
  selectedDept,
  onDeptChange,
  selectedFacility = 'ALL',
  onFacilityChange,
  departments,
  onOpenAnnexA,
}) => {
  return (
    <div className="bg-[#0A192F] border-b border-[#132E52] text-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 space-y-3">
        {/* Quick KPI Strip */}
        <div className="flex flex-wrap items-center justify-between gap-4 text-xs pb-3 border-b border-[#132E52]">
          <div className="flex flex-wrap items-center gap-6">
            <div>
              <span className="text-slate-400">Total Personnel:</span>{' '}
              <strong className="text-white font-mono text-sm font-bold">{stats.totalPeople}</strong>
            </div>
            <div>
              <span className="text-slate-400">Review Panels:</span>{' '}
              <strong className="text-[#FFD700] font-mono text-sm font-bold">{stats.groupCount}</strong>{' '}
              <span className="text-slate-400 text-[11px]">(7 peers/panel)</span>
            </div>
            <div>
              <span className="text-slate-400">Facility Branches:</span>{' '}
              <strong className="text-white font-medium">7 Facilities</strong>{' '}
              <span className="text-[#FFC700] text-[11px] font-semibold">(Local Scoping Enforced)</span>
            </div>
          </div>

          {onOpenAnnexA && (
            <button
              onClick={onOpenAnnexA}
              className="text-xs font-semibold text-[#FFD700] hover:text-white flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#FFC700]" />
              <span>Annex A 18 Mandated Roles</span>
            </button>
          )}
        </div>

        {/* Search & Filter Toolbar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search employee by name, role, department or panel number..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-[#071224] border border-[#1E3A5F] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FFC700] text-white placeholder:text-slate-400 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>

          {/* Facility Filter */}
          {onFacilityChange && (
            <div className="relative sm:w-48">
              <select
                value={selectedFacility}
                onChange={(e) => onFacilityChange(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-[#071224] border border-[#1E3A5F] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FFC700] text-white font-medium cursor-pointer"
              >
                <option value="ALL">All 7 Facilities</option>
                {ALL_FACILITIES.map((fac) => (
                  <option key={fac} value={fac}>
                    {fac} Facility
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Department Filter */}
          <div className="relative sm:w-56">
            <select
              value={selectedDept}
              onChange={(e) => onDeptChange(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm bg-[#071224] border border-[#1E3A5F] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FFC700] text-white font-medium cursor-pointer"
            >
              <option value="ALL">All Departments</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};
