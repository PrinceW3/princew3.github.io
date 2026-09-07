// Thin localStorage wrapper. All game persistence flows through here so the
// storage backend could be swapped later without touching call sites.

const NS = 'palsyr:'

export function loadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(NS + key)
    if (raw == null) return fallback
    return JSON.parse(raw)
  } catch {
    return fallback
  }
}

export function saveJSON(key, value) {
  try {
    localStorage.setItem(NS + key, JSON.stringify(value))
  } catch {
    // storage full or unavailable - fail silently, game still runs in-memory
  }
}

export function removeKey(key) {
  try {
    localStorage.removeItem(NS + key)
  } catch {
    /* noop */
  }
}

export function localDateString(date = new Date()) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function daysBetween(dateStrA, dateStrB) {
  const a = new Date(dateStrA + 'T00:00:00')
  const b = new Date(dateStrB + 'T00:00:00')
  return Math.round((b - a) / 86400000)
}
