import { useRoom } from '../../context/RoomContext'
import { useLanguage } from '../../context/LanguageContext'

export default function RoomHeader() {
  const { roomCode, roomData, isAdmin, deleteRoom, leaveRoom } = useRoom()
  const { t } = useLanguage()

  async function handleDelete() {
    if (confirm(`Delete room "${roomData?.name}"? This cannot be undone.`)) {
      await deleteRoom()
    }
  }

  return (
    <div className="flex items-center justify-between bg-card rounded-2xl shadow-card border border-border p-4 mb-6">
      <div>
        <h2 className="font-semibold text-lg">{roomData?.name}</h2>
        <p className="text-sm text-ink-soft">
          {roomData?.institution && `${roomData.institution} · `}{t('code')}: {roomCode}
        </p>
      </div>
      <div className="flex gap-2">
        <button
          onClick={leaveRoom}
          className="text-sm border border-border rounded-lg px-3 py-1.5 hover:bg-page transition"
        >
          {t('leaveRoom')}
        </button>
        {isAdmin && (
          <button
            onClick={handleDelete}
            className="text-sm border border-red-300 text-red-500 rounded-lg px-3 py-1.5 hover:bg-red-500/10 transition"
          >
            🗑️ {t('deleteRoom')}
          </button>
        )}
      </div>
    </div>
  )
}