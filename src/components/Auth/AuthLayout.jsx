import { useLanguage } from '../../context/LanguageContext'

export default function AuthLayout({ activeTab, onSwitchToLogin, onSwitchToSignup, eyebrow, title, children }) {
  const { t, language, toggleLanguage } = useLanguage()

  return (
    <div className="w-full max-w-4xl mx-auto bg-card rounded-[28px] shadow-card border border-border overflow-hidden grid md:grid-cols-2">

      {/* Illustration side */}
      <div className="hidden md:flex flex-col justify-between bg-almond p-10">
        <div className="flex items-center gap-2.5 font-serif font-semibold text-lg text-ink">
          <span className="w-7 h-7 rounded-[9px] bg-accent flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M4 4L20 4L20 20L4 20L4 4Z" stroke="white" strokeWidth="2" strokeLinejoin="round" />
              <path d="M8 9H16" stroke="white" strokeWidth="2" strokeLinecap="round" />
              <path d="M8 13H14" stroke="white" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </span>
          Study Hub
        </div>

        <div className="flex items-center justify-center py-4">
          <DeskIllustration />
        </div>

        <div>
          <button
            onClick={toggleLanguage}
            className="text-xs font-bold text-sage bg-sage-soft px-3 py-1.5 rounded-full mb-3.5"
          >
            {language === 'ar' ? 'English' : 'العربية'}
          </button>
          <p className="font-serif text-2xl font-medium leading-snug text-ink max-w-[280px]">
            {t('authTagline')}
          </p>
        </div>
      </div>

      {/* Form side */}
      <div className="p-8 sm:p-12 flex flex-col justify-center">
        <div className="max-w-sm w-full mx-auto">
          {eyebrow && <p className="text-sm text-ink-soft mb-1.5">{eyebrow}</p>}
          <h1 className="font-serif font-medium text-3xl text-ink mb-7 leading-tight">{title}</h1>

          <div className="flex bg-almond rounded-full p-1 mb-7">
            <button
              onClick={onSwitchToLogin}
              className={`flex-1 text-center py-2 text-sm font-semibold rounded-full transition ${
                activeTab === 'login' ? 'bg-card text-ink shadow-card' : 'text-ink-soft'
              }`}
            >
              {t('login')}
            </button>
            <button
              onClick={onSwitchToSignup}
              className={`flex-1 text-center py-2 text-sm font-semibold rounded-full transition ${
                activeTab === 'signup' ? 'bg-card text-ink shadow-card' : 'text-ink-soft'
              }`}
            >
              {t('signup')}
            </button>
          </div>

          {children}
        </div>
      </div>
    </div>
  )
}

function DeskIllustration() {
  return (
    <svg width="240" height="220" viewBox="0 0 280 260" fill="none">
      <ellipse cx="140" cy="235" rx="110" ry="14" fill="var(--color-border)" />
      <rect x="40" y="150" width="200" height="10" rx="5" fill="var(--color-border)" />
      <rect x="55" y="160" width="8" height="60" fill="var(--color-ink-soft)" opacity="0.4" />
      <rect x="217" y="160" width="8" height="60" fill="var(--color-ink-soft)" opacity="0.4" />
      <rect x="95" y="60" width="70" height="90" rx="8" fill="var(--color-card)" />
      <rect x="105" y="72" width="50" height="6" rx="3" fill="var(--color-accent)" />
      <rect x="105" y="86" width="50" height="6" rx="3" fill="var(--color-sage)" />
      <rect x="105" y="100" width="34" height="6" rx="3" fill="var(--color-honey)" />
      <circle cx="205" cy="110" r="26" fill="var(--color-sage)" />
      <path d="M205 84C205 84 190 96 192 116C194 132 218 132 220 116C222 96 205 84 205 84Z" fill="var(--color-sage)" opacity="0.7" />
      <rect x="198" y="132" width="14" height="18" fill="var(--color-accent-hover)" />
      <path d="M60 150C60 120 68 96 70 90" stroke="var(--color-sage)" strokeWidth="6" strokeLinecap="round" />
      <circle cx="72" cy="86" r="16" fill="var(--color-sage)" />
      <circle cx="58" cy="98" r="12" fill="var(--color-sage)" opacity="0.7" />
      <circle cx="82" cy="102" r="11" fill="var(--color-sage)" opacity="0.7" />
      <path d="M165 150L165 100" stroke="var(--color-accent-hover)" strokeWidth="4" />
      <path d="M165 100C165 100 165 76 190 70" stroke="var(--color-ink)" strokeWidth="4" strokeLinecap="round" />
      <path d="M188 58L215 74L182 88Z" fill="var(--color-honey)" />
      <ellipse cx="200" cy="90" rx="30" ry="14" fill="var(--color-honey)" opacity="0.3" />
    </svg>
  )
}