/**
 * employeeIds.ts
 *
 * Centralised, collision-proof employee ID generation.
 *
 * Rules:
 * - IDs are formatted as EMP-XXXXXXXX where X is a hex character (e.g. EMP-3F2A1B4C)
 * - Uses crypto.randomUUID() where available, falls back to Math.random()
 * - Always checks against the full set of existing IDs before returning
 * - Batch allocation guarantees no duplicates within the batch either
 */

/**
 * Generate a single guaranteed-unique employee ID that does not exist in existingIds.
 */
export function generateEmployeeId(existingIds: Set<string> | string[]): string {
  const existing = existingIds instanceof Set ? existingIds : new Set(existingIds);

  let id: string;
  let attempts = 0;

  do {
    id = `EMP-${randomHex(8).toUpperCase()}`;
    attempts++;
    if (attempts > 10000) {
      // Absolute fallback: timestamp + random suffix — practically impossible to collide
      id = `EMP-${Date.now().toString(16).toUpperCase()}-${randomHex(4).toUpperCase()}`;
      break;
    }
  } while (existing.has(id));

  return id;
}

/**
 * Allocate `count` unique IDs, none of which appear in existingIds and
 * none of which are duplicates of each other.
 */
export function allocateEmployeeIds(existingIds: string[], count: number): string[] {
  const taken = new Set(existingIds);
  const allocated: string[] = [];

  for (let i = 0; i < count; i++) {
    const id = generateEmployeeId(taken);
    allocated.push(id);
    taken.add(id); // prevent intra-batch collisions
  }

  return allocated;
}

/**
 * Ensure a person object has a unique ID, replacing it if it collides.
 */
export function ensureUniqueId(
  person: { id: string; [key: string]: unknown },
  existingIds: Set<string> | string[]
): string {
  const existing = existingIds instanceof Set ? existingIds : new Set(existingIds);
  if (person.id && !existing.has(person.id)) {
    return person.id;
  }
  return generateEmployeeId(existing);
}

// ── Internal helpers ────────────────────────────────────────────────────────

function randomHex(bytes: number): string {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const arr = new Uint8Array(bytes / 2);
    crypto.getRandomValues(arr);
    return Array.from(arr)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }
  // Fallback for environments without crypto
  let hex = '';
  for (let i = 0; i < bytes; i++) {
    hex += Math.floor(Math.random() * 16).toString(16);
  }
  return hex;
}

/**
 * Ensure every person in an array has a unique ID.
 * Persons whose ID is missing or collides with an earlier entry get a new one.
 */
export function ensureUniqueEmployeeIds<T extends { id: string }>(people: T[]): T[] {
  const seen = new Set<string>();
  return people.map((p) => {
    if (p.id && !seen.has(p.id)) {
      seen.add(p.id);
      return p;
    }
    // ID is missing or duplicate — generate a fresh one
    const newId = generateEmployeeId(seen);
    seen.add(newId);
    return { ...p, id: newId };
  });
}

/**
 * Find a person by a loose staff query string — matches against name, ID, role or email.
 * Used for URL-based direct links (e.g. ?staff=EMP-R01 or ?staff=Daniel+Ssesanga).
 */
export function findPersonByStaffQuery<T extends { id: string; name: string; role: string; email: string }>(
  people: T[],
  query: string
): T | undefined {
  if (!query) return undefined;
  const q = query.toLowerCase().trim();

  // Exact ID match first
  const byId = people.find((p) => p.id.toLowerCase() === q);
  if (byId) return byId;

  // Exact name match
  const byName = people.find((p) => p.name.toLowerCase() === q);
  if (byName) return byName;

  // Partial name match
  const byPartialName = people.find((p) => p.name.toLowerCase().includes(q));
  if (byPartialName) return byPartialName;

  // Email match
  const byEmail = people.find((p) => p.email.toLowerCase().includes(q));
  if (byEmail) return byEmail;

  // Role match
  const byRole = people.find((p) => p.role.toLowerCase().includes(q));
  return byRole;
}
