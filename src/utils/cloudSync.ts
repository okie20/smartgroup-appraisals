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

// ─── Roster ──────────────────────────────────────────────────────────────────

export async function saveRosterToCloud(people: Person[]): Promise<void> {
  const { error } = await supabase
    .from('roster')
    .upsert([{ id: SINGLETON_ID, data: people, updated_at: new Date().toISOString() }], { onConflict: 'id' });
  if (error) console.error('Failed to save roster to Supabase:', error.message);
}

export async function loadRosterFromCloud(): Promise<Person[] | null> {
  const { data, error } = await supabase
    .from('roster')
    .select('data')
    .eq('id', SINGLETON_ID)
    .maybeSingle();
  if (error) { console.error('Failed to load roster from Supabase:', error.message); return null; }
  return (data?.data as Person[]) ?? null;
}

// ─── Clusters ────────────────────────────────────────────────────────────────

export async function saveClustersToCloud(clusters: DepartmentCluster[]): Promise<void> {
  const { error } = await supabase
    .from('clusters')
    .upsert([{ id: SINGLETON_ID, data: clusters, updated_at: new Date().toISOString() }], { onConflict: 'id' });
  if (error) console.error('Failed to save clusters to Supabase:', error.message);
}

export async function loadClustersFromCloud(): Promise<DepartmentCluster[] | null> {
  const { data, error } = await supabase
    .from('clusters')
    .select('data')
    .eq('id', SINGLETON_ID)
    .maybeSingle();
  if (error) { console.error('Failed to load clusters from Supabase:', error.message); return null; }
  return (data?.data as DepartmentCluster[]) ?? null;
}

// ─── Custom Groups ────────────────────────────────────────────────────────────

export async function saveCustomGroupsToCloud(groups: AllocatedGroup[]): Promise<void> {
  const { error } = await supabase
    .from('custom_groups')
    .upsert([{ id: SINGLETON_ID, data: groups, updated_at: new Date().toISOString() }], { onConflict: 'id' });
  if (error) console.error('Failed to save custom groups to Supabase:', error.message);
}

export async function loadCustomGroupsFromCloud(): Promise<AllocatedGroup[] | null> {
  const { data, error } = await supabase
    .from('custom_groups')
    .select('data')
    .eq('id', SINGLETON_ID)
    .maybeSingle();
  if (error) { console.error('Failed to load custom groups from Supabase:', error.message); return null; }
  return (data?.data as AllocatedGroup[]) ?? null;
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
