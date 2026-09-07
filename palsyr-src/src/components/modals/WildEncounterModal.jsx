import { getSpecies } from '../../data/species.js'

export default function WildEncounterModal({ speciesId, onCatch, onDismiss }) {
  const species = getSpecies(speciesId)
  if (!species) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6">
      <div className="w-full max-w-xs rounded-2xl bg-slate-900 border border-white/10 p-5 text-center text-white shadow-2xl">
        <div className="text-sm text-white/60 mb-1">A wild Pal appeared!</div>
        <div className="text-6xl my-3">{species.icon}</div>
        <div className="text-xl font-bold">{species.name}</div>
        <div className="text-xs text-white/50 mb-4 capitalize">{species.category} · {species.rarity}</div>
        <div className="flex gap-2">
          <button
            onClick={onDismiss}
            className="flex-1 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-sm font-semibold"
          >
            Run Away
          </button>
          <button
            onClick={onCatch}
            className="flex-1 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-sm font-semibold"
          >
            Catch!
          </button>
        </div>
      </div>
    </div>
  )
}
