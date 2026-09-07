const ITEMS = [
  { id: 'inventory', label: 'Inventory', icon: '🎒' },
  { id: 'jobs', label: 'Jobs', icon: '💼' },
  { id: 'masterlog', label: 'Master Log', icon: '📖' },
  { id: 'social', label: 'Social', icon: '💬' },
]

export default function BottomMenu({ onOpen }) {
  return (
    <div className="flex items-center justify-around bg-black/50 backdrop-blur-sm border-t border-white/10 py-2 px-2 shrink-0">
      {ITEMS.map((item) => (
        <button
          key={item.id}
          onClick={() => onOpen(item.id)}
          className="flex flex-col items-center gap-0.5 text-white/80 hover:text-white px-3 py-1"
        >
          <span className="text-xl">{item.icon}</span>
          <span className="text-[10px] font-medium">{item.label}</span>
        </button>
      ))}
    </div>
  )
}
