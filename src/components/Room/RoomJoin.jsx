import { useState } from 'react'
import { useRoom } from '../../context/RoomContext'
import { useLanguage } from '../../context/LanguageContext'
import RoomEntryLayout, { DoorIcon } from './RoomEntryLayout'

export default function RoomJoin({ onShowCreate }) {
  const { joinRoom, loading, error } = useRoom()
  const { t } = useLanguage()
  const [code, setCode] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (!code.trim()) return
    await joinRoom(code)
  }

  return (
    <RoomEntryLayout
      activeTab="join"
      onShowJoin={() => {}}
      onShowCreate={onShowCreate}
      icon={<DoorIcon />}
      title={t('noRoomJoined')}
      subtitle={t('joinRoomHint')}
    >
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          placeholder={t('roomCodePlaceholder')}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="w-full border-[1.5px] border-almond bg-card rounded-2xl px-4 py-3 text-sm uppercase tracking-wide focus:outline-none focus:border-accent transition"
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-accent hover:bg-accent-hover disabled:opacity-50 text-white font-bold text-sm rounded-2xl py-3.5 transition"
        >
          {loading ? t('joining') : t('joinRoom')}
        </button>
      </form>
    </RoomEntryLayout>
  )
}