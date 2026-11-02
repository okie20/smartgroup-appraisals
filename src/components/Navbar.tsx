import React, { useState } from 'react';
import {
  Users,
  ClipboardCheck,
  Building,
  ShieldCheck,
  Download,
  LogOut,
  UserCheck,
  FileSpreadsheet,
  Trash2,
  Sparkles,
} from 'lucide-react';
import { AppMode, UserSession } from '../types';
import { ConfirmModal } from './ConfirmModal';

interface NavbarProps {
  appMode: AppMode;
  setAppMode: (mode: AppMode) => void;
  activeTab: 'groups' | 'appraisals' | 'roster';
  setActiveTab: (tab: 'groups' | 'appraisals' | 'roster') => void;
  onShuffle: () => void;
  onExport: () => void;
  onOpenImport: () => void;
  onOpenAnnexA: () => void;
  totalPeople: number;
  totalSubmissions: number;
  currentUserName?: string;
  session: UserSession | null;
  onLogout: () => void;
  onClearAllData?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  appMode,
  setAppMode,
  activeTab,
  setActiveTab,
  onExport,
  onOpenImport,
  onOpenAnnexA,
  totalPeople,
  totalSubmissions,
  session,
  onLogout,
  onClearAllData,
}) => {
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  return (
    <header className="border-b border-[#132E52] bg-[#0A192F] text-white sticky top-0 z-40 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 h-16">
          {/* Brand Wordmark & Mode Indicator */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#FFE066] via-[#FFC700] to-[#F5B800] text-[#0A192F] flex items-center justify-center font-black text-xs shadow-md shadow-[#FFC700]/30">
              360°
            </div>
            <div>
              <div className="text-base font-extrabold tracking-tight text-white flex items-center gap-2">
                <span>SmartGroup Appraisals</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#FFC700] shadow-[0_0_6px_#FFC700]"></span>
              </div>
              <div className="text-[11px] text-slate-300 hidden sm:block">
                {appMode === 'admin' ? 'HR & Administration Console' : 'Personal Appraisal Workspace'}
              </div>
            </div>
          </div>

          {/* Navigation Tabs (Admin Mode: 3 Clean Tabs) */}
          {appMode === 'admin' ? (
            <nav className="hidden md:flex items-center gap-1 bg-[#0E223D] p-1 rounded-xl border border-[#132E52]">
              <button
                onClick={() => setActiveTab('groups')}
                className={`px-3.5 py-1.5 text-xs rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'groups'
                    ? 'bg-[#FFC700] hover:bg-[#F5B800] text-[#0A192F] shadow-md shadow-[#FFC700]/25 font-black'
                    : 'text-slate-300 hover:text-white hover:bg-[#132E52]/60 font-semibold'
                }`}
              >
                <Users className={`w-3.5 h-3.5 ${activeTab === 'groups' ? 'text-[#0A192F]' : 'text-[#FFD700]'}`} />
                <span>Review Panels ({totalPeople})</span>
              </button>

              <button
                onClick={() => setActiveTab('appraisals')}
                className={`px-3.5 py-1.5 text-xs rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'appraisals'
                    ? 'bg-[#FFC700] hover:bg-[#F5B800] text-[#0A192F] shadow-md shadow-[#FFC700]/25 font-black'
                    : 'text-slate-300 hover:text-white hover:bg-[#132E52]/60 font-semibold'
                }`}
              >
                <ClipboardCheck className={`w-3.5 h-3.5 ${activeTab === 'appraisals' ? 'text-[#0A192F]' : 'text-emerald-400'}`} />
                <span>Appraisal Status</span>
                {totalSubmissions > 0 && (
                  <span className={`text-[10px] px-1.5 rounded-full font-mono font-bold ${
                    activeTab === 'appraisals'
                      ? 'bg-[#0A192F] text-[#FFD700]'
                      : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                  }`}>
                    {totalSubmissions}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('roster')}
                className={`px-3.5 py-1.5 text-xs rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'roster'
                    ? 'bg-[#FFC700] hover:bg-[#F5B800] text-[#0A192F] shadow-md shadow-[#FFC700]/25 font-black'
                    : 'text-slate-300 hover:text-white hover:bg-[#132E52]/60 font-semibold'
                }`}
              >
                <Building className={`w-3.5 h-3.5 ${activeTab === 'roster' ? 'text-[#0A192F]' : 'text-slate-400'}`} />
                <span>Staff & Facilities</span>
              </button>
            </nav>
          ) : (
            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-300">
              <span className="font-semibold text-white">Confidential Peer Evaluations</span>
              <span className="text-slate-500">·</span>
              <span className="text-[#FFD700] font-bold">7 Assigned Appraisals</span>
            </div>
          )}

          {/* Right Actions & User Account */}
          <div className="flex items-center gap-2.5 shrink-0">
            {appMode === 'admin' ? (
              <>
                {/* Status Indicator */}
                {totalPeople === 0 ? (
                  <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold text-emerald-300 bg-emerald-950/50 border border-emerald-700/60 rounded-lg">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span>Clean System · Ready for Excel</span>
                  </div>
                ) : (
                  onClearAllData && (
                    <button
                      onClick={() => setShowClearConfirm(true)}
                      title="Clean system and remove all data"
                      className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-rose-300 hover:text-white bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/60 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                      <span>Clean Data</span>
                    </button>
                  )
                )}

                <button
                  onClick={onOpenImport}
                  title="Import or paste from Excel / Word"
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-black text-[#0A192F] bg-[#FFC700] hover:bg-[#F5B800] rounded-lg transition-all cursor-pointer shadow-md shadow-[#FFC700]/30"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-[#0A192F]" />
                  <span>Import Excel</span>
                </button>

                <button
                  onClick={onOpenAnnexA}
                  title="View the 18 Annex A Prescribed Role Appraiser Compositions"
                  className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:text-white bg-[#0E223D] hover:bg-[#132E52] border border-[#132E52] rounded-lg transition-colors cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-[#FFD700]" />
                  <span>Annex A</span>
                </button>

                <button
                  onClick={onExport}
                  title="Export Data"
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:text-white bg-[#0E223D] hover:bg-[#132E52] border border-[#132E52] rounded-lg transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-slate-400" />
                  <span>Export</span>
                </button>

                <button
                  onClick={() => setAppMode('portal')}
                  className="px-3 py-1.5 text-xs font-bold text-white bg-[#0E223D] hover:bg-[#132E52] border border-[#1E3A5F] hover:border-[#FFC700]/50 rounded-lg transition-all cursor-pointer flex items-center gap-1.5"
                  title="Switch to Staff Portal to do appraisals"
                >
                  <UserCheck className="w-3.5 h-3.5 text-[#FFD700]" />
                  <span className="hidden sm:inline">Staff Desk</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => setAppMode('admin')}
                className="px-3 py-1.5 text-xs font-semibold text-slate-200 hover:text-white bg-[#0E223D] hover:bg-[#132E52] border border-[#132E52] rounded-lg transition-colors cursor-pointer"
              >
                Go to HR Console
              </button>
            )}

            {/* User Session Info */}
            {session && (
              <div className="hidden xl:flex items-center gap-2 text-xs text-slate-300 pl-3 border-l border-[#132E52]">
                <div className="w-6 h-6 rounded-full bg-[#0E223D] border border-[#FFC700]/70 flex items-center justify-center font-bold text-[10px] text-[#FFD700] shadow-[0_0_6px_rgba(255,199,0,0.3)]">
                  {session.type === 'admin' ? 'AD' : session.person.name.slice(0, 2).toUpperCase()}
                </div>
                <span className="font-semibold text-white">
                  {session.type === 'admin' ? 'Admin' : session.person.name.split(' ')[0]}
                </span>
              </div>
            )}

            {/* Log Out */}
            <button
              onClick={onLogout}
              title="Sign out"
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-[#0E223D] rounded-lg transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation bar for small screens */}
        {appMode === 'admin' && (
          <div className="md:hidden flex items-center justify-around py-2 border-t border-[#132E52] text-xs font-bold text-slate-300">
            <button
              onClick={() => setActiveTab('groups')}
              className={`px-3 py-1.5 rounded-lg ${
                activeTab === 'groups' ? 'bg-[#FFC700] text-[#0A192F] font-black' : 'text-slate-300'
              }`}
            >
              Panels
            </button>
            <button
              onClick={() => setActiveTab('appraisals')}
              className={`px-3 py-1.5 rounded-lg ${
                activeTab === 'appraisals' ? 'bg-[#FFC700] text-[#0A192F] font-black' : 'text-slate-300'
              }`}
            >
              Appraisals
            </button>
            <button
              onClick={() => setActiveTab('roster')}
              className={`px-3 py-1.5 rounded-lg ${
                activeTab === 'roster' ? 'bg-[#FFC700] text-[#0A192F] font-black' : 'text-slate-300'
              }`}
            >
              Staff
            </button>
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={showClearConfirm}
        title="Clean System & Clear All Data?"
        message="Are you sure you want to clean the system and remove all roster data? All personnel, panels, and appraisal records will be removed."
        confirmText="Clean All Data"
        confirmVariant="danger"
        onConfirm={() => {
          if (onClearAllData) {
            onClearAllData();
          }
          setShowClearConfirm(false);
        }}
        onCancel={() => setShowClearConfirm(false)}
      />
    </header>
  );
};
