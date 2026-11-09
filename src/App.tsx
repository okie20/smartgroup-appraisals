import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { Person, DepartmentCluster, GroupingConfig, AllocatedGroup, AppraisalSubmission, AppMode, UserSession } from './types';
import { DEFAULT_ROSTER, DEFAULT_CLUSTERS } from './data/defaultRoster';
import { generateAllocations, GroupAllocationResult } from './utils/groupingEngine';
import {
  loadAppraisalsFromStorage,
  saveAppraisalsToStorage,
  getAppraisalKey,
  upsertAppraisalToSupabase,
  syncAppraisalsFromSupabase,
} from './utils/appraisalStorage';
import {
  loadAllFromCloud,
  saveRosterToCloud,
  saveClustersToCloud,
  saveCustomGroupsToCloud,
} from './utils/cloudSync';
import { Navbar } from './components/Navbar';
import { StatsBar } from './components/StatsBar';
import { GroupsView } from './components/GroupsView';
import { MemberDirectoryView } from './components/MemberDirectoryView';
import { DepartmentClustersView } from './components/DepartmentClustersView';
import { AnalyticsView } from './components/AnalyticsView';
import { RosterView } from './components/RosterView';
import { HRAppraisalDashboard } from './components/HRAppraisalDashboard';
import { AppraisalPortalView } from './components/AppraisalPortalView';
import { PrintableGroupSheetModal } from './components/PrintableGroupSheetModal';
import { ExportModal } from './components/ExportModal';
import { ExcelWordImportModal } from './components/ExcelWordImportModal';
import { AnnexASpecificationsModal } from './components/AnnexASpecificationsModal';
import { LoginPage } from './components/LoginPage';
import { FileSpreadsheet } from 'lucide-react';
import { USER_TEST_ROSTER } from './data/userUploadedDataset';
import { ensureUniqueEmployeeIds, findPersonByStaffQuery } from './utils/employeeIds';

