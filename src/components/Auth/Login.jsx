import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'

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
    <div className="w-full max-w-sm mx-auto bg-card rounded-2xl shadow-card border border-border p-6">
      <h2 className="text-xl font-semibold mb-4">{t('login')}</h2>

      <button
        type="button"
        onClick={handleGoogle}
        disabled={googleSubmitting}
        className="w-full flex items-center justify-center gap-2 border border-border bg-page hover:bg-border/40 disabled:opacity-50 text-ink font-medium rounded-lg py-2 transition mb-3"
      >
        <GoogleIcon />
        {googleSubmitting ? '...' : 'Continue with Google'}
      </button>

      <div className="flex items-center gap-3 mb-3">
        <div className="flex-1 h-px bg-border" />
        <span className="text-xs text-ink-soft">or</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="email"
          placeholder={t('emailPlaceholder')}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full border border-border bg-page rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
        />
        <input
          type="password"
          placeholder={t('passwordPlaceholder')}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full border border-border bg-page rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-accent hover:bg-accent-hover disabled:opacity-50 text-white font-medium rounded-lg py-2 transition"
        >
          {submitting ? t('loggingIn') : t('login')}
        </button>
      </form>
      <p className="text-sm text-ink-soft mt-4 text-center">
        {t('noAccount')}{' '}
        <button onClick={onSwitchToSignup} className="text-accent hover:underline">
          {t('signup')}
        </button>
      </p>
    </div>
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