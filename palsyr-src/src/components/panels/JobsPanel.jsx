import { useEffect, useRef, useState } from 'react'
import { JOBS } from '../../data/jobs.js'
import { useGame } from '../../state/GameContext.jsx'
import PanelShell from '../ui/PanelShell.jsx'

function SprintTapGame({ job, onDone }) {
  const [taps, setTaps] = useState(0)
  const [timeLeft, setTimeLeft] = useState(job.durationMs)
  const [running, setRunning] = useState(false)
  const [finished, setFinished] = useState(false)
  const startRef = useRef(0)

  useEffect(() => {
    if (!running) return
    const iv = setInterval(() => {
      const remaining = job.durationMs - (performance.now() - startRef.current)
      if (remaining <= 0) {
        setTimeLeft(0)
        setRunning(false)
        setFinished(true)
        clearInterval(iv)
      } else {
        setTimeLeft(remaining)
      }
    }, 50)
    return () => clearInterval(iv)
  }, [running, job.durationMs])

  const start = () => {
    setTaps(0)
    setTimeLeft(job.durationMs)
    startRef.current = performance.now()
    setRunning(true)
    setFinished(false)
  }

  const payout = Math.round(job.basePayout * (taps / 12))

  return (
    <div className="p-4 text-center">
      <div className="text-sm text-white/60 mb-3">{job.description}</div>
      {!running && !finished && (
        <button onClick={start} className="px-6 py-3 rounded-lg bg-indigo-600 font-semibold">
          Start
        </button>
      )}
      {running && (
        <>
          <div className="text-xs text-white/50 mb-2">{(timeLeft / 1000).toFixed(1)}s left</div>
          <button
            onClick={() => setTaps((t) => t + 1)}
            className="w-32 h-32 rounded-full bg-yellow-500 active:scale-95 text-3xl font-bold shadow-lg"
          >
            {taps}
          </button>
        </>
      )}
      {finished && (
        <div>
          <div className="text-2xl font-bold mb-1">{taps} taps!</div>
          <div className="text-emerald-400 font-semibold mb-3">+{Math.max(1, payout)} Pals</div>
          <button
            onClick={() => onDone(Math.max(1, payout))}
            className="px-6 py-2.5 rounded-lg bg-emerald-600 font-semibold"
          >
            Claim
          </button>
        </div>
      )}
    </div>
  )
}

function ReflexGame({ job, onDone }) {
  const [phase, setPhase] = useState('idle') // idle | waiting | go | early | done
  const [reactionMs, setReactionMs] = useState(null)
  const goAtRef = useRef(0)
  const timeoutRef = useRef(null)

  const start = () => {
    setPhase('waiting')
    const delay = 1200 + Math.random() * 2200
    timeoutRef.current = setTimeout(() => {
      goAtRef.current = performance.now()
      setPhase('go')
    }, delay)
  }

  const tap = () => {
    if (phase === 'waiting') {
      clearTimeout(timeoutRef.current)
      setPhase('early')
      return
    }
    if (phase === 'go') {
      const rt = performance.now() - goAtRef.current
      setReactionMs(rt)
      setPhase('done')
    }
  }

  useEffect(() => () => clearTimeout(timeoutRef.current), [])

  const payout = reactionMs ? Math.max(3, Math.round(job.basePayout * (400 / Math.max(120, reactionMs)))) : 0

  return (
    <div className="p-4 text-center">
      <div className="text-sm text-white/60 mb-3">{job.description}</div>
      {phase === 'idle' && (
        <button onClick={start} className="px-6 py-3 rounded-lg bg-indigo-600 font-semibold">
          Start
        </button>
      )}
      {(phase === 'waiting' || phase === 'go') && (
        <button
          onClick={tap}
          className={`w-full h-40 rounded-xl font-bold text-2xl transition-colors ${
            phase === 'go' ? 'bg-emerald-500' : 'bg-slate-700'
          }`}
        >
          {phase === 'go' ? 'TAP NOW!' : 'Wait...'}
        </button>
      )}
      {phase === 'early' && (
        <div>
          <div className="text-red-400 font-semibold mb-3">Too early! No reward.</div>
          <button onClick={() => onDone(0)} className="px-6 py-2.5 rounded-lg bg-white/10 font-semibold">
            OK
          </button>
        </div>
      )}
      {phase === 'done' && (
        <div>
          <div className="text-2xl font-bold mb-1">{Math.round(reactionMs)}ms</div>
          <div className="text-emerald-400 font-semibold mb-3">+{payout} Pals</div>
          <button onClick={() => onDone(payout)} className="px-6 py-2.5 rounded-lg bg-emerald-600 font-semibold">
            Claim
          </button>
        </div>
      )}
    </div>
  )
}

