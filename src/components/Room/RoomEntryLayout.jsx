export default function RoomEntryLayout({ activeTab, onShowJoin, onShowCreate, icon, title, subtitle, children }) {
  return (
    <div className="w-full max-w-md mx-auto bg-card rounded-[28px] shadow-card border border-border p-8">
      <div className="w-12 h-12 rounded-2xl bg-accent-soft flex items-center justify-center mb-5">
        {icon}
      </div>

      <h2 className="font-serif font-medium text-2xl text-ink mb-1.5">{title}</h2>
      {subtitle && <p className="text-sm text-ink-soft mb-6">{subtitle}</p>}

      <div className="flex bg-almond rounded-full p-1 mb-6">
        <button
          onClick={onShowJoin}
          className={`flex-1 text-center py-2 text-sm font-semibold rounded-full transition ${
            activeTab === 'join' ? 'bg-card text-ink shadow-card' : 'text-ink-soft'
          }`}
        >
          Join a room
        </button>
        <button
          onClick={onShowCreate}
          className={`flex-1 text-center py-2 text-sm font-semibold rounded-full transition ${
            activeTab === 'create' ? 'bg-card text-ink shadow-card' : 'text-ink-soft'
          }`}
        >
          Create a room
        </button>
      </div>

      {children}
    </div>
  )
}

export function DoorIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M6 21V4a1 1 0 0 1 1-1h8.5L19 6.5V21" stroke="var(--color-accent-ink)" strokeWidth="1.8" strokeLinejoin="round"/>
      <path d="M6 21H19" stroke="var(--color-accent-ink)" strokeWidth="1.8" strokeLinecap="round"/>
      <circle cx="14" cy="13" r="1" fill="var(--color-accent-ink)"/>
    </svg>
  )
}

export function PlusRoomIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <rect x="4" y="4" width="16" height="16" rx="4" stroke="var(--color-accent-ink)" strokeWidth="1.8"/>
      <path d="M12 8.5V15.5" stroke="var(--color-accent-ink)" strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M8.5 12H15.5" stroke="var(--color-accent-ink)" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  )
}