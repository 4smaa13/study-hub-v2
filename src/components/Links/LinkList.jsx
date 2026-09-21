import { useState, useEffect, useRef } from 'react'
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  query,
  orderBy,
} from 'firebase/firestore'
import { db } from '../../lib/firebase'
import { useRoom } from '../../context/RoomContext'
import { useLanguage } from '../../context/LanguageContext'
import { uploadToCloudinary } from '../../lib/cloudinary'

export default function LinkList() {
  const { roomCode } = useRoom()
  const { t } = useLanguage()
  const [links, setLinks] = useState([])
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [isPdf, setIsPdf] = useState(false)
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef(null)

  useEffect(() => {
    if (!roomCode) return
    const linksRef = collection(db, 'rooms', roomCode, 'links')
    const q = query(linksRef, orderBy('createdAt', 'desc'))

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setLinks(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })))
    })

    return unsubscribe
  }, [roomCode])

  async function handleAddLink(e) {
    e.preventDefault()
    setError('')
    if (!title.trim() || !url.trim()) return

    try {
      new URL(url.trim())
    } catch {
      setError('Please enter a valid URL (starting with http:// or https://)')
      return
    }

    const linksRef = collection(db, 'rooms', roomCode, 'links')
    await addDoc(linksRef, {
      title: title.trim(),
      url: url.trim(),
      isPdf: isPdf,
      createdAt: serverTimestamp(),
    })
    setTitle('')
    setUrl('')
    setIsPdf(false)
  }

  async function handlePdfSelect(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setError('')

    if (file.type !== 'application/pdf') {
      setError('Please choose a PDF file.')
      e.target.value = ''
      return
    }

    setUploading(true)
    try {
      const result = await uploadToCloudinary(file)
      setUrl(result.url)
      setIsPdf(true)
      if (!title.trim()) {
        setTitle(file.name.replace(/\.pdf$/i, ''))
      }
    } catch (err) {
      console.error('PDF upload error:', err)
      setError(err.message || 'Failed to upload the PDF. Try again.')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  async function deleteLink(linkId) {
    await deleteDoc(doc(db, 'rooms', roomCode, 'links', linkId))
  }

  return (
    <div className="bg-card rounded-3xl shadow-card border border-border p-6">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-8 h-8 rounded-xl bg-accent-soft flex items-center justify-center shrink-0">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M10 13a5 5 0 0 0 7.07 0l2.83-2.83a5 5 0 0 0-7.07-7.07L11.5 4.5" stroke="var(--color-accent-ink)" strokeWidth="1.8" strokeLinecap="round"/>
            <path d="M14 11a5 5 0 0 0-7.07 0L4.1 13.83a5 5 0 0 0 7.07 7.07L12.5 19.5" stroke="var(--color-accent-ink)" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
        </div>
        <h2 className="font-serif font-medium text-xl text-ink">{t('linksTitle')}</h2>
      </div>

      <form onSubmit={handleAddLink} className="space-y-2.5 mb-4">
        <input
          type="text"
          placeholder={t('linkTitlePlaceholder')}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border-[1.5px] border-almond bg-card rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:border-accent transition"
        />
        <input
          type="text"
          placeholder={t('linkUrlPlaceholder')}
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="w-full border-[1.5px] border-almond bg-card rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:border-accent transition"
        />

        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          onChange={handlePdfSelect}
          disabled={uploading}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="w-full border-[1.5px] border-almond text-ink-soft hover:text-ink hover:bg-almond disabled:opacity-50 rounded-2xl py-2.5 text-sm font-semibold transition"
        >
          {uploading ? '...' : 'or upload a PDF instead'}
        </button>

        <label className="flex items-center gap-2 text-sm text-ink-soft px-1">
          <input
            type="checkbox"
            checked={isPdf}
            onChange={(e) => setIsPdf(e.target.checked)}
            className="w-4 h-4 accent-sage rounded"
          />
          {t('isPdfLabel')}
        </label>
        {error && <p className="text-sm text-red-500">{error}</p>}
        <button
          type="submit"
          className="w-full bg-accent hover:bg-accent-hover text-white font-bold text-sm rounded-2xl py-2.5 transition"
        >
          {t('addLink')}
        </button>
      </form>

      {links.length === 0 && (
        <p className="text-ink-soft text-sm text-center py-6">
          {t('noLinks')}
        </p>
      )}

      {links.length > 0 && (
        <ul className="space-y-2">
          {links.map(function (link) {
            return (
              <li
                key={link.id}
                className="flex items-center justify-between bg-almond rounded-2xl px-4 py-3 transition"
              >
          <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 text-accent-ink hover:underline flex-1 truncate"
                >
                  <span className="text-sm">{link.isPdf ? '📄' : '🔖'}</span>
                  <span className="truncate text-sm font-medium">{link.title}</span>
                </a>
                <button
                  onClick={() => deleteLink(link.id)}
                  className="text-ink-soft hover:text-red-500 transition px-2"
                  aria-label="Delete link"
                >
                  ✕
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}