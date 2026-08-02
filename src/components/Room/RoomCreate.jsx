import { useState } from 'react'
import { useRoom } from '../../context/RoomContext'
import { useLanguage } from '../../context/LanguageContext'

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
    <div className="w-full max-w-md mx-auto bg-card rounded-2xl shadow-card border border-border p-6">
      <h2 className="text-lg font-semibold mb-4">{t('createLaunchRoom')}</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          placeholder={t('roomNamePlaceholder')}
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full border border-border bg-page rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
        />
        <input
          type="text"
          placeholder={t('roomCodeUniquePlaceholder')}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          required
          className="w-full border border-border bg-page rounded-lg px-3 py-2 uppercase focus:outline-none focus:ring-2 focus:ring-accent"
        />
        <input
          type="text"
          placeholder={t('institutionPlaceholder')}
          value={institution}
          onChange={(e) => setInstitution(e.target.value)}
          className="w-full border border-border bg-page rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onBack}
            className="flex-1 border border-border rounded-lg py-2 font-medium hover:bg-page transition"
          >
            {t('back')}
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-accent hover:bg-accent-hover disabled:opacity-50 text-white font-medium rounded-lg py-2 transition"
          >
            {loading ? t('creating') : t('createAndLaunch')}
          </button>
        </div>
      </form>
    </div>
  )
}