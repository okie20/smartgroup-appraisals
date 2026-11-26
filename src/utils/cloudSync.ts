import { supabase } from '../supabaseClient';
import { Person, DepartmentCluster, AllocatedGroup } from '../types';

const SINGLETON_ID = 'singleton';

// Timeout wrapper — converts Supabase thenable to real Promise with timeout
function withTimeout<T>(thenable: PromiseLike<T>, ms = 8000): Promise<T> {
  return Promise.race([
    Promise.resolve(thenable),
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`Cloud sync timeout after ${ms}ms`)), ms)
    ),
  ]);
}

// ─── Roster ───────────────────────────────────────────────────────────────────

export async function saveRosterToCloud(people: Person[]): Promise<void> {
  try {
    await withTimeout(supabase.from('roster').upsert(
      [{ id: SINGLETON_ID, data: people, updated_at: new Date().toISOString() }],
      { onConflict: 'id' }
    ));
  } catch (e) { console.error('saveRosterToCloud failed:', e); }
}

export async function loadRosterFromCloud(): Promise<Person[] | null> {
  try {
    const { data, error } = await withTimeout(
      supabase.from('roster').select('data').eq('id', SINGLETON_ID).maybeSingle()
    ) as { data: any; error: any };
    if (error) { console.error('loadRosterFromCloud failed:', error.message); return null; }
    return (data?.data as Person[]) ?? null;
  } catch (e) { console.error('loadRosterFromCloud timeout:', e); return null; }
}

// ─── Clusters ─────────────────────────────────────────────────────────────────

export async function saveClustersToCloud(clusters: DepartmentCluster[]): Promise<void> {
  try {
    await withTimeout(supabase.from('clusters').upsert(
      [{ id: SINGLETON_ID, data: clusters, updated_at: new Date().toISOString() }],
      { onConflict: 'id' }
    ));
  } catch (e) { console.error('saveClustersToCloud failed:', e); }
}

export async function loadClustersFromCloud(): Promise<DepartmentCluster[] | null> {
  try {
    const { data, error } = await withTimeout(
      supabase.from('clusters').select('data').eq('id', SINGLETON_ID).maybeSingle()
    ) as { data: any; error: any };
    if (error) { console.error('loadClustersFromCloud failed:', error.message); return null; }
    return (data?.data as DepartmentCluster[]) ?? null;
  } catch (e) { console.error('loadClustersFromCloud timeout:', e); return null; }
}

// ─── Custom Groups ────────────────────────────────────────────────────────────

export async function saveCustomGroupsToCloud(groups: AllocatedGroup[]): Promise<void> {
  try {
    await withTimeout(supabase.from('custom_groups').upsert(
      [{ id: SINGLETON_ID, data: groups, updated_at: new Date().toISOString() }],
      { onConflict: 'id' }
    ));
  } catch (e) { console.error('saveCustomGroupsToCloud failed:', e); }
}

export async function loadCustomGroupsFromCloud(): Promise<AllocatedGroup[] | null> {
  try {
    const { data, error } = await withTimeout(
      supabase.from('custom_groups').select('data').eq('id', SINGLETON_ID).maybeSingle()
    ) as { data: any; error: any };
    if (error) { console.error('loadCustomGroupsFromCloud failed:', error.message); return null; }
    return (data?.data as AllocatedGroup[]) ?? null;
  } catch (e) { console.error('loadCustomGroupsFromCloud timeout:', e); return null; }
}

// ─── Full app sync on mount ───────────────────────────────────────────────────

export interface CloudSnapshot {
  people: Person[] | null;
  clusters: DepartmentCluster[] | null;
  customGroups: AllocatedGroup[] | null;
}

export async function loadAllFromCloud(): Promise<CloudSnapshot> {
  const [people, clusters, customGroups] = await Promise.all([
    loadRosterFromCloud(),
    loadClustersFromCloud(),
    loadCustomGroupsFromCloud(),
  ]);
  return { people, clusters, customGroups };
}
