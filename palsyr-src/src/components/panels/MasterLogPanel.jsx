import { useMemo, useState } from 'react'
import { useGame } from '../../state/GameContext.jsx'
import { masterLogRows } from '../../lib/masterLog.js'
import PanelShell from '../ui/PanelShell.jsx'

const COLUMNS = [
  { key: 'name', label: 'Species' },
  { key: 'rarity', label: 'Rarity' },
  { key: 'population', label: 'Population' },
  { key: 'price', label: 'Price' },
]

export default function MasterLogPanel({ onClose }) {
  const { masterLog } = useGame()
  const [sortKey, setSortKey] = useState('name')
  const [asc, setAsc] = useState(true)

  const rows = useMemo(() => {
    const r = masterLogRows(masterLog)
    r.sort((a, b) => {
      const av = a[sortKey]
      const bv = b[sortKey]
      if (typeof av === 'number') return asc ? av - bv : bv - av
      return asc ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av))
    })
    return r
  }, [masterLog, sortKey, asc])

  const toggleSort = (key) => {
    if (sortKey === key) setAsc((a) => !a)
    else {
      setSortKey(key)
      setAsc(true)
    }
  }

  return (
    <PanelShell title="Master Log" onClose={onClose}>
      <div className="overflow-x-auto p-2">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-white/50 border-b border-white/10">
              {COLUMNS.map((c) => (
                <th key={c.key} onClick={() => toggleSort(c.key)} className="text-left py-2 px-2 cursor-pointer select-none">
                  {c.label} {sortKey === c.key ? (asc ? '▲' : '▼') : ''}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.key} className="border-b border-white/5">
                <td className="py-2 px-2 font-semibold">{r.name}</td>
                <td className="py-2 px-2 capitalize" style={{ color: r.rarityColor }}>
                  {r.rarity}
                </td>
                <td className="py-2 px-2">{r.population}</td>
                <td className="py-2 px-2">{r.price} 🪙</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PanelShell>
  )
}
