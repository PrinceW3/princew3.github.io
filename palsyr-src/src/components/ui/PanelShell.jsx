export default function PanelShell({ title, onClose, children, tabs }) {
  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-slate-950 text-white animate-[slideUp_0.2s_ease-out]">
      <style>{`@keyframes slideUp { from { transform: translateY(24px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }`}</style>
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 shrink-0">
        <h2 className="font-bold text-lg">{title}</h2>
        <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center">
          ✕
        </button>
      </div>
      {tabs}
      <div className="flex-1 overflow-y-auto">{children}</div>
    </div>
  )
}
