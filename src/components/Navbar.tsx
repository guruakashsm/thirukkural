import { Link, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useKurals } from '../hooks/useKurals'
import { useLanguage } from '../contexts/LanguageContext'
import LanguageDropdown from './LanguageDropdown'
import thiruvalluvarImg from '../assets/thiruvalluvar.png'

function PuzzleIcon({ className }: { className: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M14.25 6.087c0-.355.186-.676.401-.959.221-.29.349-.634.349-1.003 0-1.036-1.007-1.875-2.25-1.875s-2.25.84-2.25 1.875c0 .369.128.713.349 1.003.215.283.401.604.401.959v0a.64.64 0 0 1-.657.643 48.39 48.39 0 0 1-4.163-.3c.186 1.613.293 3.25.315 4.907a.656.656 0 0 1-.658.663v0c-.355 0-.676-.186-.959-.401a1.647 1.647 0 0 0-1.003-.349c-1.036 0-1.875 1.007-1.875 2.25s.84 2.25 1.875 2.25c.369 0 .713-.128 1.003-.349.283-.215.604-.401.959-.401v0c.31 0 .555.26.532.57a48.039 48.039 0 0 1-.642 5.056c1.518.19 3.058.309 4.616.354a.64.64 0 0 0 .657-.643v0c0-.355-.186-.676-.401-.959a1.647 1.647 0 0 1-.349-1.003c0-1.035 1.008-1.875 2.25-1.875 1.243 0 2.25.84 2.25 1.875 0 .369-.128.713-.349 1.003-.215.283-.4.604-.4.959v0c0 .333.277.599.61.58a48.1 48.1 0 0 0 5.427-.63 48.05 48.05 0 0 0 .582-4.717.532.532 0 0 0-.533-.57v0c-.355 0-.676.186-.959.401-.29.221-.634.349-1.003.349-1.035 0-1.875-1.007-1.875-2.25s.84-2.25 1.875-2.25c.37 0 .713.128 1.003.349.283.215.604.401.96.401v0a.656.656 0 0 0 .658-.663 48.422 48.422 0 0 0-.37-5.36c-1.886.342-3.81.574-5.766.689a.578.578 0 0 1-.61-.58v0Z"
      />
    </svg>
  )
}

