import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'

export default function Login({ onSwitchToSignup }) {
  const { login } = useAuth()
  const { t } = useLanguage()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

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

  return (
    <div className="w-full max-w-sm mx-auto bg-card rounded-2xl shadow-card border border-border p-6">
      <h2 className="text-xl font-semibold mb-4">{t('login')}</h2>
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

function friendlyError(code) {
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Incorrect email or password.'
    case 'auth/invalid-email':
      return 'Please enter a valid email.'
    default:
      return 'Something went wrong. Please try again.'
  }
}