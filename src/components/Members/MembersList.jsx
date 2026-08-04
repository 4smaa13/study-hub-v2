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
    <div className="bg-card rounded-2xl shadow-card border border-border p-6">
      <h2 className="text-lg font-semibold mb-4">👥 {t('members')}</h2>

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
            return (
              <li
                key={member.uid}
                className="flex items-center justify-between border border-border rounded-lg px-3 py-2"
              >
                <span className="text-sm">
                  {member.displayName}
                  {isMe && <span className="text-ink-soft"> (you)</span>}
                </span>
                {isAdmin && (
                  <span className="text-xs font-semibold bg-accent-soft text-accent-ink px-2 py-0.5 rounded-full">
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