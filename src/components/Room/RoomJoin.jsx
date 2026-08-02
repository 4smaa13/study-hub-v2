import { useState } from 'react'
import { useRoom } from '../../context/RoomContext'
import { useLanguage } from '../../context/LanguageContext'

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
    <div className="w-full max-w-md mx-auto bg-card rounded-2xl shadow-card border border-border p-6">
      <h2 className="text-lg font-semibold mb-1">{t('noRoomJoined')}</h2>
      <p className="text-sm text-ink-soft mb-4">
        {t('joinRoomHint')}
      </p>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          placeholder={t('roomCodePlaceholder')}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="flex-1 border border-border bg-page rounded-lg px-3 py-2 uppercase tracking-wide focus:outline-none focus:ring-2 focus:ring-accent"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-accent hover:bg-accent-hover disabled:opacity-50 text-white font-medium rounded-lg px-4 py-2 transition"
        >
          {loading ? t('joining') : t('joinRoom')}
        </button>
      </form>
      {error && <p className="text-sm text-red-500 mt-2">{error}</p>}

      <div className="mt-6 pt-6 border-t border-border">
        <p className="text-sm text-ink-soft mb-2">
          {t('needNewRoom')}
        </p>
        <button
          onClick={onShowCreate}
          className="text-accent font-medium hover:underline"
        >
          {t('createRoom')}
        </button>
      </div>
    </div>
  )
}