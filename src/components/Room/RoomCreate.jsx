import { useState } from 'react'
import { useRoom } from '../../context/RoomContext'
import { useLanguage } from '../../context/LanguageContext'
import RoomEntryLayout, { PlusRoomIcon } from './RoomEntryLayout'

export default function RoomCreate({ onBack }) {
  const { createRoom, loading, error } = useRoom()
  const { t } = useLanguage()
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [institution, setInstitution] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim() || !code.trim()) return
    await createRoom({ name, code, institution })
  }

  return (
    <RoomEntryLayout
      activeTab="create"
      onShowJoin={onBack}
      onShowCreate={() => {}}
      icon={<PlusRoomIcon />}
      title={t('createLaunchRoom')}
    >
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          placeholder={t('roomNamePlaceholder')}
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full border-[1.5px] border-almond bg-card rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-accent transition"
        />
        <input
          type="text"
          placeholder={t('roomCodeUniquePlaceholder')}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          required
          className="w-full border-[1.5px] border-almond bg-card rounded-2xl px-4 py-3 text-sm uppercase focus:outline-none focus:border-accent transition"
        />
        <input
          type="text"
          placeholder={t('institutionPlaceholder')}
          value={institution}
          onChange={(e) => setInstitution(e.target.value)}
          className="w-full border-[1.5px] border-almond bg-card rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-accent transition"
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-accent hover:bg-accent-hover disabled:opacity-50 text-white font-bold text-sm rounded-2xl py-3.5 transition"
        >
          {loading ? t('creating') : t('createAndLaunch')}
        </button>
      </form>
    </RoomEntryLayout>
  )
}