import { useRef } from 'react'

const BTN_CLASS =
  'absolute flex items-center justify-center w-12 h-12 bg-black/40 active:bg-white/30 backdrop-blur-sm rounded-lg border border-white/20 text-white text-xl select-none touch-none'

export default function DPad({ onMove, disabled }) {
  const intervalRef = useRef(null)

  const start = (dir) => {
    if (disabled) return
    onMove(dir)
    clearInterval(intervalRef.current)
    intervalRef.current = setInterval(() => onMove(dir), 170)
  }
  const stop = () => clearInterval(intervalRef.current)

  const bind = (dir) => ({
    onPointerDown: (e) => {
      e.preventDefault()
      start(dir)
    },
    onPointerUp: stop,
    onPointerLeave: stop,
    onPointerCancel: stop,
  })

  return (
    <div className="relative w-36 h-36 shrink-0 opacity-90">
      <button aria-label="Up" className={`${BTN_CLASS} top-0 left-1/2 -translate-x-1/2`} {...bind('up')}>
        ▲
      </button>
      <button aria-label="Left" className={`${BTN_CLASS} left-0 top-1/2 -translate-y-1/2`} {...bind('left')}>
        ◀
      </button>
      <button aria-label="Right" className={`${BTN_CLASS} right-0 top-1/2 -translate-y-1/2`} {...bind('right')}>
        ▶
      </button>
      <button aria-label="Down" className={`${BTN_CLASS} bottom-0 left-1/2 -translate-x-1/2`} {...bind('down')}>
        ▼
      </button>
    </div>
  )
}
