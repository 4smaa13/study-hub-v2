import { useState, useEffect, useRef } from 'react'
import { doc, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import { useRoom } from '../../context/RoomContext'
import { useLanguage } from '../../context/LanguageContext'
import { uploadToCloudinary } from '../../lib/cloudinary'

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
    <div className="bg-card rounded-2xl shadow-card border border-border p-6">
      <h2 className="text-lg font-semibold mb-4 text-ink">📅 {t('scheduleTitle')}</h2>

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
            className="w-full bg-accent hover:bg-accent-hover disabled:opacity-50 text-white font-medium rounded-lg py-2 transition"
          >
            {uploading ? t('connecting') : `📤 ${t('upload')} (Admin Only)`}
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
            className="w-full rounded-lg border border-border cursor-zoom-in"
          />
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-ink-soft">
              ⏳ {t('lastUpdated')}:{' '}
              {updatedAt ? updatedAt.toLocaleString() : '--'}
            </p>
            {isAdmin && (
              <button
                onClick={handleRemove}
                disabled={removing}
                className="text-xs text-red-500 hover:underline disabled:opacity-50"
              >
                {removing ? '...' : `🗑️ ${t('removeSchedule')}`}
              </button>
            )}
          </div>
        </div>
      )}

      {!loading && !loadError && !scheduleUrl && (
        <p className="text-ink-soft text-sm text-center py-6">
          📜 {t('noSchedule')}
        </p>
      )}

      {enlarged && scheduleUrl && (
        <div
          onClick={() => setEnlarged(false)}
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 cursor-zoom-out p-6"
        >
          <img
            src={scheduleUrl}
            alt="Enlarged Class Schedule"
            className="max-w-full max-h-full rounded-lg"
          />
        </div>
      )}
    </div>
  )
}