function BookIcon({ className }: { className: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25"
      />
    </svg>
  )
}

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()
  const { getBookmarks } = useKurals()
  const { t } = useLanguage()
  const [bookmarkCount, setBookmarkCount] = useState(() => getBookmarks().length)

  useEffect(() => {
    const handleChange = () => setBookmarkCount(getBookmarks().length)
    window.addEventListener('bookmarks-changed', handleChange)
    return () => window.removeEventListener('bookmarks-changed', handleChange)
  }, [getBookmarks])

  return (
    <nav className="sticky top-0 z-50 bg-cream/95 backdrop-blur-md">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 no-underline">
          <img src={thiruvalluvarImg} alt="Thiruvalluvar" className="w-9 h-9 object-contain" />
          <span className="font-tamil text-lg font-semibold text-dark hidden sm:inline">திருக்குறள்</span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          <Link to="/browse?category=Aram&focus=division" className="px-3 py-2 text-gray hover:text-gold-dark border-b-2 border-transparent hover:border-gold transition-all no-underline text-sm font-medium font-tamil">
            அறம்
          </Link>
          <Link to="/browse?category=Porul&focus=division" className="px-3 py-2 text-gray hover:text-gold-dark border-b-2 border-transparent hover:border-gold transition-all no-underline text-sm font-medium font-tamil">
            பொருள்
          </Link>
          <Link to="/browse?category=Inbam&focus=division" className="px-3 py-2 text-gray hover:text-gold-dark border-b-2 border-transparent hover:border-gold transition-all no-underline text-sm font-medium font-tamil">
            இன்பம்
          </Link>
          <div className="w-px h-5 bg-cream-dark mx-2" />
          <Link to="/history" className="px-3 py-2 text-gray hover:text-gold-dark border-b-2 border-transparent hover:border-gold transition-all no-underline text-sm font-medium">
            {t('historyShort')}
          </Link>
          <Link to="/explore" className="px-3 py-2 text-gray hover:text-gold-dark border-b-2 border-transparent hover:border-gold transition-all no-underline text-sm font-medium">
            {t('blog')}
          </Link>
          <div className="w-px h-5 bg-cream-dark mx-2" />
          <button
            onClick={() => navigate('/search')}
            className="p-2 rounded-full hover:bg-gold/10 transition-colors bg-transparent border-none cursor-pointer"
            aria-label={t('search')}
          >
            <svg className="w-5 h-5 text-gray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
          <Link to="/watchlist" className="relative p-2 rounded-full hover:bg-gold/10 transition-colors">
            <svg className="w-5 h-5 text-gray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
            {bookmarkCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-terracotta text-white text-[10px] rounded-full flex items-center justify-center font-medium">
                {bookmarkCount > 99 ? '99+' : bookmarkCount}
              </span>
            )}
          </Link>
          <Link to="/quiz" className="p-2 rounded-full hover:bg-gold/10 transition-colors" aria-label={t('quiz')}>
            <PuzzleIcon className="w-5 h-5 text-gray" />
          </Link>
          <Link to="/how-to-read" className="p-2 rounded-full hover:bg-gold/10 transition-colors" aria-label={t('howToRead')} title={t('howToRead')}>
            <BookIcon className="w-5 h-5 text-gray" />
          </Link>
          <div className="w-px h-5 bg-cream-dark mx-2" />
          <LanguageDropdown showLabel />
        </div>

        <div className="flex md:hidden items-center gap-1">
          <button
            onClick={() => navigate('/search')}
            className="p-2 rounded-full hover:bg-gold/10 transition-colors bg-transparent border-none cursor-pointer"
            aria-label={t('search')}
          >
            <svg className="w-5 h-5 text-gray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
          <Link to="/watchlist" className="relative p-2 rounded-full hover:bg-gold/10 transition-colors">
            <svg className="w-5 h-5 text-gray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
            {bookmarkCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-terracotta text-white text-[10px] rounded-full flex items-center justify-center font-medium">
                {bookmarkCount > 99 ? '99+' : bookmarkCount}
              </span>
            )}
          </Link>
          <Link to="/quiz" className="p-2 rounded-full hover:bg-gold/10 transition-colors" aria-label={t('quiz')}>
            <PuzzleIcon className="w-5 h-5 text-gray" />
          </Link>
          <Link to="/how-to-read" className="p-2 rounded-full hover:bg-gold/10 transition-colors" aria-label={t('howToRead')} title={t('howToRead')}>
            <BookIcon className="w-5 h-5 text-gray" />
          </Link>
          <LanguageDropdown />
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 rounded-full hover:bg-gold/10 transition-colors bg-transparent border-none cursor-pointer"
            aria-label="Menu"
          >
            <svg className="w-5 h-5 text-gray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Gold gradient bottom border */}
      <div className="h-[2px] bg-gradient-to-r from-transparent via-gold/40 to-transparent" />

      {menuOpen && (
        <div className="md:hidden bg-cream/98 backdrop-blur-md px-4 py-4 flex flex-col gap-3 animate-fade-in border-b border-gold/10">
          <Link to="/browse?category=Aram&focus=division" onClick={() => setMenuOpen(false)} className="text-gray hover:text-gold-dark transition-colors no-underline text-sm font-medium font-tamil py-1">
            அறத்துப்பால் — {t('virtue')}
          </Link>
          <Link to="/browse?category=Porul&focus=division" onClick={() => setMenuOpen(false)} className="text-gray hover:text-gold-dark transition-colors no-underline text-sm font-medium font-tamil py-1">
            பொருட்பால் — {t('wealth')}
          </Link>
          <Link to="/browse?category=Inbam&focus=division" onClick={() => setMenuOpen(false)} className="text-gray hover:text-gold-dark transition-colors no-underline text-sm font-medium font-tamil py-1">
            காமத்துப்பால் — {t('love')}
          </Link>
          <Link to="/history" onClick={() => setMenuOpen(false)} className="text-gray hover:text-gold-dark transition-colors no-underline text-sm font-medium py-1">
            {t('historyShort')}
          </Link>
          <Link to="/explore" onClick={() => setMenuOpen(false)} className="text-gray hover:text-gold-dark transition-colors no-underline text-sm font-medium py-1">
            {t('blog')}
          </Link>
          <Link to="/watchlist" onClick={() => setMenuOpen(false)} className="text-gray hover:text-gold-dark transition-colors no-underline text-sm font-medium py-1">
            {t('watchlist')} {bookmarkCount > 0 && `(${bookmarkCount})`}
          </Link>
        </div>
      )}
    </nav>
  )
}