const PATTERN_ICONS = ['🔵', '🟢', '🟡', '🔴']

function PatternGame({ job, onDone }) {
  const [phase, setPhase] = useState('idle') // idle | show | input | result
  const [sequence, setSequence] = useState([])
  const [input, setInput] = useState([])
  const [showIndex, setShowIndex] = useState(-1)
  const [correct, setCorrect] = useState(null)

  const start = () => {
    const seq = Array.from({ length: 4 }, () => Math.floor(Math.random() * 4))
    setSequence(seq)
    setInput([])
    setPhase('show')
    setShowIndex(0)
  }

  useEffect(() => {
    if (phase !== 'show') return
    if (showIndex >= sequence.length) {
      const t = setTimeout(() => setPhase('input'), 300)
      return () => clearTimeout(t)
    }
    const t = setTimeout(() => setShowIndex((i) => i + 1), 650)
    return () => clearTimeout(t)
  }, [phase, showIndex, sequence.length])

  const tapIcon = (i) => {
    if (phase !== 'input') return
    const next = [...input, i]
    setInput(next)
    if (next.length === sequence.length) {
      const isCorrect = next.every((v, idx) => v === sequence[idx])
      setCorrect(isCorrect)
      setPhase('result')
    }
  }

  const payout = correct ? job.basePayout : 0

  return (
    <div className="p-4 text-center">
      <div className="text-sm text-white/60 mb-3">{job.description}</div>
      {phase === 'idle' && (
        <button onClick={start} className="px-6 py-3 rounded-lg bg-indigo-600 font-semibold">
          Start
        </button>
      )}
      {(phase === 'show' || phase === 'input') && (
        <div className="grid grid-cols-2 gap-3">
          {PATTERN_ICONS.map((icon, i) => (
            <button
              key={i}
              onClick={() => tapIcon(i)}
              className={`h-20 rounded-xl text-3xl flex items-center justify-center border-2 ${
                phase === 'show' && sequence[showIndex] === i ? 'bg-white/30 border-white' : 'bg-white/5 border-white/10'
              }`}
            >
              {icon}
            </button>
          ))}
        </div>
      )}
      {phase === 'input' && <div className="text-xs text-white/50 mt-3">Tap the sequence in order</div>}
      {phase === 'result' && (
        <div>
          <div className={`font-bold mb-1 ${correct ? 'text-emerald-400' : 'text-red-400'}`}>
            {correct ? 'Correct!' : 'Not quite.'}
          </div>
          <div className="text-emerald-400 font-semibold mb-3">+{payout} Pals</div>
          <button onClick={() => onDone(payout)} className="px-6 py-2.5 rounded-lg bg-emerald-600 font-semibold">
            Claim
          </button>
        </div>
      )}
    </div>
  )
}

const GAME_COMPONENTS = { tap: SprintTapGame, reflex: ReflexGame, pattern: PatternGame }

export default function JobsPanel({ onClose }) {
  const { jobAttemptsRemaining, useJobAttempt } = useGame()
  const [activeJob, setActiveJob] = useState(null)

  if (activeJob) {
    const Game = GAME_COMPONENTS[activeJob.type]
    return (
      <PanelShell title={activeJob.name} onClose={() => setActiveJob(null)}>
        <Game
          job={activeJob}
          onDone={(payout) => {
            if (payout > 0) useJobAttempt(activeJob.id, payout)
            else useJobAttempt(activeJob.id, 0)
            setActiveJob(null)
          }}
        />
      </PanelShell>
    )
  }

  return (
    <PanelShell title="Jobs" onClose={onClose}>
      <div className="p-4 space-y-3">
        {JOBS.map((job) => {
          const remaining = jobAttemptsRemaining(job.id)
          return (
            <button
              key={job.id}
              disabled={remaining <= 0}
              onClick={() => setActiveJob(job)}
              className="w-full flex items-center gap-3 rounded-xl bg-white/5 disabled:opacity-40 border border-white/10 p-3 text-left"
            >
              <div className="text-3xl">{job.icon}</div>
              <div className="flex-1">
                <div className="font-semibold text-sm">{job.name}</div>
                <div className="text-xs text-white/50">{job.description}</div>
                <div className="text-xs text-white/40 mt-0.5">
                  ~{job.basePayout} Pals · {remaining}/{job.maxAttemptsPerDay} left today
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </PanelShell>
  )
}
