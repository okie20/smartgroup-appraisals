/**
 * Employee numbers are the key in groups, appraisals, and ?staff= links.
 * Numbering from the list length reuses an ID after someone is removed,
 * so a new link opens the person who already has that number.
 */

export function allocateEmployeeIds(reservedIds: Iterable<string>, count: number): string[] {
  const taken = new Set<string>();
  let maxNum = 0;

  for (const raw of reservedIds) {
    const id = (raw || '').trim();
    if (!id) continue;
    taken.add(id.toLowerCase());
    const match = /^emp-(\d+)$/i.exec(id);
    if (!match) continue;
    const n = Number.parseInt(match[1], 10);
    if (Number.isFinite(n) && n > maxNum) maxNum = n;
  }

  const ids: string[] = [];
  let next = maxNum;
  while (ids.length < count) {
    next += 1;
    const id = `EMP-${String(next).padStart(3, '0')}`;
    const key = id.toLowerCase();
    if (taken.has(key)) continue;
    taken.add(key);
    ids.push(id);
  }
  return ids;
}

/** Keep the first person on a shared ID. Later copies get a new number. */
export function ensureUniqueEmployeeIds<T extends { id: string }>(people: T[]): T[] {
  const seen = new Set<string>();
  const needsNew = new Set<number>();

  people.forEach((person, index) => {
    const key = (person.id || '').trim().toLowerCase();
    if (!key || seen.has(key)) {
      needsNew.add(index);
      return;
    }
    seen.add(key);
  });

  if (needsNew.size === 0) return people;

  const keptIds = people.filter((_, index) => !needsNew.has(index)).map((person) => person.id);
  const fresh = allocateEmployeeIds(keptIds, needsNew.size);
  let cursor = 0;

  return people.map((person, index) => {
    if (!needsNew.has(index)) return person;
    const id = fresh[cursor];
    cursor += 1;
    return { ...person, id };
  });
}

export function findPersonByStaffQuery<T extends { id: string; email: string; name: string }>(
  people: T[],
  staffQuery: string
): T | null {
  const q = staffQuery.trim().toLowerCase();
  if (!q) return null;
  const compact = q.replace(/[^a-z0-9]/g, '');

  const exactId = people.filter((p) => (p.id || '').trim().toLowerCase() === q);
  if (exactId.length === 1) return exactId[0];
  if (exactId.length > 1) return null;

  const compactId = people.filter(
    (p) => (p.id || '').toLowerCase().replace(/[^a-z0-9]/g, '') === compact
  );
  if (compactId.length === 1) return compactId[0];
  if (compactId.length > 1) return null;

  const byEmail = people.filter((p) => (p.email || '').toLowerCase() === q);
  if (byEmail.length === 1) return byEmail[0];

  const byName = people.filter((p) => (p.name || '').toLowerCase() === q);
  if (byName.length === 1) return byName[0];

  return null;
}