export default function App() {
  // Initialize with the user uploaded 2026 Schedule & Facilities dataset (117 staff)
  const [people, setPeople] = useState<Person[]>(() => {
    try {
      const saved = localStorage.getItem('smartgroup_custom_roster');
      if (saved !== null) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const unique = ensureUniqueEmployeeIds(parsed);
          if (unique !== parsed) {
            localStorage.setItem('smartgroup_custom_roster', JSON.stringify(unique));
          }
          return unique;
        }
      }
    } catch (e) {
      console.error('Failed to parse roster from storage:', e);
    }
    return ensureUniqueEmployeeIds(USER_TEST_ROSTER);
  });
  const [clusters, setClusters] = useState<DepartmentCluster[]>(DEFAULT_CLUSTERS);

  // Session starts null (show login screen) unless a valid saved session exists
  const [userSession, setUserSession] = useState<UserSession | null>(() => {
    try {
      const saved = localStorage.getItem('smartgroup_auth_session');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Restore admin session from storage
        if (parsed.type === 'admin' && parsed.username) {
          return { type: 'admin', username: parsed.username };
        }
        // Employee sessions are restored separately via currentPortalUserId
        // Don't restore them here — they go through the portal path below
      }
    } catch (e) {
      console.error('Failed to parse auth session:', e);
    }
    // No saved session — show login screen
    return null;
  });

  const [appMode, setAppMode] = useState<AppMode>(() => {
    // Start in portal mode — HR console only accessible after proper admin login
    try {
      const saved = localStorage.getItem('smartgroup_auth_session');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.type === 'admin') return 'admin';
      }
    } catch { /* ignore */ }
    return 'portal';
  });
  const [activeTab, setActiveTab] = useState<'groups' | 'appraisals' | 'roster'>('groups');

  // Appraisal Submissions state: seed from localStorage cache first for instant load
  const [submissions, setSubmissions] = useState<Record<string, AppraisalSubmission>>(() => {
    return loadAppraisalsFromStorage();
  });

  // On mount: restore employee session if one was saved
  useEffect(() => {
    if (userSession) return; // already restored (e.g. admin)
    try {
      const saved = localStorage.getItem('smartgroup_auth_session');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.type === 'employee' && parsed.personId) {
          const person = people.find((p) => p.id === parsed.personId);
          if (person) {
            setUserSession({ type: 'employee', person });
            setCurrentPortalUserId(person.id);
            setAppMode('portal');
          }
        }
      }
    } catch (e) {
      console.error('Failed to restore employee session:', e);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [people]);

  // On mount: sync from Supabase and merge with local cache so all devices stay in sync
  useEffect(() => {
    syncAppraisalsFromSupabase().then((merged) => {
      setSubmissions(merged);
    });
  }, []);

  // On mount: load roster, clusters and custom groups from Supabase so all devices see the same data
  // If Supabase has data → use it (preserves any edits made on the live site)
  // If Supabase is empty → seed DEFAULT_ROSTER once and push it up
  useEffect(() => {
    loadAllFromCloud().then(({ people: cloudPeople, clusters: cloudClusters, customGroups: cloudGroups }) => {

      if (cloudPeople && cloudPeople.length > 0) {
        // Cloud has data — always use it, never overwrite with defaults
        const unique = ensureUniqueEmployeeIds(cloudPeople);
        setPeople(unique);
        localStorage.setItem('smartgroup_custom_roster', JSON.stringify(unique));
        localStorage.setItem('smartgroup_roster_reset_v8', 'true'); // mark as done
      } else {
        // Cloud is empty — seed with DEFAULT_ROSTER and push up
        const roster = ensureUniqueEmployeeIds(DEFAULT_ROSTER);
        setPeople(roster);
        saveRosterToCloud(roster);
        localStorage.setItem('smartgroup_custom_roster', JSON.stringify(roster));
        localStorage.setItem('smartgroup_roster_reset_v8', 'true');
      }

      if (cloudClusters && cloudClusters.length > 0) {
        setClusters(cloudClusters);
      }

      if (cloudGroups && cloudGroups.length > 0) {
        setCustomGroups(cloudGroups);
        localStorage.setItem('smartgroup_custom_groups_v2', JSON.stringify(cloudGroups));
      } else {
        // Clear stale local groups so panels regenerate cleanly
        localStorage.removeItem('smartgroup_custom_groups_v2');
        setCustomGroups(null);
      }
    });
  }, []);

  // Sync clusters to Supabase whenever they change
  useEffect(() => {
    saveClustersToCloud(clusters);
  }, [clusters]);

  // Ensure the user uploaded dataset is active for testing with mandated supervisor rules
  // Current logged in user in the Employee Portal
  const [currentPortalUserId, setCurrentPortalUserId] = useState<string | null>(() => {
    try {
      const saved = localStorage.getItem('smartgroup_auth_session');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.type === 'employee' && parsed.personId) {
          return parsed.personId;
        }
      }
      return localStorage.getItem('smartgroup_active_user_id') || null;
    } catch {
      return null;
    }
  });

  const [config, setConfig] = useState<GroupingConfig>({
    targetGroupSize: 7,
    minGroupSize: 6,
    maxGroupSize: 8,
    sameDeptWeight: 70,
    randomSeed: 1337,
  });

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [selectedFacility, setSelectedFacility] = useState('ALL');

  // Selected person for detail drawer
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null);

  // Modals
  const [printGroup, setPrintGroup] = useState<AllocatedGroup | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showExcelWordModal, setShowExcelWordModal] = useState(false);
  const [showAnnexAModal, setShowAnnexAModal] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = useCallback((msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification((curr) => (curr === msg ? null : curr));
    }, 3500);
  }, []);

  // Check URL parameters for direct deep-link logins (?admin=true, ?staff=EMP-001)
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const staffQuery =
        params.get('staff') ||
        params.get('employee') ||
        params.get('user') ||
        params.get('id') ||
        params.get('code') ||
        params.get('token');
      const modeQuery = params.get('mode');

      if (modeQuery === 'admin' || params.get('admin') === 'true') {
        // URL admin bypass is blocked — must go through proper login
        // Silently redirect to login instead of granting admin access
        window.history.replaceState({}, document.title, window.location.pathname);
        return;
      }

      if (staffQuery) {
        const matched = findPersonByStaffQuery(people, staffQuery);

        if (matched) {
          const empSession: UserSession = { type: 'employee', person: matched };
          setUserSession(empSession);
          setCurrentPortalUserId(matched.id);
          setAppMode('portal');
          localStorage.setItem('smartgroup_auth_session', JSON.stringify({ type: 'employee', personId: matched.id }));
          localStorage.setItem('smartgroup_active_user_id', matched.id);
          showNotification(`Welcome back, ${matched.name}!`);
          return;
        }
      }
    } catch (err) {
      console.error('Error during auto-login detection:', err);
    }
  }, [people, showNotification]);

  // Login Handler (Employee without password, or HR Admin with credentials)
  const handleLogin = useCallback((session: UserSession) => {
    setUserSession(session);
    if (session.type === 'admin') {
      localStorage.setItem('smartgroup_auth_session', JSON.stringify({ type: 'admin', username: session.username }));
      setAppMode('admin');
      showNotification('Successfully signed in as HR Administrator');
    } else {
      localStorage.setItem('smartgroup_auth_session', JSON.stringify({ type: 'employee', personId: session.person.id }));
      setCurrentPortalUserId(session.person.id);
      setAppMode('portal');
      showNotification(`Welcome, ${session.person.name}! Accessing your appraisal workspace.`);
    }
  }, [showNotification]);

  // Logout Handler
  const handleLogout = useCallback(() => {
    setUserSession(null);
    setCurrentPortalUserId(null);
    localStorage.removeItem('smartgroup_auth_session');
    localStorage.removeItem('smartgroup_active_user_id');
    localStorage.removeItem('smartgroup_last_mode');
    if (typeof window !== 'undefined' && window.history?.replaceState) {
      const url = new URL(window.location.href);
      url.search = '';
      window.history.replaceState({}, document.title, url.pathname);
    }
    showNotification('Logged out successfully.');
  }, [showNotification]);

  // Dedicated user selection and mode switching with persistence
  const handleSelectPortalUser = useCallback((userId: string | null) => {
    setCurrentPortalUserId(userId);
    if (userId) {
      localStorage.setItem('smartgroup_active_user_id', userId);
      const person = people.find((p) => p.id === userId);
      if (person) {
        setUserSession({ type: 'employee', person });
        localStorage.setItem('smartgroup_auth_session', JSON.stringify({ type: 'employee', personId: userId }));
      }
    } else {
      handleLogout();
    }
  }, [people, handleLogout]);

  const handleSetAppMode = useCallback((mode: AppMode) => {
    // Employees are NEVER allowed to access the HR admin console
    if (mode === 'admin' && userSession?.type !== 'admin') {
      showNotification('⛔ Access denied — HR Console is restricted to authorised administrators only.');
      return;
    }
    setAppMode(mode);
    localStorage.setItem('smartgroup_last_mode', mode);
  }, [userSession, showNotification]);




  // Keep localStorage updated when submissions change
  const handleUpdateSubmissions = useCallback((newSubs: Record<string, AppraisalSubmission>) => {
    setSubmissions(newSubs);
    saveAppraisalsToStorage(newSubs);
  }, []);

  const handleSaveDraft = useCallback(async (submission: AppraisalSubmission) => {
    // Save locally immediately so the UI updates without waiting for the network
    setSubmissions((prev) => {
      const updated = {
        ...prev,
        [getAppraisalKey(submission.reviewerId, submission.revieweeId)]: submission,
      };
      saveAppraisalsToStorage(updated);
      return updated;
    });

    // Sync draft to Supabase so it's available across devices
    try {
      await upsertAppraisalToSupabase(submission);
    } catch (err) {
      console.error('Draft sync to Supabase failed (saved locally):', err);
    }

    showNotification('Appraisal draft saved');
  }, []);

  const handleSubmitFinal = useCallback(async (submission: AppraisalSubmission) => {
    // Save locally first so the UI updates immediately
    setSubmissions((prev) => {
      const updated = {
        ...prev,
        [getAppraisalKey(submission.reviewerId, submission.revieweeId)]: submission,
      };
      saveAppraisalsToStorage(updated);
      return updated;
    });

    // Upsert to Supabase — handles both new submissions and re-submissions
    try {
      await upsertAppraisalToSupabase(submission);
      showNotification('Appraisal successfully finalized and submitted to HR records');
    } catch (err) {
      console.error('Supabase submit error:', err);
      showNotification('⚠️ Appraisal saved locally but failed to sync to database.');
    }
  }, []);

  const handleImportFromExcelOrWord = useCallback(
    (importedPeople: Person[], mode: 'replace' | 'append') => {
      const combined = mode === 'append' ? [...people, ...importedPeople] : importedPeople;
      const finalRoster = ensureUniqueEmployeeIds(combined);

      // Auto-discover any new departments not currently in clusters, and add them
      const existingDepts = new Set(clusters.flatMap((c) => c.departments));
      const newDepts = Array.from(new Set(importedPeople.map((p) => p.department))).filter(
        (d) => !existingDepts.has(d)
      );

      if (newDepts.length > 0) {
        setClusters((prev) => {
          const copy = [...prev];
          if (copy.length > 0) {
            copy[0] = {
              ...copy[0],
              departments: [...copy[0].departments, ...newDepts],
            };
            return copy;
          }
          return [
            {
              id: 'cluster-imported',
              name: 'Imported Departments',
              color: 'indigo',
              departments: newDepts,
            },
          ];
        });
      }

      setPeople(finalRoster);
      try {
        localStorage.setItem('smartgroup_custom_roster', JSON.stringify(finalRoster));
        localStorage.setItem('smartgroup_clean_sys_v6', 'true');
        saveRosterToCloud(finalRoster); // sync to Supabase for cross-device visibility
      } catch (e) {
        console.error('Failed to persist imported roster:', e);
      }
      showNotification(`Successfully imported ${importedPeople.length} members into roster across facilities`);
    },
    [people, clusters, showNotification]
  );

  // Compute allocation from grouping engine
  const computedAllocation: GroupAllocationResult = useMemo(() => {
    return generateAllocations(people, clusters, config);
  }, [people, clusters, config]);

  // Support custom edited groups (persisted in localStorage)
  const [customGroups, setCustomGroups] = useState<AllocatedGroup[] | null>(() => {
    try {
      const saved = localStorage.getItem('smartgroup_custom_groups_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return null;
  });

  const activeGroups = useMemo(() => {
    return customGroups || computedAllocation.groups;
  }, [customGroups, computedAllocation.groups]);

  const peopleMap = useMemo(() => {
    return new Map<string, Person>(people.map((p) => [p.id, p]));
  }, [people]);

  // Current logged in person object for portal
  const currentPortalUser = useMemo(() => {
    if (!currentPortalUserId) return null;
    return peopleMap.get(currentPortalUserId) || null;
  }, [currentPortalUserId, peopleMap]);

  // All distinct departments in current roster
  const departments = useMemo(() => {
    return Array.from(new Set(people.map((p) => p.department))).sort();
  }, [people]);

  // Handler: Rename Department across clusters and roster
  const handleRenameDepartment = useCallback(
    (oldName: string, newName: string) => {
      if (!newName.trim() || oldName === newName) return;

      setClusters((prev) =>
        prev.map((c) => ({
          ...c,
          departments: c.departments.map((d) => (d === oldName ? newName.trim() : d)),
        }))
      );

      let count = 0;
      setPeople((prev) =>
        prev.map((p) => {
          if (p.department === oldName) {
            count++;
            return { ...p, department: newName.trim() };
          }
          return p;
        })
      );

      showNotification(`Renamed "${oldName}" to "${newName}" (${count} employees updated)`);
    },
    []
  );

  // Handler: Delete Department
  const handleDeleteDepartment = useCallback(
    (deptName: string, reassignToDept?: string) => {
      setClusters((prev) =>
        prev.map((c) => ({
          ...c,
          departments: c.departments.filter((d) => d !== deptName),
        }))
      );

      if (reassignToDept) {
        setPeople((prev) =>
          prev.map((p) => (p.department === deptName ? { ...p, department: reassignToDept } : p))
        );
        showNotification(`Deleted department "${deptName}" and reassigned members to "${reassignToDept}"`);
      } else {
        showNotification(`Deleted department "${deptName}"`);
      }
    },
    []
  );

  // Handler: Rename Cluster
  const handleRenameCluster = useCallback((clusterId: string, newName: string) => {
    if (!newName.trim()) return;
    setClusters((prev) =>
      prev.map((c) => (c.id === clusterId ? { ...c, name: newName.trim() } : c))
    );
    showNotification(`Renamed cluster to "${newName.trim()}"`);
  }, []);

  // Handler: Shuffle & Regroup
  const handleShuffle = useCallback(() => {
    const newSeed = Math.floor(Math.random() * 1000000) + 1;
    setConfig((prev) => ({ ...prev, randomSeed: newSeed }));
    showNotification('Randomly re-allocated all members with a fresh shuffle');
  }, []);

  // Handler: Target Size Change
  const handleTargetSizeChange = useCallback((newSize: number) => {
    setConfig((prev) => ({
      ...prev,
      targetGroupSize: newSize,
      minGroupSize: Math.max(3, newSize - 1),
      maxGroupSize: newSize + 1,
    }));
  }, []);

  // Handler: Move member from one group to another
  const handleMoveMember = useCallback(
    (personId: string, targetGroupId: string) => {
      const currentList = customGroups || computedAllocation.groups;
      const currentGroup = currentList.find((g) => g.memberIds.includes(personId));
      const targetGroup = currentList.find((g) => g.id === targetGroupId);
      if (!currentGroup || !targetGroup) return;

      // Prevent self-reviews
      if (targetGroup.revieweeId === personId) {
        showNotification('Cannot move: an employee cannot serve on the panel reviewing themselves.');
        return;
      }

      const updated = currentList.map((g) => {
        if (g.id === currentGroup.id) {
          return { ...g, memberIds: g.memberIds.filter((id) => id !== personId) };
        }
        if (g.id === targetGroup.id) {
          return { ...g, memberIds: g.memberIds.includes(personId) ? g.memberIds : [...g.memberIds, personId] };
        }
        return g;
      });

      setCustomGroups(updated);
      try {
        localStorage.setItem('smartgroup_custom_groups_v2', JSON.stringify(updated));
        saveCustomGroupsToCloud(updated);
      } catch (e) {
        console.error(e);
      }
      showNotification('Reviewer moved to target group panel.');
    },
    [customGroups, computedAllocation.groups, showNotification]
  );

  // Handler: Swap 2 members between groups
  const handleSwapMembers = useCallback(
    (personId1: string, personId2: string) => {
      const currentList = customGroups || computedAllocation.groups;
      const group1 = currentList.find((g) => g.memberIds.includes(personId1));
      const group2 = currentList.find((g) => g.memberIds.includes(personId2));
      if (!group1 || !group2 || group1.id === group2.id) return;

      if (group1.revieweeId === personId2 || group2.revieweeId === personId1) {
        showNotification('Cannot swap: an employee cannot review themselves.');
        return;
      }

      const updated = currentList.map((g) => {
        if (g.id === group1.id) {
          return { ...g, memberIds: g.memberIds.map((id) => (id === personId1 ? personId2 : id)) };
        }
        if (g.id === group2.id) {
          return { ...g, memberIds: g.memberIds.map((id) => (id === personId2 ? personId1 : id)) };
        }
        return g;
      });

      setCustomGroups(updated);
      try {
        localStorage.setItem('smartgroup_custom_groups_v2', JSON.stringify(updated));
        saveCustomGroupsToCloud(updated);
      } catch (e) {
        console.error(e);
      }
      showNotification('Swapped reviewers between panels');
    },
    [customGroups, computedAllocation.groups, showNotification]
  );

  // Handler: Update an individual group (from EditPanelModal)
  const handleUpdateGroup = useCallback(
    (updatedGroup: AllocatedGroup) => {
      setCustomGroups((prev) => {
        const currentList = prev || computedAllocation.groups;
        const updated = currentList.map((g) => (g.id === updatedGroup.id ? updatedGroup : g));
        try {
          localStorage.setItem('smartgroup_custom_groups_v2', JSON.stringify(updated));
          saveCustomGroupsToCloud(updated);
        } catch (e) {
          console.error(e);
        }
        return updated;
      });
      showNotification(`Saved changes to review panel for ${updatedGroup.name}.`);
    },
    [computedAllocation.groups, showNotification]
  );

  // Handler: Delete an individual panel
  const handleDeleteGroup = useCallback(
    (groupId: string) => {
      setCustomGroups((prev) => {
        const currentList = prev || computedAllocation.groups;
        const updated = currentList.filter((g) => g.id !== groupId);
        try {
          localStorage.setItem('smartgroup_custom_groups_v2', JSON.stringify(updated));
          saveCustomGroupsToCloud(updated);
        } catch (e) {
          console.error(e);
        }
        return updated;
      });
      showNotification('Review panel deleted successfully.');
    },
    [computedAllocation.groups, showNotification]
  );

  // Handler: Create a new custom panel
  const handleCreateGroup = useCallback(
    (newGroup: AllocatedGroup) => {
      setCustomGroups((prev) => {
        const currentList = prev || computedAllocation.groups;
        const updated = [newGroup, ...currentList];
        try {
          localStorage.setItem('smartgroup_custom_groups_v2', JSON.stringify(updated));
          saveCustomGroupsToCloud(updated);
        } catch (e) {
          console.error(e);
        }
        return updated;
      });
      showNotification(`Created review panel for ${newGroup.name}.`);
    },
    [computedAllocation.groups, showNotification]
  );

  // Handler: Immediate Reset and Re-generation of Panels with Mandated Supervisors
  const handleResetSupervisorAllocations = useCallback(() => {
    setCustomGroups(null);
    try {
      localStorage.removeItem('smartgroup_custom_groups_v2');
    } catch (e) {
      console.error(e);
    }
    setConfig((prev) => ({
      ...prev,
      randomSeed: Math.floor(Math.random() * 900000) + 100000,
    }));
    showNotification('System reset successfully! All 117 panels re-generated with mandated line supervisors locked in position 1.');
  }, [showNotification]);

  // Handler: Update Roster
  const handleUpdatePeople = useCallback(
    (newPeople: Person[]) => {
      const unique = ensureUniqueEmployeeIds(newPeople);
      setPeople(unique);
      try {
        localStorage.setItem('smartgroup_custom_roster', JSON.stringify(unique));
        saveRosterToCloud(unique); // sync to Supabase so other devices see the change
      } catch (e) {
        console.error('Failed to save custom roster:', e);
      }
      showNotification(`Updated roster (${newPeople.length} employees)`);
    },
    [showNotification]
  );

  // Handler: Clear All Data
  const handleClearAllData = useCallback(() => {
    setPeople([]);
    setSubmissions({});
    try {
      localStorage.setItem('smartgroup_custom_roster', JSON.stringify([]));
      localStorage.removeItem('smartgroup_appraisals');
      localStorage.removeItem('smartgroup_active_user_id');
      localStorage.setItem('smartgroup_clean_sys_v6', 'true');
    } catch (e) {
      console.error('Failed to clear storage:', e);
    }
    showNotification('System cleaned! All previous personnel and evaluations have been removed. Ready for your new document.');
  }, [showNotification]);

  // Handler: Restore 2026 Schedule Dataset (117 Staff)
  const handleRestoreSampleData = useCallback(() => {
    setPeople(USER_TEST_ROSTER);
    setSubmissions({});
    try {
      localStorage.setItem('smartgroup_custom_roster', JSON.stringify(USER_TEST_ROSTER));
      localStorage.removeItem('smartgroup_appraisals');
      localStorage.removeItem('smartgroup_active_user_id');
      localStorage.setItem('smartgroup_user_data_2026_applied', 'true');
    } catch (e) {
      console.error('Failed to restore test data:', e);
    }
    showNotification('Reloaded 2026 Schedule & Facilities dataset (117 staff across 7 facilities).');
  }, [showNotification]);

  const totalSubmittedSubmissionsCount = useMemo(() => {
    return Object.values(submissions).filter((s) => s.status === 'submitted').length;
  }, [submissions]);

  // If not authenticated, show the dedicated Login Page
  if (!userSession) {
    return (
      <>
        {notification && (
          <div className="fixed bottom-4 right-4 z-50 bg-slate-900 text-white text-xs px-4 py-2.5 rounded-lg shadow-lg flex items-center gap-2 border border-slate-700 animate-in fade-in slide-in-from-bottom-2">
            <span>{notification}</span>
          </div>
        )}
        <LoginPage people={people} onLogin={handleLogin} />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F6F9] flex flex-col text-[#0A192F] selection:bg-[#FFC700] selection:text-[#0A192F]">
      {/* Notification Toast */}
      {notification && (
        <div className="fixed bottom-4 right-4 z-50 bg-[#0A192F] text-white text-xs px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 border border-[#FFC700]/70 animate-in fade-in slide-in-from-bottom-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#FFC700] shadow-[0_0_8px_#FFC700] shrink-0"></span>
          <span className="font-semibold">{notification}</span>
        </div>
      )}

      {/* Top Navbar */}
      <Navbar
        appMode={appMode}
        setAppMode={handleSetAppMode}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onShuffle={handleShuffle}
        onExport={() => setShowExportModal(true)}
        onOpenImport={() => setShowExcelWordModal(true)}
        onOpenAnnexA={() => setShowAnnexAModal(true)}
        totalPeople={people.length}
        totalSubmissions={totalSubmittedSubmissionsCount}
        currentUserName={currentPortalUser?.name}
        session={userSession}
        onLogout={handleLogout}
        onClearAllData={handleClearAllData}
      />

      {/* Statistics and Filter Strip (Shown in Admin Console on Review Panels tab) */}
      {appMode === 'admin' && activeTab === 'groups' && (
        <StatsBar
          stats={computedAllocation.stats}
          targetGroupSize={config.targetGroupSize}
          onTargetSizeChange={handleTargetSizeChange}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedDept={selectedDept}
          onDeptChange={setSelectedDept}
          selectedFacility={selectedFacility}
          onFacilityChange={setSelectedFacility}
          departments={departments}
          onOpenAnnexA={() => setShowAnnexAModal(true)}
        />
      )}

      {/* Main Viewport Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Banner when roster is completely clean */}
        {people.length === 0 && appMode === 'admin' && (
          <div className="mb-6 bg-white border border-[#FFC700]/60 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#0A192F] text-[#FFD700] flex items-center justify-center shrink-0 border border-[#FFC700]/40 shadow-xs">
                <FileSpreadsheet className="w-6 h-6 text-[#FFD700]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    System Cleaned
                  </span>
                </div>
                <h2 className="text-lg font-black text-[#0A192F] mt-1">
                  Ready for Your New Data Document
                </h2>
                <p className="text-xs text-slate-600 mt-0.5">
                  All previous personnel and evaluations have been removed. You can now import your new Excel workbook (including multi-sheet files with facilities or departments), paste data, or formulate records manually.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 self-stretch md:self-auto shrink-0">
              <button
                onClick={() => setShowExcelWordModal(true)}
                className="w-full md:w-auto px-4 py-2.5 bg-[#FFC700] hover:bg-[#F5B800] text-[#0A192F] font-black text-xs rounded-xl shadow-md shadow-[#FFC700]/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4 text-[#0A192F]" />
                <span>Import Excel Document</span>
              </button>
            </div>
          </div>
        )}

        {/* Banner when an Employee is viewing the HR & Admin Console */}
        {userSession.type === 'employee' && appMode === 'admin' && (
          <div className="mb-6 bg-[#0A192F] text-white rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs border border-[#1E3A5F] shadow-sm">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FFC700] shadow-[0_0_8px_#FFC700]"></span>
              <div>
                <span className="text-slate-300">Viewing HR Console as Staff:</span>{' '}
                <strong className="text-white">{userSession.person.name}</strong>{' '}
                <span className="text-[#FFD700] font-semibold">({userSession.person.role} · {userSession.person.department})</span>
              </div>
            </div>
            <button
              onClick={() => handleSetAppMode('portal')}
              className="px-4 py-2 bg-[#FFC700] hover:bg-[#F5B800] text-[#0A192F] font-black rounded-xl shrink-0 transition-all cursor-pointer shadow-md shadow-[#FFC700]/25"
            >
              Return to My Appraisals →
            </button>
          </div>
        )}

        {/* EMPLOYEE APPRAISAL PORTAL MODE */}
        {appMode === 'portal' && (
          <AppraisalPortalView
            people={people}
            groups={activeGroups}
            clusters={clusters}
            submissions={submissions}
            onSaveDraft={handleSaveDraft}
            onSubmitFinal={handleSubmitFinal}
            currentUserId={currentPortalUserId}
            onSelectUser={handleSelectPortalUser}
          />
        )}

        {/* HR & ADMIN CONSOLE MODE: 3 ESSENTIAL TABS */}
        {appMode === 'admin' && (
          <>
            {activeTab === 'groups' && (
              <GroupsView
                groups={activeGroups}
                peopleMap={peopleMap}
                clusters={clusters}
                allPeople={people}
                onSwapMembers={handleSwapMembers}
                onMoveMember={handleMoveMember}
                onSelectPerson={(id) => {
                  setSelectedPersonId(id);
                  setActiveTab('roster');
                }}
                onPrintGroup={(group) => setPrintGroup(group)}
                searchQuery={searchQuery}
                selectedDept={selectedDept}
                selectedFacility={selectedFacility}
                onOpenAnnexA={() => setShowAnnexAModal(true)}
                onResetAllocations={handleResetSupervisorAllocations}
                onUpdateGroup={handleUpdateGroup}
                onDeleteGroup={handleDeleteGroup}
                onCreateGroup={handleCreateGroup}
              />
            )}

            {activeTab === 'appraisals' && (
              <HRAppraisalDashboard
                people={people}
                groups={activeGroups}
                clusters={clusters}
                submissions={submissions}
                onUpdateSubmissions={handleUpdateSubmissions}
                onSelectEmployeeInPortal={(personId) => {
                  handleSelectPortalUser(personId);
                  handleSetAppMode('portal');
                }}
                onOpenAnnexA={() => setShowAnnexAModal(true)}
              />
            )}

            {activeTab === 'roster' && (
              <RosterView
                people={people}
                onUpdatePeople={handleUpdatePeople}
                clusters={clusters}
                onUpdateClusters={setClusters}
                onExportRosterCsv={() => setShowExportModal(true)}
                onOpenExcelWordImport={() => setShowExcelWordModal(true)}
                onClearAllData={handleClearAllData}
                onRestoreSampleData={handleRestoreSampleData}
              />
            )}
          </>
        )}
      </main>

      {/* Executive Navy Footer */}
      <footer className="border-t border-[#132E52] bg-[#0A192F] py-6 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#FFC700] shadow-[0_0_6px_#FFC700]"></span>
            <strong className="text-white">SmartGroup 360°</strong>
            <span className="text-slate-500">·</span>
            <span className="text-slate-300">Reciprocal Peer Performance Evaluation System</span>
          </div>
          <div className="flex items-center gap-3 text-slate-400 text-[11px]">
            <span>Mode: <span className="text-[#FFD700] font-semibold">{appMode === 'admin' ? 'HR Console' : 'Employee Portal'}</span></span>
            <span className="text-slate-600">·</span>
            <span>Panels: <span className="text-white font-mono">{activeGroups.length}</span></span>
            <span className="text-slate-600">·</span>
            <span className="text-slate-300">18 Annex A Mandates</span>
          </div>
        </div>
      </footer>

      {/* Printable Group Modal */}
      {printGroup && (
        <PrintableGroupSheetModal
          group={printGroup}
          peopleMap={peopleMap}
          clusters={clusters}
          onClose={() => setPrintGroup(null)}
        />
      )}

      {/* Export Modal */}
      {showExportModal && (
        <ExportModal
          isOpen={showExportModal}
          onClose={() => setShowExportModal(false)}
          people={people}
          groups={activeGroups}
          memberToGroupMap={computedAllocation.memberToGroupMap}
          peopleMap={peopleMap}
          clusters={clusters}
        />
      )}

      {/* Excel / Word Import Modal */}
      {showExcelWordModal && (
        <ExcelWordImportModal
          isOpen={showExcelWordModal}
          onClose={() => setShowExcelWordModal(false)}
          onImport={handleImportFromExcelOrWord}
          existingCount={people.length}
          existingIds={people.map((p) => p.id)}
          clusters={clusters}
        />
      )}

      {/* Annex A Specifications Modal */}
      {showAnnexAModal && (
        <AnnexASpecificationsModal
          isOpen={showAnnexAModal}
          onClose={() => setShowAnnexAModal(false)}
          people={people}
          groups={activeGroups}
          peopleMap={peopleMap}
          onSelectGroup={(groupId) => {
            setAppMode('admin');
            setActiveTab('groups');
            const grp = activeGroups.find((g) => g.id === groupId);
            if (grp) {
              const reviewee = peopleMap.get(grp.revieweeId);
              if (reviewee) {
                setSearchQuery(reviewee.name);
              }
            }
          }}
        />
      )}
    </div>
  );
}
