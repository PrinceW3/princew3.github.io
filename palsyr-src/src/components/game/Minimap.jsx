import { useEffect, useRef } from 'react'
import { GRID_W, GRID_H, WORLD } from '../../data/world.js'
import { CITIES } from '../../data/cities.js'
import { TILE_COLORS } from './tileColors.js'

const SCALE = 2 // px per world tile on the minimap

export default function Minimap({ player }) {
  const canvasRef = useRef(null)
  const staticCanvasRef = useRef(null)

  // Draw the static world layer once into an offscreen canvas.
  useEffect(() => {
    const off = document.createElement('canvas')
    off.width = GRID_W * SCALE
    off.height = GRID_H * SCALE
    const ctx = off.getContext('2d')
    for (let y = 0; y < GRID_H; y++) {
      for (let x = 0; x < GRID_W; x++) {
        const t = WORLD[y][x]
        ctx.fillStyle = TILE_COLORS[t.type] || '#333'
        ctx.fillRect(x * SCALE, y * SCALE, SCALE, SCALE)
      }
    }
    for (const city of CITIES) {
      ctx.fillStyle = '#facc15'
      ctx.beginPath()
      ctx.arc(city.x * SCALE, city.y * SCALE, 2.5, 0, Math.PI * 2)
      ctx.fill()
    }
    staticCanvasRef.current = off
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !staticCanvasRef.current) return
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(staticCanvasRef.current, 0, 0)
    ctx.fillStyle = '#ef4444'
    ctx.strokeStyle = '#fff'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.arc(player.position.x * SCALE, player.position.y * SCALE, 3, 0, Math.PI * 2)
    ctx.fill()
    ctx.stroke()
  }, [player.position.x, player.position.y])

  return (
    <div className="absolute top-2 right-2 z-20 rounded-md border border-white/30 bg-black/50 p-1 shadow-lg">
      <canvas ref={canvasRef} width={GRID_W * SCALE} height={GRID_H * SCALE} className="rounded-sm" />
    </div>
  )
}
