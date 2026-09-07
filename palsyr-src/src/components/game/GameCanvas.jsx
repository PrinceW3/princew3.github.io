import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef } from 'react'
import { GRID_W, GRID_H, TILE_SIZE, getTile, isWalkable } from '../../data/world.js'
import { TRAINERS } from '../../data/trainers.js'
import { CITIES } from '../../data/cities.js'
import { TILE_COLORS, TILE_COLORS_DARK, BUILDING_ICON } from './tileColors.js'

const STEP_DURATION = 140

const DIR_VECTORS = {
  up: { dx: 0, dy: -1 },
  down: { dx: 0, dy: 1 },
  left: { dx: -1, dy: 0 },
  right: { dx: 1, dy: 0 },
}

const GameCanvas = forwardRef(function GameCanvas(
  { player, isTrainerDefeatedToday, disabled, onArrive, width = 390, height = 420 },
  ref,
) {
  const canvasRef = useRef(null)
  const animRef = useRef(null) // { fromX, fromY, toX, toY, start }
  const logicalPos = useRef({ x: player.position.x, y: player.position.y })
  const facingRef = useRef(player.facing)
  const rafRef = useRef(null)
  const dprRef = useRef(1)
  const pendingArriveTile = useRef(null)
  const onArriveRef = useRef(onArrive)
  const isTrainerDefeatedRef = useRef(isTrainerDefeatedToday)

  useEffect(() => {
    logicalPos.current = { x: player.position.x, y: player.position.y }
    facingRef.current = player.facing
  }, [player.position.x, player.position.y, player.facing])

  useEffect(() => {
    onArriveRef.current = onArrive
    isTrainerDefeatedRef.current = isTrainerDefeatedToday
  })

  const tryMove = useCallback(
    (dir) => {
      if (disabled) return
      facingRef.current = dir
      if (animRef.current) return // mid-step, ignore extra input
      const { dx, dy } = DIR_VECTORS[dir]
      const from = logicalPos.current
      const toX = from.x + dx
      const toY = from.y + dy
      if (!isWalkable(toX, toY)) return
      animRef.current = { fromX: from.x, fromY: from.y, toX, toY, start: performance.now() }
    },
    [disabled],
  )

  useImperativeHandle(ref, () => ({ move: tryMove }), [tryMove])

  // keyboard controls
  useEffect(() => {
    const keyMap = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right', w: 'up', s: 'down', a: 'left', d: 'right' }
    const onKeyDown = (e) => {
      const dir = keyMap[e.key]
      if (!dir) return
      e.preventDefault()
      tryMove(dir)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [tryMove])

  useEffect(() => {
    const canvas = canvasRef.current
    const dpr = Math.min(2, window.devicePixelRatio || 1)
    dprRef.current = dpr
    canvas.width = width * dpr
    canvas.height = height * dpr
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`
    const ctx = canvas.getContext('2d')

    const draw = (now) => {
      let px = logicalPos.current.x
      let py = logicalPos.current.y

      if (animRef.current) {
        const a = animRef.current
        const t = Math.min(1, (now - a.start) / STEP_DURATION)
        px = a.fromX + (a.toX - a.fromX) * t
        py = a.fromY + (a.toY - a.fromY) * t
        if (t >= 1) {
          logicalPos.current = { x: a.toX, y: a.toY }
          animRef.current = null
          pendingArriveTile.current = getTile(a.toX, a.toY)
        }
      }

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.imageSmoothingEnabled = false
      ctx.fillStyle = '#0b1410'
      ctx.fillRect(0, 0, width, height)

      const camX = clamp(px * TILE_SIZE + TILE_SIZE / 2 - width / 2, 0, GRID_W * TILE_SIZE - width)
      const camY = clamp(py * TILE_SIZE + TILE_SIZE / 2 - height / 2, 0, GRID_H * TILE_SIZE - height)

      const startCol = Math.max(0, Math.floor(camX / TILE_SIZE) - 1)
      const endCol = Math.min(GRID_W - 1, Math.ceil((camX + width) / TILE_SIZE))
      const startRow = Math.max(0, Math.floor(camY / TILE_SIZE) - 1)
      const endRow = Math.min(GRID_H - 1, Math.ceil((camY + height) / TILE_SIZE))

      const checker = (x, y) => (x + y) % 2 === 0

      for (let y = startRow; y <= endRow; y++) {
        for (let x = startCol; x <= endCol; x++) {
          const tile = getTile(x, y)
          if (!tile) continue
          const sx = Math.round(x * TILE_SIZE - camX)
          const sy = Math.round(y * TILE_SIZE - camY)
          const base = checker(x, y) ? TILE_COLORS[tile.type] : TILE_COLORS_DARK[tile.type]
          ctx.fillStyle = base || '#333'
          ctx.fillRect(sx, sy, TILE_SIZE, TILE_SIZE)

          if (tile.zone === 'wild') {
            ctx.fillStyle = 'rgba(120, 40, 200, 0.10)'
            ctx.fillRect(sx, sy, TILE_SIZE, TILE_SIZE)
          } else if (tile.zone === 'outskirts') {
            ctx.fillStyle = 'rgba(255, 140, 0, 0.08)'
            ctx.fillRect(sx, sy, TILE_SIZE, TILE_SIZE)
          }

          if (tile.type === 'building') {
            ctx.font = '20px serif'
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            ctx.fillText(BUILDING_ICON[tile.buildingType] || '🏠', sx + TILE_SIZE / 2, sy + TILE_SIZE / 2 + 1)
          } else if (tile.type === 'city' && (x % 3 === 0) && (y % 3 === 0)) {
            ctx.fillStyle = 'rgba(255,255,255,0.15)'
            ctx.fillRect(sx + 6, sy + 6, TILE_SIZE - 12, TILE_SIZE - 12)
          } else if (tile.type === 'water') {
            ctx.fillStyle = 'rgba(255,255,255,0.08)'
            ctx.fillRect(sx, sy + TILE_SIZE - 6, TILE_SIZE, 3)
          }
        }
      }

      // city name labels
      for (const city of CITIES) {
        const sx = city.x * TILE_SIZE - camX
        const sy = city.y * TILE_SIZE - camY - 26
        if (sx < -60 || sx > width + 60 || sy < -20 || sy > height + 20) continue
        ctx.font = 'bold 11px sans-serif'
        ctx.textAlign = 'center'
        ctx.fillStyle = 'rgba(0,0,0,0.55)'
        ctx.fillText(city.name, sx + 1, sy + 1)
        ctx.fillStyle = '#fff'
        ctx.fillText(city.name, sx, sy)
      }

      // trainer sprites
      for (const trainer of TRAINERS) {
        const sx = trainer.x * TILE_SIZE - camX
        const sy = trainer.y * TILE_SIZE - camY
        if (sx < -TILE_SIZE || sx > width || sy < -TILE_SIZE || sy > height) continue
        const defeated = isTrainerDefeatedRef.current(trainer.id)
        ctx.globalAlpha = defeated ? 0.35 : 1
        ctx.font = '22px serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText('🧍', sx + TILE_SIZE / 2, sy + TILE_SIZE / 2 + 1)
        ctx.globalAlpha = 1
        if (!defeated) {
          ctx.fillStyle = '#ef4444'
          ctx.beginPath()
          ctx.arc(sx + TILE_SIZE - 6, sy + 6, 3, 0, Math.PI * 2)
          ctx.fill()
        }
      }

      // player sprite
      const playerSx = px * TILE_SIZE - camX
      const playerSy = py * TILE_SIZE - camY
      ctx.fillStyle = 'rgba(0,0,0,0.35)'
      ctx.beginPath()
      ctx.ellipse(playerSx + TILE_SIZE / 2, playerSy + TILE_SIZE - 5, 10, 4, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.font = '24px serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('🧑', playerSx + TILE_SIZE / 2, playerSy + TILE_SIZE / 2)
      const arrow = { up: '▲', down: '▼', left: '◀', right: '▶' }[facingRef.current]
      ctx.font = '10px sans-serif'
      ctx.fillStyle = '#fff'
      ctx.fillText(arrow, playerSx + TILE_SIZE / 2, playerSy - 4)

      if (pendingArriveTile.current) {
        const arrivedTile = pendingArriveTile.current
        pendingArriveTile.current = null
        onArriveRef.current?.(arrivedTile)
      }

      rafRef.current = requestAnimationFrame(draw)
    }

    rafRef.current = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(rafRef.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [width, height])

  return (
    <canvas
      ref={canvasRef}
      className="rounded-lg border border-white/10 shadow-lg touch-none select-none"
    />
  )
})

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v))
}

export default GameCanvas
