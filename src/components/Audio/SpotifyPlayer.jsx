import { useLanguage } from '../../context/LanguageContext'

// SVG Icon
const MusicIcon = () => (
  <svg className="w-5 h-5 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18V5l12-2v13"/>
    <circle cx="6" cy="18" r="3"/>
    <circle cx="18" cy="16" r="3"/>
  </svg>
)

export default function SpotifyPlayer() {
  const { t } = useLanguage()

  return (
    <div className="bg-card rounded-2xl shadow-card border border-border p-6 space-y-4">
      <div className="flex items-center gap-2 text-ink">
        <MusicIcon />
        <h2 className="text-lg font-semibold">{t('musicTitle') || 'Study Playlist'}</h2>
      </div>

      <div className="w-full overflow-hidden rounded-xl border border-border bg-page">
        <iframe
          style={{ borderRadius: '12px' }}
          src="https://open.spotify.com/embed/playlist/5Zwz0bqIOiknzCF8UsnHze?utm_source=generator&theme=0"
          width="100%"
          height="152"
          frameBorder="0"
          allowFullScreen=""
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
          title="Study Hub Playlist"
        />
      </div>
    </div>
  )
}