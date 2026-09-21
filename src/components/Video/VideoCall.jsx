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
      <div className="bg-card rounded-3xl shadow-card border border-border p-6">
        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-8 h-8 rounded-xl bg-accent-soft flex items-center justify-center shrink-0 text-accent-ink">
            <CameraIcon />
          </div>
          <h2 className="font-serif font-medium text-xl text-ink">{t('videoTitle')}</h2>
        </div>
        <p className="text-ink-soft text-sm">{t('joinRoomForVideo')}</p>
      </div>
    )
  }

  return (
    <div className="bg-card rounded-3xl shadow-card border border-border p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-accent-soft flex items-center justify-center shrink-0 text-accent-ink">
            <CameraIcon />
          </div>
          <h2 className="font-serif font-medium text-xl text-ink">{t('videoTitle')}</h2>
        </div>
        {hasJoined && (
          <button
            onClick={handleLeave}
            className="text-xs text-red-500 hover:underline whitespace-nowrap font-semibold"
          >
            {t('leaveCall')}
          </button>
        )}
      </div>

      {!hasJoined && (
        <div className="flex flex-col items-center justify-center h-[300px] bg-almond/60 border border-dashed border-almond rounded-2xl">
          <p className="text-ink-soft text-sm mb-4">
            {t('joinCallHint')}
          </p>
          <button
            onClick={handleJoin}
            disabled={loading}
            className="bg-accent hover:bg-accent-hover disabled:opacity-50 text-white font-bold text-sm rounded-2xl px-6 py-2.5 transition"
          >
            {loading ? t('connecting') : t('joinCall')}
          </button>
        </div>
      )}

      <div
        ref={containerRef}
        className="rounded-2xl overflow-hidden border border-border"
        style={{ height: hasJoined ? '500px' : '0px', width: '100%' }}
      />
    </div>
  )
}

function CameraIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <rect x="2" y="6" width="14" height="12" rx="2.5" stroke="currentColor" strokeWidth="1.8"/>
      <path d="M16 10.5L22 7v10l-6-3.5" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
    </svg>
  )
}