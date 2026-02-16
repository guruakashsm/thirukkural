import { Link } from 'react-router-dom'
import { useLanguage } from '../contexts/LanguageContext'
import thiruvalluvarImg from '../assets/thiruvalluvar.png'
import packageJson from '../../package.json'

const CONTACT_EMAIL = 'guruakashsm@gmail.com'
const APP_VERSION = packageJson.version

export default function Footer() {
  const { t } = useLanguage()
  const primaryLinks = [
    { to: '/', label: t('home') },
    { to: '/search', label: t('search') },
    { to: '/watchlist', label: t('watchlist') },
    { to: '/about', label: t('aboutUs') },
    { to: '/contact', label: t('contact') },
    { to: '/quiz', label: t('quiz') },
    { to: '/history', label: t('historyShort') },
    { to: '/explore', label: t('blog') },
  ]
  const appUrl = typeof window !== 'undefined'
    ? window.location.href
    : 'https://example.com'
  const shareText = encodeURIComponent('Discover timeless Thirukkural wisdom')
  const shareUrl = encodeURIComponent(appUrl)
  const socialLinks = [
    {
      label: 'X',
      href: `https://x.com/intent/tweet?text=${shareText}&url=${shareUrl}`,
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M18.244 2H21.5l-7.12 8.136L22 22h-5.956l-4.662-6.105L6.04 22H2.78l7.614-8.705L2 2h6.108l4.214 5.552L18.244 2zm-1.045 18h1.804L7.13 3.894H5.194L17.2 20z" />
        </svg>
      ),
    },
    {
      label: 'Facebook',
      href: `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`,
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M13.5 22v-8.2h2.8l.5-3.2h-3.3V8.5c0-.9.4-1.7 1.9-1.7h1.5V4c-.3 0-.9-.1-1.9-.1-3.8 0-5.5 2-5.5 5.1v1.6H7v3.2h2.5V22h4z" />
        </svg>
      ),
    },
    {
      label: 'LinkedIn',
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`,
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M6.94 8.5a1.72 1.72 0 110-3.44 1.72 1.72 0 010 3.44zM5.4 20.5h3.07v-10H5.4v10zm5.15 0h3.07v-5.38c0-1.42.27-2.8 2.03-2.8 1.73 0 1.75 1.62 1.75 2.9v5.28h3.08v-5.91c0-2.9-.62-5.14-4-5.14-1.62 0-2.7.88-3.14 1.72h-.04V10.5h-2.95v10z" />
        </svg>
      ),
    },
  ]
  const pillClass = 'px-3.5 py-1.5 rounded-full text-cream/80 hover:text-cream border border-transparent hover:border-gold/35 hover:bg-gold/10 transition-all duration-200 no-underline text-sm font-medium'

  return (
    <footer className="mt-auto relative overflow-hidden bg-temple-brown border-t border-gold/25">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-16 -left-12 w-56 h-56 rounded-full bg-gold/10 blur-3xl" />
        <div className="absolute -bottom-16 -right-10 w-64 h-64 rounded-full bg-copper/10 blur-3xl" />
      </div>

      <div className="max-w-6xl mx-auto px-4 relative py-10 md:py-11">
        <div className="grid grid-cols-1 lg:grid-cols-[230px,1fr] gap-6 md:gap-8 lg:gap-10 items-start">
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

          <div className="space-y-5">
            <div className="flex items-center justify-center lg:justify-start gap-2 md:gap-3 flex-wrap">
              {primaryLinks.map((link) => (
                <Link key={link.to} to={link.to} className={pillClass}>
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="inline-flex items-center justify-center lg:justify-start gap-2 text-sm text-cream/80 hover:text-cream no-underline transition-colors"
              >
                <svg className="w-4 h-4 text-gold/80" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l8.28 5.52a1.25 1.25 0 001.44 0L21 8m-17 9h16a1 1 0 001-1V8a1 1 0 00-1-1H4a1 1 0 00-1 1v8a1 1 0 001 1z" />
                </svg>
                <span>{CONTACT_EMAIL}</span>
              </a>

              <div className="flex items-center justify-center lg:justify-start gap-2">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={social.label}
                    className="w-8 h-8 rounded-full border border-gold/30 text-cream/75 hover:text-cream hover:border-gold/55 hover:bg-gold/10 inline-flex items-center justify-center transition-all"
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="kolam-divider w-full mt-6 mb-3">
          <span className="text-gold/40 text-xs">&#10043;</span>
        </div>

        <div className="flex flex-col sm:flex-row gap-1.5 sm:gap-3 items-center sm:items-center sm:justify-between">
          <p className="text-xs text-cream/40">
            © {new Date().getFullYear()} Thirukkural
          </p>
          <p className="text-xs text-cream/45">
            Version {APP_VERSION}
          </p>
        </div>
      </div>
    </footer>
  )
}
