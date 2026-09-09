import { useState, useEffect, useRef } from 'react'
import { useLanguage } from '../../context/LanguageContext'

const DEFAULT_FOCUS = 25
const DEFAULT_BREAK = 5

// SVG Icons
const Icons = {
  Timer: () => (
    <svg className="w-5 h-5 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </svg>
  ),
  Skip: () => (
    <svg className="w-4 h-4 fill-current inline-block" viewBox="0 0 24 24">
      <polygon points="5,4 15,12 5,20"/>
      <rect x="15" y="4" width="4" height="16"/>
    </svg>
  ),
}

// Helper function to save completed focus sessions into localStorage
export function recordCompletedSession(minutes) {
  const existing = JSON.parse(localStorage.getItem('study_hub_sessions') || '[]')
  const newLog = {
    id: Date.now(),
    date: new Date().toISOString().split('T')[0],
    durationMinutes: Number(minutes) || 25,
    timestamp: new Date().toISOString()
  }
  localStorage.setItem('study_hub_sessions', JSON.stringify([...existing, newLog]))
}

export default function PomodoroTimer() {
  const { t } = useLanguage()
  const [focusMinutes, setFocusMinutes] = useState(DEFAULT_FOCUS)
  const [breakMinutes, setBreakMinutes] = useState(DEFAULT_BREAK)
  const [secondsLeft, setSecondsLeft] = useState(DEFAULT_FOCUS * 60)
  const [isRunning, setIsRunning] = useState(false)
  const [mode, setMode] = useState('focus')
  const intervalRef = useRef(null)

  function playBeep() {
    const AudioCtx = window.AudioContext || window.webkitAudioContext
    const ctx = new AudioCtx()

    const beepAt = (startTime, freq) => {
      const oscillator = ctx.createOscillator()
      const gain = ctx.createGain()
      oscillator.connect(gain)
      gain.connect(ctx.destination)
      oscillator.type = 'sine'
      oscillator.frequency.value = freq
      gain.gain.setValueAtTime(0.2, startTime)
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.25)
      oscillator.start(startTime)
      oscillator.stop(startTime + 0.25)
    }

    const now = ctx.currentTime
    beepAt(now, 880)
    beepAt(now + 0.3, 880)
    beepAt(now + 0.6, 1046)
  }

  useEffect(() => {
    if (!isRunning) return

    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          playBeep()

          // Log session to local storage only when a Focus session finishes
          if (mode === 'focus') {
            recordCompletedSession(focusMinutes)
          }

          const nextMode = mode === 'focus' ? 'break' : 'focus'
          const nextMinutes = nextMode === 'focus' ? focusMinutes : breakMinutes
          setMode(nextMode)
          return nextMinutes * 60
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(intervalRef.current)
  }, [isRunning, mode, focusMinutes, breakMinutes])

  function handleStart() {
    setIsRunning(true)
  }

  function handleReset() {
    setIsRunning(false)
    setMode('focus')
    setSecondsLeft(focusMinutes * 60)
  }

  function handleSkip() {
    const nextMode = mode === 'focus' ? 'break' : 'focus'
    const nextMinutes = nextMode === 'focus' ? focusMinutes : breakMinutes
    setMode(nextMode)
    setSecondsLeft(nextMinutes * 60)
  }

  function handleFocusChange(value) {
    const mins = Math.max(1, Number(value) || 1)
    setFocusMinutes(mins)
    if (!isRunning && mode === 'focus') setSecondsLeft(mins * 60)
  }

  function handleBreakChange(value) {
    const mins = Math.max(1, Number(value) || 1)
    setBreakMinutes(mins)
    if (!isRunning && mode === 'break') setSecondsLeft(mins * 60)
  }

  const minutes = Math.floor(secondsLeft / 60)
  const seconds = secondsLeft % 60
  const display = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`

  return (
    <div className="bg-card rounded-2xl shadow-card border border-border p-6">
      <div className="flex items-center gap-2 mb-4 text-ink">
        <Icons.Timer />
        <h2 className="text-lg font-semibold">{t('timerTitle')}</h2>
      </div>

      <div className="flex gap-4 mb-4">
        <label className="flex-1 text-sm text-ink-soft">
          {t('focusMinutes')}
          <input
            type="number"
            min="1"
            value={focusMinutes}
            disabled={isRunning}
            onChange={(e) => handleFocusChange(e.target.value)}
            className="w-full mt-1 border border-border bg-page rounded-lg px-2 py-1 disabled:opacity-50 text-ink"
          />
        </label>
        <label className="flex-1 text-sm text-ink-soft">
          {t('breakMinutes')}
          <input
            type="number"
            min="1"
            value={breakMinutes}
            disabled={isRunning}
            onChange={(e) => handleBreakChange(e.target.value)}
            className="w-full mt-1 border border-border bg-page rounded-lg px-2 py-1 disabled:opacity-50 text-ink"
          />
        </label>
      </div>

      <div className="text-center mb-4">
        <p className="text-sm uppercase tracking-wide font-semibold text-accent mb-1">
          {mode === 'focus' ? t('focusSession') : t('breakTime')}
        </p>
        <p className="text-5xl font-bold tabular-nums text-ink">{display}</p>
      </div>

      <div className="flex gap-2">
        <button
          onClick={isRunning ? () => setIsRunning(false) : handleStart}
          className="flex-1 bg-accent hover:bg-accent-hover text-white font-medium rounded-lg py-2 transition"
        >
          {isRunning ? t('pause') : t('startFocus')}
        </button>
        <button
          onClick={handleReset}
          className="flex-1 border border-border text-ink rounded-lg py-2 font-medium hover:bg-page transition"
        >
          {t('reset')}
        </button>
        <button
          onClick={handleSkip}
          className="flex-1 border border-border text-ink rounded-lg py-2 font-medium hover:bg-page transition flex items-center justify-center gap-1.5"
        >
          <span>{t('skip')}</span>
          <Icons.Skip />
        </button>
      </div>
    </div>
  )
}