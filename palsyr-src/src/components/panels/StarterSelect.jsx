import { SPECIES } from '../../data/species.js'
import { useGame } from '../../state/GameContext.jsx'

const STARTER_IDS = ['fluffkit', 'thistlehog', 'aquabub']

export default function StarterSelect() {
  const { chooseStarter } = useGame()
  const starters = SPECIES.filter((s) => STARTER_IDS.includes(s.id))

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-b from-emerald-950 to-slate-950 text-white flex flex-col items-center justify-center p-6">
      <h1 className="text-3xl font-black mb-1 tracking-tight">Palsyr</h1>
      <p className="text-white/60 text-sm mb-8 text-center">Choose your first Pal to begin your journey in Havenmere.</p>
      <div className="grid grid-cols-1 gap-4 w-full max-w-xs">
        {starters.map((s) => (
          <button
            key={s.id}
            onClick={() => chooseStarter(s.id)}
            className="flex items-center gap-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 p-4 text-left transition-colors"
          >
            <div className="text-5xl">{s.icon}</div>
            <div>
              <div className="font-bold text-lg">{s.name}</div>
              <div className="text-xs text-white/50 capitalize">{s.category} · {s.biomes.join(', ')}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
