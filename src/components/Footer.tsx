import { Link } from 'react-router-dom'
import { useLanguage } from '../contexts/LanguageContext'
import thiruvalluvarImg from '../assets/thiruvalluvar.png'

export default function Footer() {
  const { t } = useLanguage()
  const topLinks = [
    { to: '/', label: t('home') },
    { to: '/search', label: t('search') },
    { to: '/watchlist', label: t('watchlist') },
  ]
  const bottomLinks = [
    { to: '/quiz', label: t('quiz') },
    { to: '/history', label: t('historyShort') },
    { to: '/explore', label: t('blog') },
    { to: '/about', label: t('aboutUs') },
    { to: '/contact', label: t('contact') },
  ]
  const linkClass = 'px-3.5 py-1.5 rounded-full text-cream/80 hover:text-cream border border-transparent hover:border-gold/35 hover:bg-gold/10 transition-all duration-200 no-underline text-sm font-medium whitespace-nowrap'

  return (
    <footer className="mt-auto relative overflow-hidden bg-temple-brown border-t border-gold/25">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-16 -left-12 w-56 h-56 rounded-full bg-gold/10 blur-3xl" />
        <div className="absolute -bottom-16 -right-10 w-64 h-64 rounded-full bg-copper/10 blur-3xl" />
      </div>

      <div className="max-w-6xl mx-auto px-4 relative py-10 md:py-11">
        <div className="grid grid-cols-1 lg:grid-cols-[230px,1fr] gap-6 md:gap-8 lg:gap-10 items-center">
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left gap-3">
            <img
              src={thiruvalluvarImg}
              alt="Thiruvalluvar"
              className="w-14 h-14 md:w-16 md:h-16 object-contain"
            />
            <p className="font-tamil text-base md:text-lg text-gold/70 leading-relaxed">
              திருவள்ளுவர் அருளிய திருக்குறள்
            </p>
            <p className="text-xs text-cream/45 leading-relaxed max-w-[220px]">
              {t('footerQuote')}
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-center lg:justify-start gap-2 md:gap-3 flex-wrap md:flex-nowrap">
              {topLinks.map((link) => (
                <Link key={link.to} to={link.to} className={linkClass}>
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="flex items-center justify-center lg:justify-start gap-2 md:gap-3 flex-wrap md:flex-nowrap">
              {bottomLinks.map((link) => (
                <Link key={link.to} to={link.to} className={linkClass}>
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="kolam-divider w-full mt-6 mb-3">
          <span className="text-gold/40 text-xs">&#10043;</span>
        </div>

        <p className="text-center lg:text-right text-xs text-cream/40">
          © {new Date().getFullYear()} Thirukkural
        </p>
      </div>
    </footer>
  )
}
