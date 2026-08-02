import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'

export default function Signup({ onSwitchToLogin }) {
  const { signup } = useAuth()
  const { t } = useLanguage()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    setSubmitting(true)
    try {
      await signup(email, password)
    } catch (err) {
      setError(friendlyError(err.code))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="w-full max-w-sm mx-auto bg-card rounded-2xl shadow-card border border-border p-6">
      <h2 className="text-xl font-semibold mb-4">{t('signup')}</h2>
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
          placeholder={t('passwordMinPlaceholder')}
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
          {submitting ? t('creatingAccount') : t('signup')}
        </button>
      </form>
      <p className="text-sm text-ink-soft mt-4 text-center">
        {t('haveAccount')}{' '}
        <button onClick={onSwitchToLogin} className="text-accent hover:underline">
          {t('login')}
        </button>
      </p>
    </div>
  )
}

function friendlyError(code) {
  switch (code) {
    case 'auth/email-already-in-use':
      return 'That email is already registered.'
    case 'auth/invalid-email':
      return 'Please enter a valid email.'
    case 'auth/weak-password':
      return 'Password is too weak.'
    default:
      return 'Something went wrong. Please try again.'
  }
}