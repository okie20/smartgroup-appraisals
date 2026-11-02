import React, { useState, useMemo } from 'react';
import {
  UserCheck,
  ShieldCheck,
  User,
  Search,
  ArrowRight,
  Sparkles,
  Eye,
  EyeOff,
  Building,
  MapPin,
  Lock,
} from 'lucide-react';
import { Person, UserSession, ALL_FACILITIES, getPersonFacility } from '../types';
import loginCoverImg from '../assets/images/login_welcome_cover_1793257012935.jpg';

interface LoginPageProps {
  people: Person[];
  onLogin: (session: UserSession) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ people, onLogin }) => {
  const [activeTab, setActiveTab] = useState<'employee' | 'admin'>('employee');

  // Employee Login State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFacility, setSelectedFacility] = useState<string>('ALL');

  // Admin Login State
  const [adminUsername, setAdminUsername] = useState('Admin');
  const [adminPassword, setAdminPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [adminError, setAdminError] = useState<string | null>(null);

  // Filtered employees for instant selection
  const filteredEmployees = useMemo(() => {
    let list = people;
    if (selectedFacility !== 'ALL') {
      list = list.filter((p) => getPersonFacility(p) === selectedFacility);
    }
    if (!searchQuery.trim()) {
      return list;
    }
    const q = searchQuery.toLowerCase().trim();
    return list.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.role.toLowerCase().includes(q) ||
        p.department.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q) ||
        getPersonFacility(p).toLowerCase().includes(q)
    );
  }, [people, searchQuery, selectedFacility]);

  // Handle Employee Click Login (No password required)
  const handleSelectEmployee = (person: Person) => {
    onLogin({
      type: 'employee',
      person,
    });
  };

  // Handle Admin Login
  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError(null);

    const cleanUser = adminUsername.trim().toLowerCase();
    const cleanPass = adminPassword.trim();

    if (cleanUser === 'admin' && cleanPass === 'administrator') {
      onLogin({
        type: 'admin',
        username: adminUsername.trim(),
      });
    } else {
      setAdminError('Invalid credentials. Use username "Admin" and password "administrator".');
    }
  };

  const handleQuickFillAdmin = () => {
    setAdminUsername('Admin');
    setAdminPassword('administrator');
    setAdminError(null);
  };

  return (
    <div className="min-h-screen bg-[#071224] flex flex-col justify-between text-slate-100 selection:bg-[#FFC700] selection:text-[#0A192F]">
      {/* Top Header */}
      <header className="border-b border-[#132E52] bg-[#0A192F]/95 backdrop-blur-md px-6 py-4 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#FFE066] via-[#FFC700] to-[#F5B800] flex items-center justify-center font-black text-[#0A192F] text-lg shadow-md shadow-[#FFC700]/30">
              S
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-white text-base tracking-tight">SmartGroup 360°</span>
                <span className="text-[11px] font-bold text-[#FFD700]">· Active Appraisal Cycle</span>
              </div>
              <p className="text-slate-400 text-xs hidden sm:block">
                Enterprise Group Allocation & Reciprocal Peer Evaluation System
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-300">
            <div className="hidden md:flex items-center gap-3 text-slate-400">
              <span>{people.length > 0 ? `${people.length} Personnel` : 'Organization Roster'}</span>
              <span aria-hidden="true">·</span>
              <span>7 Facilities</span>
              <span aria-hidden="true">·</span>
              <span>18 Annex A Roles</span>
            </div>
            <button
              onClick={() => setActiveTab(activeTab === 'employee' ? 'admin' : 'employee')}
              className="px-3 py-1.5 rounded-lg border border-[#1E3A5F] bg-[#0E223D] hover:bg-[#132E52] text-[#FFD700] transition-colors text-xs font-bold cursor-pointer"
            >
              Switch to {activeTab === 'employee' ? 'HR Admin' : 'Employee'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Split-Screen Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-10">
        <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-[#1E3A5F] grid grid-cols-1 lg:grid-cols-12 text-[#0A192F]">
          
          {/* Left Column: Visual Showcase & Brand Story (5 cols) */}
          <div className="lg:col-span-5 relative bg-[#0A192F] text-white flex flex-col justify-between overflow-hidden min-h-[320px] lg:min-h-[640px]">
            {/* Background Image with Cinematic Gradient Overlay */}
            <img
              src={loginCoverImg}
              alt="Modern HR Workspace"
              className="absolute inset-0 w-full h-full object-cover opacity-35 mix-blend-luminosity scale-105 transition-transform duration-1000 hover:scale-100"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#071224] via-[#0A192F]/80 to-[#102A45]/70"></div>

            {/* Top Text */}
            <div className="relative z-10 p-6 sm:p-8">
              <div className="inline-flex items-center gap-2 text-[#FFD700] text-xs font-bold bg-[#FFC700]/20 border border-[#FFC700]/50 px-3 py-1 rounded-full shadow-[0_0_10px_rgba(255,199,0,0.2)]">
                <Sparkles className="w-3.5 h-3.5 text-[#FFD700]" />
                <span>Next-Gen Performance Review</span>
              </div>
            </div>

            {/* Bottom Content */}
            <div className="relative z-10 p-6 sm:p-8 space-y-4">
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
                Empowering Fair, Objective 360° Appraisals
              </h2>
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                Every member is reviewed by an allocated 7-peer reciprocal panel compliant with
                organizational hierarchy, facility branches, and statutory Annex A composition.
              </p>

              {/* Key Highlights */}
              <div className="pt-4 border-t border-white/15 grid grid-cols-2 gap-3 text-xs">
                <div className="bg-[#071224]/80 backdrop-blur-md rounded-xl p-3 border border-[#1E3A5F]">
                  <div className="text-lg font-black text-white">100%</div>
                  <div className="text-[11px] text-slate-300">Participation Guarantee</div>
                </div>
                <div className="bg-[#071224]/80 backdrop-blur-md rounded-xl p-3 border border-[#1E3A5F]">
                  <div className="text-lg font-black text-[#FFD700]">7 Peers</div>
                  <div className="text-[11px] text-slate-300">Balanced Review Panels</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Login Flow (7 cols) */}
          <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-center bg-white">
            {/* Tabs for switching between Employee and HR Admin */}
            <div className="flex items-center justify-between gap-2 p-1.5 bg-[#F4F6F9] rounded-2xl mb-6 border border-[#EAEFF5]">
              <button
                type="button"
                onClick={() => setActiveTab('employee')}
                className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  activeTab === 'employee'
                    ? 'bg-[#0A192F] text-[#FFD700] shadow-sm font-black'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <UserCheck className={`w-4 h-4 ${activeTab === 'employee' ? 'text-[#FFD700]' : 'text-slate-600'}`} />
                <span>Employee Login</span>
                <span className={`text-[10px] hidden sm:inline ${activeTab === 'employee' ? 'text-[#FFD700]/90 font-semibold' : 'text-slate-500'}`}>
                  (No Password)
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('admin')}
                className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  activeTab === 'admin'
                    ? 'bg-[#0A192F] text-white shadow-sm font-black'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Lock className={`w-4 h-4 ${activeTab === 'admin' ? 'text-[#FFD700]' : 'text-slate-600'}`} />
                <span>HR & Admin</span>
              </button>
            </div>

            {/* TAB 1: EMPLOYEE PASSWORDLESS SIGN-IN */}
            {activeTab === 'employee' && (
              <div className="space-y-4">
                {people.length === 0 ? (
                  <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-6 text-center space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-[#0A192F] text-[#FFD700] flex items-center justify-center mx-auto shadow-sm border border-[#FFC700]/30">
                      <User className="w-6 h-6" />
                    </div>
                    <h4 className="font-bold text-base text-[#0A192F]">Roster is Clean & Ready</h4>
                    <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
                      All previous data has been cleared. Sign in as HR & Admin to add employees, formulate departments, or import your Excel spreadsheet.
                    </p>
                    <button
                      type="button"
                      onClick={() => setActiveTab('admin')}
                      className="px-4 py-2 bg-[#0A192F] hover:bg-[#132E52] text-[#FFD700] hover:text-white font-bold text-xs rounded-xl shadow-sm transition-colors cursor-pointer inline-flex items-center gap-1.5 border border-[#FFC700]/50"
                    >
                      <span>Go to HR & Admin Sign-In</span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#FFD700]" />
                    </button>
                  </div>
                ) : (
                  <>
                    <div>
                      <h3 className="text-lg font-bold text-[#0A192F]">
                        Select Your Name to Enter Workspace
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        No password required. Click your name from the directory below to open your confidential evaluation desk.
                      </p>
                    </div>

                {/* Instant Search Box */}
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search name, job title, department, or facility..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs sm:text-sm text-[#0A192F] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0A192F] focus:border-[#FFC700] focus:bg-white transition-all font-medium"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Facility Filter Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
                  <button
                    onClick={() => setSelectedFacility('ALL')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                      selectedFacility === 'ALL'
                        ? 'bg-[#0A192F] text-[#FFD700] border border-[#FFC700]/70 shadow-xs font-bold'
                        : 'bg-[#F1F5F9] text-slate-700 hover:bg-[#EAEFF5]'
                    }`}
                  >
                    All Facilities ({people.length})
                  </button>
                  {ALL_FACILITIES.map((fac) => (
                    <button
                      key={fac}
                      onClick={() => setSelectedFacility(selectedFacility === fac ? 'ALL' : fac)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                        selectedFacility === fac
                          ? 'bg-[#0A192F] text-[#FFD700] border border-[#FFC700]/70 shadow-xs font-bold'
                          : 'bg-[#F1F5F9] text-slate-700 hover:bg-[#EAEFF5]'
                      }`}
                    >
                      {fac}
                    </button>
                  ))}
                </div>

                {/* Scrollable list of staff members */}
                <div className="max-h-[300px] overflow-y-auto space-y-1.5 pr-1 divide-y divide-[#EAEFF5]">
                  {filteredEmployees.map((person) => {
                    const initials = person.name
                      .split(' ')
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join('');
                    const facility = getPersonFacility(person);

                    return (
                      <div
                        key={person.id}
                        onClick={() => handleSelectEmployee(person)}
                        className="p-2.5 rounded-xl border border-[#EAEFF5] hover:border-[#FFC700] hover:bg-[#FFFDF5] hover:shadow-sm transition-all flex items-center justify-between gap-3 cursor-pointer group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-full bg-[#0A192F] text-[#FFD700] font-black text-xs flex items-center justify-center transition-colors shrink-0 border border-[#FFC700]/60 shadow-[0_0_8px_rgba(255,199,0,0.2)]">
                            {initials}
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-xs sm:text-sm text-[#0A192F] group-hover:text-[#0A192F] truncate">
                              {person.name}
                            </div>
                            <div className="text-[11px] text-slate-500 truncate flex items-center gap-1.5">
                              <span>{person.role}</span>
                              <span>·</span>
                              <span>{person.department}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[10px] font-semibold text-slate-700 bg-[#EAEFF5] px-2 py-0.5 rounded-md flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            {facility}
                          </span>
                          <span className="text-xs font-black text-[#D49B00] group-hover:text-[#A87800] group-hover:translate-x-0.5 transition-all hidden sm:inline">
                            Enter Desk →
                          </span>
                        </div>
                      </div>
                    );
                  })}

                  {filteredEmployees.length === 0 && (
                    <div className="p-8 text-center text-xs text-slate-400">
                      No employee found matching your search. Try another name or facility.
                    </div>
                  )}
                </div>

                <div className="pt-2 text-[11px] text-slate-400 flex items-center justify-between">
                  <span>🔒 Secure device session stored locally</span>
                  <span>{people.length} Registered Personnel</span>
                </div>
              </>
            )}
          </div>
        )}

            {/* TAB 2: HR ADMINISTRATOR LOGIN */}
            {activeTab === 'admin' && (
              <form onSubmit={handleAdminSubmit} className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-[#0A192F]">HR & Admin Console Sign-In</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Authorized personnel only. Enter credentials to manage 135 panel allocations, facility branches, and audit appraisals.
                  </p>
                </div>

                {adminError && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                    {adminError}
                  </div>
                )}

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-[#0A192F] mb-1">Username</label>
                    <input
                      type="text"
                      value={adminUsername}
                      onChange={(e) => setAdminUsername(e.target.value)}
                      placeholder="Admin"
                      required
                      className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs sm:text-sm text-[#0A192F] focus:outline-none focus:ring-2 focus:ring-[#0A192F] focus:border-[#FFC700] focus:bg-white transition-all font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#0A192F] mb-1">Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        placeholder="administrator"
                        required
                        className="w-full pl-3.5 pr-10 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs sm:text-sm text-[#0A192F] focus:outline-none focus:ring-2 focus:ring-[#0A192F] focus:border-[#FFC700] focus:bg-white transition-all font-medium"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between gap-3">
                  <button
                    type="submit"
                    className="flex-1 py-3 px-4 bg-[#0A192F] hover:bg-[#132E52] text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md shadow-[#0A192F]/20 cursor-pointer flex items-center justify-center gap-2 border border-[#FFC700]/70"
                  >
                    <span>Sign In to Admin Console</span>
                    <ArrowRight className="w-4 h-4 text-[#FFD700]" />
                  </button>

                  <button
                    type="button"
                    onClick={handleQuickFillAdmin}
                    className="py-3 px-3 bg-[#F4F6F9] hover:bg-[#EAEFF5] text-[#0A192F] font-semibold text-xs rounded-xl transition-colors cursor-pointer border border-[#E2E8F0]"
                    title="Quick fill username Admin and password administrator"
                  >
                    Quick Demo Fill
                  </button>
                </div>

                <div className="pt-2 text-center text-[11px] text-slate-500">
                  Default credentials: Username <strong className="text-[#0A192F]">Admin</strong> · Password <strong className="text-[#0A192F]">administrator</strong>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#132E52] bg-[#0A192F] px-6 py-4 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#FFC700] shadow-[0_0_6px_#FFC700]"></span>
            <strong className="text-white">SmartGroup 360°</strong>
            <span className="text-slate-500">·</span>
            <span className="text-slate-300">Reciprocal Peer Performance Evaluation System</span>
          </div>
          <div className="text-[11px] text-slate-400">
            Compliant with 18 Annex A Mandates · 7 Operational Facilities
          </div>
        </div>
      </footer>
    </div>
  );
};
