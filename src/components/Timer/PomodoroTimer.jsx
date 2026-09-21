import { useState, useEffect, useRef } from 'react'
import { useLanguage } from '../../context/LanguageContext'

const DEFAULT_FOCUS = 25
const DEFAULT_BREAK = 5

const Icons = {
  Skip: () => (
    <svg className="w-3.5 h-3.5 fill-current inline-block" viewBox="0 0 24 24">
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

  const totalSeconds = (mode === 'focus' ? focusMinutes : breakMinutes) * 60
  const fraction = totalSeconds > 0 ? secondsLeft / totalSeconds : 0
  const radius = 78
  const circumference = 2 * Math.PI * radius
  const dashOffset = circumference * (1 - fraction)
  const ringColor = mode === 'focus' ? 'var(--color-accent)' : 'var(--color-sage)'

  return (
    <div className="bg-card rounded-3xl shadow-card border border-border p-5 w-full flex flex-col items-center">
      <p className={`text-xs uppercase tracking-wide font-bold mb-4 ${mode === 'focus' ? 'text-accent-ink' : 'text-sage'}`}>
        {mode === 'focus' ? t('focusSession') : t('breakTime')}
      </p>

      {/* Circular clock face */}
      <div className="relative w-44 h-44 mb-4">
        <svg width="176" height="176" viewBox="0 0 176 176" className="-rotate-90">
          <circle cx="88" cy="88" r={radius} fill="none" stroke="var(--color-almond)" strokeWidth="10" />
          <circle
            cx="88" cy="88" r={radius} fill="none"
            stroke={ringColor} strokeWidth="10" strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            style={{ transition: 'stroke-dashoffset 1s linear' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-serif text-4xl font-medium tabular-nums text-ink">{display}</span>
        </div>
      </div>

      <div className="flex gap-2 mb-4 w-full">
        <label className="flex-1 text-xs text-ink-soft">
          {t('focusMinutes')}
          <input
            type="number"
            min="1"
            value={focusMinutes}
            disabled={isRunning}
            onChange={(e) => handleFocusChange(e.target.value)}
            className="w-full mt-1 border-[1.5px] border-almond bg-card rounded-xl px-2.5 py-1.5 text-sm disabled:opacity-50 text-ink focus:outline-none focus:border-accent transition"
          />
        </label>
        <label className="flex-1 text-xs text-ink-soft">
          {t('breakMinutes')}
          <input
            type="number"
            min="1"
            value={breakMinutes}
            disabled={isRunning}
            onChange={(e) => handleBreakChange(e.target.value)}
            className="w-full mt-1 border-[1.5px] border-almond bg-card rounded-xl px-2.5 py-1.5 text-sm disabled:opacity-50 text-ink focus:outline-none focus:border-accent transition"
          />
        </label>
      </div>

      <div className="flex gap-2 w-full">
        <button
          onClick={isRunning ? () => setIsRunning(false) : handleStart}
          className="flex-1 bg-accent hover:bg-accent-hover text-white text-sm font-bold rounded-xl py-2 transition"
        >
          {isRunning ? t('pause') : t('startFocus')}
        </button>
        <button
          onClick={handleReset}
          className="flex-1 border-[1.5px] border-almond text-ink text-sm rounded-xl py-2 font-semibold hover:bg-almond transition"
        >
          {t('reset')}
        </button>
        <button
          onClick={handleSkip}
          className="border-[1.5px] border-almond text-ink text-sm rounded-xl py-2 px-3 font-semibold hover:bg-almond transition flex items-center justify-center"
          aria-label={t('skip')}
        >
          <Icons.Skip />
        </button>
      </div>
    </div>
  )
}