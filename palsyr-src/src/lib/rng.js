// Seeded PRNG (mulberry32) so world generation is deterministic, while
// gameplay rolls (catches, battles, breeding) use the unseeded variant.

export function mulberry32(seed) {
  let a = seed
  return function () {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function randInt(min, max, rand = Math.random) {
  return Math.floor(rand() * (max - min + 1)) + min
}

export function pick(arr, rand = Math.random) {
  return arr[Math.floor(rand() * arr.length)]
}

export function chance(p, rand = Math.random) {
  return rand() < p
}

export function uid(prefix = 'id') {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
}
