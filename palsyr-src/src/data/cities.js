// City definitions: fixed coordinates on the 60x40 world grid.
// Tier is computed by distance from the hub (Havenmere) - closer = easier
// outskirts trainers, farther = harder. Hub itself is tier 0.

export const HUB_ID = 'havenmere'

export const CITIES = [
  {
    id: 'havenmere',
    name: 'Havenmere',
    x: 29,
    y: 19,
    biome: 'grass',
    buildings: [
      { type: 'market', dx: -1, dy: -1 },
      { type: 'nursery', dx: 1, dy: -1 },
      { type: 'pound', dx: 0, dy: 1 },
    ],
  },
  {
    id: 'rootwood',
    name: 'Rootwood',
    x: 9,
    y: 9,
    biome: 'forest',
    buildings: [{ type: 'nursery', dx: 0, dy: 1 }],
  },
  {
    id: 'suncrag',
    name: 'Suncrag',
    x: 49,
    y: 7,
    biome: 'desert',
    buildings: [{ type: 'market', dx: 0, dy: 1 }],
  },
  {
    id: 'tideport',
    name: 'Tideport',
    x: 7,
    y: 31,
    biome: 'coast',
    buildings: [{ type: 'pound', dx: 0, dy: 1 }],
  },
  {
    id: 'windmere',
    name: 'Windmere',
    x: 50,
    y: 32,
    biome: 'grass',
    buildings: [{ type: 'market', dx: 0, dy: 1 }],
  },
  {
    id: 'ashglen',
    name: 'Ashglen',
    x: 30,
    y: 35,
    biome: 'forest',
    buildings: [{ type: 'pound', dx: 0, dy: -1 }],
  },
]

function dist(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y)
}

export function cityTiers() {
  const hub = CITIES.find((c) => c.id === HUB_ID)
  const ranked = CITIES.filter((c) => c.id !== HUB_ID)
    .map((c) => ({ id: c.id, d: dist(c, hub) }))
    .sort((a, b) => a.d - b.d)
  const tiers = { [HUB_ID]: 0 }
  ranked.forEach((r, i) => {
    tiers[r.id] = i + 1
  })
  return tiers
}

export const CITY_TIERS = cityTiers()

export function getCity(id) {
  return CITIES.find((c) => c.id === id)
}
