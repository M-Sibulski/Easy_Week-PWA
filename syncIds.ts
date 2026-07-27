export const createSyncId = (prefix: string): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}_${crypto.randomUUID()}`;
  }

  // Secure fallback using crypto.getRandomValues when randomUUID is unavailable
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    const bytes = crypto.getRandomValues(new Uint8Array(8));
    const hex = Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('');
    return `${prefix}_${Date.now().toString(36)}_${hex}`;
  }

  // Last-resort fallback for environments without any crypto support (non-browser contexts)
  const timestamp = Date.now().toString(36);
  const counter = (typeof globalThis.__ewSyncCounter === 'number'
    ? ++globalThis.__ewSyncCounter
    : (globalThis.__ewSyncCounter = 0)
  ).toString(36);
  return `${prefix}_${timestamp}_${counter}`;
};