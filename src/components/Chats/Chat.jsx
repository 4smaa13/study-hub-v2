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
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'

export default function Chat() {
  const { roomCode } = useRoom()
  const { user } = useAuth()
  const { t } = useLanguage()
  const senderName = user?.displayName || user?.email?.split('@')[0] || 'Anonymous'
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [sendError, setSendError] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    if (!roomCode) return
    setLoading(true)
    setLoadError('')

    const messagesRef = collection(db, 'rooms', roomCode, 'messages')
    const q = query(messagesRef, orderBy('createdAt', 'asc'))

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setMessages(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })))
        setLoading(false)
      },
      (err) => {
        console.error('Chat load error:', err)
        setLoadError(
          err.code === 'permission-denied'
            ? t('chatNoAccess')
            : t('chatConnectionError')
        )
        setLoading(false)
      }
    )

    return unsubscribe
  }, [roomCode])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleSend(e) {
    e.preventDefault()
    if (!text.trim() || sending) return

    setSending(true)
    setSendError('')
    const messageText = text.trim()

    try {
      const messagesRef = collection(db, 'rooms', roomCode, 'messages')
      await addDoc(messagesRef, {
        text: messageText,
        sender: senderName,
        createdAt: serverTimestamp(),
      })
      setText('')
    } catch (err) {
      console.error('Send message error:', err)
      setSendError(t('sendFailed'))
    } finally {
      setSending(false)
    }
  }

  async function deleteMessage(messageId) {
    try {
      await deleteDoc(doc(db, 'rooms', roomCode, 'messages', messageId))
    } catch (err) {
      console.error('Delete message error:', err)
    }
  }

  return (
    <div className="bg-card rounded-2xl shadow-card border border-border p-6 flex flex-col h-[500px]">
      <h2 className="text-lg font-semibold mb-4">{t('chatTitle')}</h2>

      <div className="flex-1 overflow-y-auto space-y-2 mb-4 pr-1">
        {loading && (
          <p className="text-ink-soft text-sm text-center py-6">
            {t('loadingMessages')}
          </p>
        )}

        {!loading && loadError && (
          <p className="text-red-500 text-sm text-center py-6">{loadError}</p>
        )}

        {!loading && !loadError && messages.length === 0 && (
          <p className="text-ink-soft text-sm text-center py-6">
            {t('noMessages')}
          </p>
        )}

        {!loading &&
          !loadError &&
          messages.map(function (msg) {
            const isMe = msg.sender === senderName
            return (
              <div
                key={msg.id}
                className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`group max-w-[75%] rounded-lg px-3 py-2 ${
                    isMe
                      ? 'bg-accent text-white'
                      : 'bg-page text-ink border border-border'
                  }`}
                >
                  {!isMe && (
                    <p className="text-xs font-semibold opacity-70 mb-0.5">
                      {msg.sender}
                    </p>
                  )}
                  <p className="text-sm break-words">{msg.text}</p>
                  {isMe && (
                    <button
                      onClick={() => deleteMessage(msg.id)}
                      className="text-[10px] opacity-0 group-hover:opacity-70 hover:opacity-100 transition mt-1"
                      aria-label="Delete message"
                    >
                      {t('deleteWord')}
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        <div ref={bottomRef} />
      </div>

      {sendError && (
        <p className="text-red-500 text-xs mb-2">{sendError}</p>
      )}

      <form onSubmit={handleSend} className="flex gap-2">
        <input
          type="text"
          placeholder={t('chatPlaceholder')}
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={sending}
          className="flex-1 border border-border bg-page rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={sending || !text.trim()}
          className="bg-accent hover:bg-accent-hover disabled:opacity-50 text-white font-medium rounded-lg px-4 py-2 transition"
        >
          {sending ? '...' : t('send')}
        </button>
      </form>
    </div>
  )
}