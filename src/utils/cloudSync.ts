/**
 * cloudSync.ts
 *
 * Syncs roster, clusters, and custom groups to/from Supabase so that
 * any change made on one device is immediately visible on all others.
 *
 * Strategy:
 * - Each collection is stored as a single JSONB row keyed by a fixed ID
 *   ('singleton'). This keeps queries simple and avoids per-row RLS complexity.
 * - On every write: update Supabase + localStorage (fast local cache).
 * - On app mount: pull from Supabase; if newer than local, update state.
 */

import { supabase } from '../supabaseClient';
import { Person, DepartmentCluster, AllocatedGroup } from '../types';

const SINGLETON_ID = 'singleton';

// Timeout wrapper — prevents cloud calls hanging the UI
function withTimeout<T>(promise: Promise<T>, ms = 8000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`Cloud sync timeout after ${ms}ms`)), ms)
    ),
  ]);
}

// ─── Roster ──────────────────────────────────────────────────────────────────

export async function saveRosterToCloud(people: Person[]): Promise<void> {
  try {
    await withTimeout(supabase.from('roster').upsert([{ id: SINGLETON_ID, data: people, updated_at: new Date().toISOString() }], { onConflict: 'id' }));
  } catch (e) { console.error('saveRosterToCloud failed:', e); }
}

export async function loadRosterFromCloud(): Promise<Person[] | null> {
  try {
    const { data, error } = await withTimeout(supabase.from('roster').select('data').eq('id', SINGLETON_ID).maybeSingle()) as { data: any; error: any };
    if (error) { console.error('loadRosterFromCloud failed:', error.message); return null; }
    return (data?.data as Person[]) ?? null;
  } catch (e) { console.error('loadRosterFromCloud timeout:', e); return null; }
}

// ─── Clusters ────────────────────────────────────────────────────────────────

export async function saveClustersToCloud(clusters: DepartmentCluster[]): Promise<void> {
  try {
    await withTimeout(supabase.from('clusters').upsert([{ id: SINGLETON_ID, data: clusters, updated_at: new Date().toISOString() }], { onConflict: 'id' }));
  } catch (e) { console.error('saveClustersToCloud failed:', e); }
}

export async function loadClustersFromCloud(): Promise<DepartmentCluster[] | null> {
  try {
    const { data, error } = await withTimeout(supabase.from('clusters').select('data').eq('id', SINGLETON_ID).maybeSingle()) as { data: any; error: any };
    if (error) { console.error('loadClustersFromCloud failed:', error.message); return null; }
    return (data?.data as DepartmentCluster[]) ?? null;
  } catch (e) { console.error('loadClustersFromCloud timeout:', e); return null; }
}

// ─── Custom Groups ────────────────────────────────────────────────────────────

export async function saveCustomGroupsToCloud(groups: AllocatedGroup[]): Promise<void> {
  try {
    await withTimeout(supabase.from('custom_groups').upsert([{ id: SINGLETON_ID, data: groups, updated_at: new Date().toISOString() }], { onConflict: 'id' }));
  } catch (e) { console.error('saveCustomGroupsToCloud failed:', e); }
}

export async function loadCustomGroupsFromCloud(): Promise<AllocatedGroup[] | null> {
  try {
    const { data, error } = await withTimeout(supabase.from('custom_groups').select('data').eq('id', SINGLETON_ID).maybeSingle()) as { data: any; error: any };
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

/**
 * Pull all shared state from Supabase in a single parallel fetch.
 * Returns null for any collection that hasn't been saved to cloud yet.
 */
export async function loadAllFromCloud(): Promise<CloudSnapshot> {
  const [people, clusters, customGroups] = await Promise.all([
    loadRosterFromCloud(),
    loadClustersFromCloud(),
    loadCustomGroupsFromCloud(),
  ]);
  return { people, clusters, customGroups };
}
