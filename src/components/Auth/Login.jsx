import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'
import AuthLayout from './AuthLayout'

export default function Login({ onSwitchToSignup }) {
  const { login, loginWithGoogle } = useAuth()
  const { t } = useLanguage()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [googleSubmitting, setGoogleSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await login(email, password)
    } catch (err) {
      setError(friendlyError(err.code))
    } finally {
      setSubmitting(false)
    }
  }

  async function handleGoogle() {
    setError('')
    setGoogleSubmitting(true)
    try {
      await loginWithGoogle()
    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user') {
        setError(friendlyError(err.code))
      }
    } finally {
      setGoogleSubmitting(false)
    }
  }

  return (
    <AuthLayout
      activeTab="login"
      onSwitchToLogin={() => {}}
      onSwitchToSignup={onSwitchToSignup}
      eyebrow={t('welcome')}
      title="Let's get you studying."
    >
      <button
        type="button"
        onClick={handleGoogle}
        disabled={googleSubmitting}
        className="w-full flex items-center justify-center gap-2 border border-border bg-card hover:bg-almond disabled:opacity-50 text-ink font-semibold text-sm rounded-2xl py-3 transition mb-5"
      >
        <GoogleIcon />
        {googleSubmitting ? '...' : 'Continue with Google'}
      </button>

      <div className="flex items-center gap-3 mb-5 text-ink-soft text-xs">
        <div className="flex-1 h-px bg-border" />
        or
        <div className="flex-1 h-px bg-border" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-ink-soft mb-1.5">{t('emailPlaceholder')}</label>
          <input
            type="email"
            placeholder="you@university.edu"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full border-[1.5px] border-almond bg-card rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-accent transition"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-ink-soft mb-1.5">{t('passwordPlaceholder')}</label>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full border-[1.5px] border-almond bg-card rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-accent transition"
          />
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-accent hover:bg-accent-hover disabled:opacity-50 text-white font-bold text-sm rounded-2xl py-3.5 transition"
        >
          {submitting ? t('loggingIn') : t('login')}
        </button>
      </form>

      <p className="text-sm text-ink-soft mt-6 text-center">
        {t('noAccount')}{' '}
        <button onClick={onSwitchToSignup} className="text-accent-ink font-semibold hover:underline">
          {t('signup')}
        </button>
      </p>
    </AuthLayout>
  )
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.91c1.7-1.57 2.69-3.88 2.69-6.62z"/>
      <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.91-2.26c-.81.54-1.85.86-3.05.86-2.34 0-4.33-1.58-5.04-3.71H.95v2.33A9 9 0 0 0 9 18z"/>
      <path fill="#FBBC05" d="M3.96 10.71a5.4 5.4 0 0 1 0-3.42V4.96H.95a9 9 0 0 0 0 8.08l3.01-2.33z"/>
      <path fill="#EA4335" d="M9 3.58c1.32 0 2.51.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .95 4.96l3.01 2.33C4.67 5.16 6.66 3.58 9 3.58z"/>
    </svg>
  )
}

function friendlyError(code) {
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Incorrect email or password.'
    case 'auth/invalid-email':
      return 'Please enter a valid email.'
    case 'auth/account-exists-with-different-credential':
      return 'This email is already registered with a password. Try logging in that way instead.'
    default:
      return 'Something went wrong. Please try again.'
  }
}