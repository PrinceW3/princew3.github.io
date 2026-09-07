import { CITIES, HUB_ID, getCity, CITY_TIERS } from './cities.js'
import { TRAINERS } from './trainers.js'

export const GRID_W = 60
export const GRID_H = 40
export const TILE_SIZE = 32

// Biome seed points for a simple Voronoi split - guarantees each city sits
// inside its intended biome while keeping the whole map covered.
const BIOME_SEEDS = [
  { x: 29, y: 19, biome: 'grass' },
  { x: 50, y: 32, biome: 'grass' },
  { x: 9, y: 9, biome: 'forest' },
  { x: 30, y: 35, biome: 'forest' },
  { x: 49, y: 7, biome: 'desert' },
  { x: 7, y: 31, biome: 'coast' },
  { x: 2, y: 15, biome: 'coast' },
]

const BIOME_ENCOUNTERS = {
  grass: ['fluffkit', 'skyquill', 'glimmoth'],
  forest: ['thistlehog', 'mossling', 'glimmoth', 'emberail'],
  desert: ['dunestrider', 'emberail', 'cragoon'],
  coast: ['aquabub', 'tidefin'],
}

function nearestBiome(x, y) {
  let best = null
  let bestD = Infinity
  for (const seed of BIOME_SEEDS) {
    const d = (seed.x - x) ** 2 + (seed.y - y) ** 2
    if (d < bestD) {
      bestD = d
      best = seed.biome
    }
  }
  return best
}

function chebyshev(ax, ay, bx, by) {
  return Math.max(Math.abs(ax - bx), Math.abs(ay - by))
}

function makeTile(x, y) {
  const biome = nearestBiome(x, y)
  const isOceanEdge = biome === 'coast' && x <= 3
  return {
    x,
    y,
    biome,
    type: isOceanEdge ? 'water' : biome,
    walkable: !isOceanEdge,
    zone: null, // null | 'outskirts' | 'wild'
    cityId: null,
    tier: null,
    buildingType: null,
    trainerId: null,
  }
}

function buildGrid() {
  const grid = []
  for (let y = 0; y < GRID_H; y++) {
    const row = []
    for (let x = 0; x < GRID_W; x++) {
      row.push(makeTile(x, y))
    }
    grid.push(row)
  }
  return grid
}

function carvePath(grid, from, to) {
  let x = from.x
  let y = from.y
  const stampPath = (px, py) => {
    if (px < 0 || px >= GRID_W || py < 0 || py >= GRID_H) return
    const t = grid[py][px]
    if (t.type === 'city' || t.type === 'building') return
    t.type = 'path'
    t.walkable = true
    t.zone = null
  }
  stampPath(x, y)
  while (x !== to.x) {
    x += x < to.x ? 1 : -1
    stampPath(x, y)
  }
  while (y !== to.y) {
    y += y < to.y ? 1 : -1
    stampPath(x, y)
  }
}

function stampCity(grid, city) {
  const R = 2
  for (let dy = -R; dy <= R; dy++) {
    for (let dx = -R; dx <= R; dx++) {
      const x = city.x + dx
      const y = city.y + dy
      if (x < 0 || x >= GRID_W || y < 0 || y >= GRID_H) continue
      const t = grid[y][x]
      t.type = 'city'
      t.walkable = true
      t.zone = null
      t.cityId = city.id
    }
  }
  for (const b of city.buildings) {
    const x = city.x + b.dx
    const y = city.y + b.dy
    if (x < 0 || x >= GRID_W || y < 0 || y >= GRID_H) continue
    const t = grid[y][x]
    t.type = 'building'
    t.walkable = true
    t.zone = null
    t.cityId = city.id
    t.buildingType = b.type
  }
}

function stampOutskirts(grid, city, tier) {
  const MIN_R = 2
  const MAX_R = 5
  for (let dy = -MAX_R; dy <= MAX_R; dy++) {
    for (let dx = -MAX_R; dx <= MAX_R; dx++) {
      const d = Math.max(Math.abs(dx), Math.abs(dy))
      if (d < MIN_R || d > MAX_R) continue
      const x = city.x + dx
      const y = city.y + dy
      if (x < 0 || x >= GRID_W || y < 0 || y >= GRID_H) continue
      const t = grid[y][x]
      if (!t.walkable || t.type === 'city' || t.type === 'building' || t.type === 'path') continue
      t.zone = 'outskirts'
      t.cityId = city.id
      t.tier = tier
    }
  }
}

function stampTrainers(grid, cityTiers) {
  for (const trainer of TRAINERS) {
    const { x, y } = trainer
    if (x < 0 || x >= GRID_W || y < 0 || y >= GRID_H) continue
    const t = grid[y][x]
    t.walkable = true
    if (!t.zone) {
      t.zone = 'outskirts'
      t.cityId = trainer.cityId
      t.tier = cityTiers[trainer.cityId]
    }
    t.trainerId = trainer.id
  }
}

function stampWildZones(grid) {
  for (let y = 0; y < GRID_H; y++) {
    for (let x = 0; x < GRID_W; x++) {
      const t = grid[y][x]
      if (!t.walkable || t.zone || t.type === 'path' || t.type === 'city' || t.type === 'building') continue
      const nearCity = CITIES.some((c) => chebyshev(x, y, c.x, c.y) <= 6)
      if (!nearCity) {
        t.zone = 'wild'
      }
    }
  }
}

function buildWorld() {
  const grid = buildGrid()
  const hub = getCity(HUB_ID)

  for (const city of CITIES) {
    if (city.id !== HUB_ID) carvePath(grid, city, hub)
  }
  for (const city of CITIES) stampCity(grid, city)

  return grid
}

export const WORLD = buildWorld()

for (const city of CITIES) {
  stampOutskirts(WORLD, city, CITY_TIERS[city.id])
}
stampTrainers(WORLD, CITY_TIERS)
stampWildZones(WORLD)

export function getTile(x, y) {
  if (x < 0 || x >= GRID_W || y < 0 || y >= GRID_H) return null
  return WORLD[y][x]
}

export function isWalkable(x, y) {
  const t = getTile(x, y)
  return !!t && t.walkable
}

export function biomeEncounterSpecies(biome) {
  return BIOME_ENCOUNTERS[biome] || []
}

const hubCity = getCity(HUB_ID)
export const HUB_SPAWN = { x: hubCity.x, y: hubCity.y + 3 }
