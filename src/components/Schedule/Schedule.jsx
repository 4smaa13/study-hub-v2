import { useState, useEffect, useRef } from 'react'
import { doc, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import { useRoom } from '../../context/RoomContext'
import { useLanguage } from '../../context/LanguageContext'
import { uploadToCloudinary } from '../../lib/cloudinary'

// SVG Icons
const Icons = {
  Calendar: () => (
    <svg className="w-4 h-4 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  ),
  Upload: () => (
    <svg className="w-4 h-4 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="17 8 12 3 7 8"/>
      <line x1="12" y1="3" x2="12" y2="15"/>
    </svg>
  ),
  Clock: () => (
    <svg className="w-3.5 h-3.5 stroke-current inline-block" fill="none" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </svg>
  ),
  Trash: () => (
    <svg className="w-3.5 h-3.5 stroke-current inline-block" fill="none" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"/>
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
    </svg>
  ),
  FileText: () => (
    <svg className="w-4 h-4 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/>
      <polyline points="10 9 9 9 8 9"/>
    </svg>
  ),
}

export default function Schedule() {
  const { roomCode, isAdmin } = useRoom()
  const { t } = useLanguage()
  const [scheduleUrl, setScheduleUrl] = useState(null)
  const [updatedAt, setUpdatedAt] = useState(null)
  const [error, setError] = useState('')
  const [enlarged, setEnlarged] = useState(false)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [uploading, setUploading] = useState(false)
  const [removing, setRemoving] = useState(false)
  const fileInputRef = useRef(null)

  useEffect(() => {
    if (!roomCode) return
    setLoading(true)
    setLoadError('')

    const scheduleRef = doc(db, 'rooms', roomCode, 'meta', 'schedule')

    const unsubscribe = onSnapshot(
      scheduleRef,
      (snap) => {
        if (snap.exists()) {
          setScheduleUrl(snap.data().imageUrl)
          setUpdatedAt(snap.data().updatedAt?.toDate?.() ?? null)
        } else {
          setScheduleUrl(null)
          setUpdatedAt(null)
        }
        setLoading(false)
      },
      (err) => {
        console.error('Schedule load error:', err)
        setLoadError(
          err.code === 'permission-denied'
            ? t('chatNoAccess')
            : t('chatConnectionError')
        )
        setLoading(false)
      }
    )

    return unsubscribe
  }, [roomCode, t])

  async function handleFileSelect(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setError('')

    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file.')
      e.target.value = ''
      return
    }

    setUploading(true)
    try {
      const result = await uploadToCloudinary(file)
      const scheduleRef = doc(db, 'rooms', roomCode, 'meta', 'schedule')
      await setDoc(scheduleRef, {
        imageUrl: result.url,
        updatedAt: new Date(),
      })
    } catch (err) {
      console.error('Schedule upload error:', err)
      setError(err.message || 'Failed to upload the schedule. Try again.')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  async function handleRemove() {
    if (removing) return
    setRemoving(true)
    setError('')
    try {
      const scheduleRef = doc(db, 'rooms', roomCode, 'meta', 'schedule')
      await deleteDoc(scheduleRef)
    } catch (err) {
      console.error('Schedule remove error:', err)
      setError('Failed to remove the schedule. Try again.')
    } finally {
      setRemoving(false)
    }
  }

  return (
    <div className="bg-card rounded-3xl shadow-card border border-border p-6">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-8 h-8 rounded-xl bg-accent-soft flex items-center justify-center shrink-0 text-accent-ink">
          <Icons.Calendar />
        </div>
        <h2 className="font-serif font-medium text-xl text-ink">{t('scheduleTitle')}</h2>
      </div>

      {isAdmin && (
        <div className="mb-4">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            disabled={uploading}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="w-full bg-accent hover:bg-accent-hover disabled:opacity-50 text-white font-bold text-sm rounded-2xl py-2.5 transition flex items-center justify-center gap-2"
          >
            <Icons.Upload />
            <span>{uploading ? t('connecting') : `${t('upload')} (Admin Only)`}</span>
          </button>
        </div>
      )}
      {error && <p className="text-sm text-red-500 mb-2">{error}</p>}

      {loading && (
        <p className="text-ink-soft text-sm text-center py-6">
          {t('connecting')}
        </p>
      )}

      {!loading && loadError && (
        <p className="text-red-500 text-sm text-center py-6">{loadError}</p>
      )}

      {!loading && !loadError && scheduleUrl && (
        <div>
          <img
            src={scheduleUrl}
            alt="Official Class Schedule"
            onClick={() => setEnlarged(true)}
            className="w-full rounded-2xl border border-border cursor-zoom-in"
          />
          <div className="flex items-center justify-between mt-3">
            <p className="text-xs text-ink-soft flex items-center gap-1">
              <Icons.Clock />
              <span>{t('lastUpdated')}: {updatedAt ? updatedAt.toLocaleString() : '--'}</span>
            </p>
            {isAdmin && (
              <button
                onClick={handleRemove}
                disabled={removing}
                className="text-xs text-red-500 hover:underline disabled:opacity-50 flex items-center gap-1"
              >
                <Icons.Trash />
                <span>{removing ? '...' : t('removeSchedule')}</span>
              </button>
            )}
          </div>
        </div>
      )}

      {!loading && !loadError && !scheduleUrl && (
        <div className="flex flex-col items-center justify-center py-8 text-ink-soft text-sm gap-2 rounded-2xl bg-almond/60 border border-dashed border-almond">
          <Icons.FileText />
          <p>{t('noSchedule')}</p>
        </div>
      )}

      {enlarged && scheduleUrl && (
        <div
          onClick={() => setEnlarged(false)}
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 cursor-zoom-out p-6"
        >
          <img
            src={scheduleUrl}
            alt="Enlarged Class Schedule"
            className="max-w-full max-h-full rounded-2xl"
          />
        </div>
      )}
    </div>
  )
}