import { useState, useEffect } from 'react'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import { useRoom } from '../../context/RoomContext'
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'

export default function MembersList() {
  const { roomData } = useRoom()
  const { user } = useAuth()
  const { t } = useLanguage()
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const uids = roomData?.members || []
    if (uids.length === 0) {
      setMembers([])
      setLoading(false)
      return
    }

    setLoading(true)
    Promise.all(
      uids.map(async (uid) => {
        if (uid === user?.uid) {
          return {
            uid,
            displayName: user.displayName || user.email?.split('@')[0] || 'Student',
          }
        }
        try {
          const snap = await getDoc(doc(db, 'users', uid))
          if (snap.exists()) {
            return { uid, ...snap.data() }
          }
          return { uid, displayName: 'Student' }
        } catch {
          return { uid, displayName: 'Student' }
        }
      })
    ).then((results) => {
      setMembers(results)
      setLoading(false)
    })
  }, [roomData?.members, user])

  return (
    <div className="bg-card rounded-3xl shadow-card border border-border p-6">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-8 h-8 rounded-xl bg-accent-soft flex items-center justify-center shrink-0">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <circle cx="9" cy="8" r="3.2" stroke="var(--color-accent-ink)" strokeWidth="1.8"/>
            <path d="M3.5 19c0-3 2.5-5 5.5-5s5.5 2 5.5 5" stroke="var(--color-accent-ink)" strokeWidth="1.8" strokeLinecap="round"/>
            <path d="M16 8.5a2.8 2.8 0 1 1 0-.01" stroke="var(--color-accent-ink)" strokeWidth="1.8" strokeLinecap="round"/>
            <path d="M15 14.2c2.4.3 4 1.9 4 4.3" stroke="var(--color-accent-ink)" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
        </div>
        <h2 className="font-serif font-medium text-xl text-ink">{t('members')}</h2>
      </div>

      {loading && (
        <p className="text-ink-soft text-sm text-center py-6">...</p>
      )}

      {!loading && members.length === 0 && (
        <p className="text-ink-soft text-sm text-center py-6">
          {t('noMembers')}
        </p>
      )}

      {!loading && members.length > 0 && (
        <ul className="space-y-2">
          {members.map(function (member) {
            const isAdmin = member.uid === roomData?.createdBy
            const isMe = member.uid === user?.uid
            const initial = (member.displayName || '?').charAt(0).toUpperCase()
            return (
              <li
                key={member.uid}
                className="flex items-center justify-between bg-almond rounded-2xl px-4 py-2.5"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-sage-soft text-sage flex items-center justify-center text-xs font-bold shrink-0">
                    {initial}
                  </div>
                  <span className="text-sm text-ink">
                    {member.displayName}
                    {isMe && <span className="text-ink-soft"> (you)</span>}
                  </span>
                </div>
                {isAdmin && (
                  <span className="text-xs font-semibold bg-accent-soft text-accent-ink px-2.5 py-1 rounded-full">
                    {t('admin')}
                  </span>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}