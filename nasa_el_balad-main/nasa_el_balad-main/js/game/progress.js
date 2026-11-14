// Tracks which NASA objects the child has explored on each planet, plus which
// planet they are standing on. The challenge reads this so it only ever tests
// stories that were actually shown to them.
const explored = {}; // planet -> Set(objectId)
const certified = new Set();
let planet = null;
const listeners = new Set();

const emit = () => listeners.forEach((fn) => fn());

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function setPlanet(name) {
  const next = name || null;
  if (next === planet) return;
  planet = next;
  emit();
}

export const getPlanet = () => planet;

export function markExplored(planetName, id) {
  if (!planetName || !id) return;
  const set = explored[planetName] || (explored[planetName] = new Set());
  if (set.has(id)) return;
  set.add(id);
  emit();
}

export const exploredIds = (planetName) => Array.from(explored[planetName] || []);

export const exploredCount = (planetName) => (explored[planetName] ? explored[planetName].size : 0);

export function markCertificateEarned(planetName) {
  if (!planetName || certified.has(planetName)) return;
  certified.add(planetName);
  emit();
}

export const hasCertificate = (planetName) => certified.has(planetName);