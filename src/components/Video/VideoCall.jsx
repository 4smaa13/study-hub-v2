import { useState, useRef, useEffect } from 'react'
import { useRoom } from '../../context/RoomContext'
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'

const JITSI_SCRIPT_SRC = 'https://meet.jit.si/external_api.js'

function loadJitsiScript() {
  return new Promise((resolve, reject) => {
    if (window.JitsiMeetExternalAPI) {
      resolve()
      return
    }
    const existing = document.querySelector(`script[src="${JITSI_SCRIPT_SRC}"]`)
    if (existing) {
      existing.addEventListener('load', () => resolve())
      existing.addEventListener('error', reject)
      return
    }
    const script = document.createElement('script')
    script.src = JITSI_SCRIPT_SRC
    script.async = true
    script.onload = () => resolve()
    script.onerror = reject
    document.body.appendChild(script)
  })
}

export default function VideoCall() {
  const { roomCode } = useRoom()
  const { user } = useAuth()
  const { t } = useLanguage()
  const [hasJoined, setHasJoined] = useState(false)
  const [loading, setLoading] = useState(false)
  const containerRef = useRef(null)
  const apiRef = useRef(null)

  const jitsiRoomName = `StudyHub-${roomCode}`

  async function handleJoin() {
    setLoading(true)
    await loadJitsiScript()

    apiRef.current = new window.JitsiMeetExternalAPI('meet.jit.si', {
      roomName: jitsiRoomName,
      parentNode: containerRef.current,
      width: '100%',
      height: '100%',
      userInfo: {
        displayName: user?.email?.split('@')[0] || 'Student',
      },
      configOverwrite: {
        prejoinPageEnabled: false,
      },
    })

    apiRef.current.addEventListener('readyToClose', () => {
      handleLeave()
    })

    setLoading(false)
    setHasJoined(true)
  }

  function handleLeave() {
    if (apiRef.current) {
      apiRef.current.dispose()
      apiRef.current = null
    }
    setHasJoined(false)
  }

  useEffect(() => {
    return () => {
      if (apiRef.current) {
        apiRef.current.dispose()
        apiRef.current = null
      }
    }
  }, [])

  if (!roomCode) {
    return (
      <div className="bg-card rounded-2xl shadow-card border border-border p-6">
        <h2 className="text-lg font-semibold mb-2">{t('videoTitle')}</h2>
        <p className="text-ink-soft text-sm">{t('joinRoomForVideo')}</p>
      </div>
    )
  }

  return (
    <div className="bg-card rounded-2xl shadow-card border border-border p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">{t('videoTitle')}</h2>
        {hasJoined && (
          <button
            onClick={handleLeave}
            className="text-xs text-red-500 hover:underline whitespace-nowrap"
          >
            {t('leaveCall')}
          </button>
        )}
      </div>

      {!hasJoined && (
        <div className="flex flex-col items-center justify-center h-[300px] border border-dashed border-border rounded-xl">
          <p className="text-ink-soft text-sm mb-4">
            {t('joinCallHint')}
          </p>
          <button
            onClick={handleJoin}
            disabled={loading}
            className="bg-accent hover:bg-accent-hover disabled:opacity-50 text-white font-medium rounded-lg px-6 py-2 transition"
          >
            {loading ? t('connecting') : t('joinCall')}
          </button>
        </div>
      )}

      <div
        ref={containerRef}
        className="rounded-xl overflow-hidden border border-border"
        style={{ height: hasJoined ? '500px' : '0px', width: '100%' }}
      />
    </div>
  )
}