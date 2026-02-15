import { Link } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import { useKurals } from '../hooks/useKurals'
import { useLanguage } from '../contexts/LanguageContext'
import CategoryCard from '../components/CategoryCard'
import KuralText from '../components/KuralText'
import img1 from '../assets/thiruvalluvar.png'
import img4 from '../assets/thiruvalluvar4-clean.png'
import img5 from '../assets/thiruvalluvar5-clean.png'
import img6 from '../assets/thiruvalluvar6-clean.png'
import img7 from '../assets/thiruvalluvar7-clean.png'
import img8 from '../assets/thiruvalluvar8-clean.png'
import { shareKuralAsImage } from '../utils/shareCard'

const valluvarImages = [img1, img4, img5, img6, img7, img8]

function getImageForKural(kuralNumber: number) {
  return valluvarImages[kuralNumber % valluvarImages.length]
}

export default function Home() {
  const { getKuralOfTheDay, categories, getCategory, toggleBookmark, isBookmarked } = useKurals()
  const { t, lang, getMeaning, getChapterName } = useLanguage()
  const [dayOffset, setDayOffset] = useState(0)
  const [slideDir, setSlideDir] = useState<'left' | 'right' | null>(null)
  const [copied, setCopied] = useState(false)
  const kural = getKuralOfTheDay(dayOffset)
  const [bookmarked, setBookmarked] = useState(() => isBookmarked(kural.number))
  const prevOffset = useRef(dayOffset)
  const [currentImg, setCurrentImg] = useState(getImageForKural(kural.number))
  const [prevImg, setPrevImg] = useState<string | null>(null)
  const [imgFading, setImgFading] = useState(false)

  useEffect(() => {
    setBookmarked(isBookmarked(kural.number))
  }, [kural.number, isBookmarked])

  useEffect(() => {
    const handleChange = () => setBookmarked(isBookmarked(kural.number))
    window.addEventListener('bookmarks-changed', handleChange)
    return () => window.removeEventListener('bookmarks-changed', handleChange)
  }, [kural.number, isBookmarked])

  useEffect(() => {
    if (dayOffset > prevOffset.current) setSlideDir('right')
    else if (dayOffset < prevOffset.current) setSlideDir('left')
    prevOffset.current = dayOffset

    const newImg = getImageForKural(kural.number)
    if (newImg !== currentImg) {
      setPrevImg(currentImg)
      setCurrentImg(newImg)
      setImgFading(true)
      const rafId = requestAnimationFrame(() => {
        requestAnimationFrame(() => setImgFading(false))
      })
      const t2 = setTimeout(() => setPrevImg(null), 700)
      const t1 = setTimeout(() => setSlideDir(null), 400)
      return () => { clearTimeout(t1); clearTimeout(t2); cancelAnimationFrame(rafId) }
    }

    const timer = setTimeout(() => setSlideDir(null), 400)
    return () => clearTimeout(timer)
  }, [dayOffset, kural.number])

  const handleBookmark = () => {
    const newState = toggleBookmark(kural.number)
    setBookmarked(newState)
  }

  const meaningText = getMeaning(kural.number) || kural.englishMeaning

  const handleShare = async () => {
    await shareKuralAsImage({
      kuralNumber: kural.number,
      tamil: kural.tamil,
      meaning: meaningText,
      englishMeaning: kural.englishMeaning,
      tamilMeaning: kural.tamilMeaning,
      chapterName: getChapterName(kural.chapter) || kural.chapterEnglish,
      categoryName: displayCategoryName,
      categoryColor: catData?.color || '#C6A75E',
      lang,
    })
  }

  const handleCopyKural = async () => {
    await navigator.clipboard.writeText(kural.tamil)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const catData = getCategory(kural.category)
  const displayCategoryName = catData ? t(catData.englishName.toLowerCase()) : ''

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Hero: Kural of the Day */}
      <section className="mb-16 animate-fade-in">
        <div className="relative rounded-2xl shadow-2xl overflow-hidden group">
          <div className="absolute inset-0 hero-card-bg" />
          <div className="absolute inset-0 paper-texture" />
          <div className="absolute inset-0 opacity-[0.04]" style={{
            backgroundImage: `radial-gradient(circle, #8B4513 1px, transparent 1px)`,
            backgroundSize: '18px 18px'
          }} />
          <div className="absolute top-0 left-0 right-0 h-[4px] shimmer-border" />
          <div className="temple-border-top" />
          <div className="corner-ornament top-left" style={{ top: 14, left: 14 }} />
          <div className="corner-ornament top-right" style={{ top: 14, right: 14 }} />
          <div className="corner-ornament bottom-left" style={{ bottom: 14, left: 14 }} />
          <div className="corner-ornament bottom-right" style={{ bottom: 14, right: 14 }} />
          <div className="absolute left-0 top-1/4 bottom-1/4 w-[2px] bg-gradient-to-b from-transparent via-terracotta/20 to-transparent" />
          <div className="absolute right-0 top-1/4 bottom-1/4 w-[2px] bg-gradient-to-b from-transparent via-terracotta/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-gold-dark/20 via-gold/50 to-gold-dark/20" />

          <div className="relative z-10 px-6 pt-6 md:px-8 flex items-center justify-between">
            <div className="bg-[#8B1A1A]/90 px-4 py-1.5 rounded-lg flex items-center gap-2 shadow-sm">
              <span className="text-gold-light text-xs">&#10043;</span>
              <span className="font-tamil text-sm font-bold text-gold-light tracking-wide">{t('kuralOfTheDay')}</span>
              <span className="text-gold-light text-xs">&#10043;</span>
            </div>
            <div className="flex items-center gap-0.5 bg-[#8B1A1A]/5 rounded-xl px-1 py-0.5 border border-[#8B1A1A]/15">
              <button
                onClick={() => setDayOffset(d => d - 1)}
                className="p-2 rounded-lg hover:bg-[#8B1A1A]/10 active:scale-90 transition-all bg-transparent border-none cursor-pointer"
                aria-label="Previous day"
              >
                <svg className="w-4 h-4 text-[#8B1A1A]/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={() => setDayOffset(0)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[#3D1C00]/70 hover:bg-[#8B1A1A]/10 active:scale-95 transition-all bg-transparent border-none cursor-pointer font-tamil"
                title="Click to go to today"
              >
                {(() => {
                  const d = new Date()
                  d.setDate(d.getDate() + dayOffset)
                  return d.toLocaleDateString(lang, { day: 'numeric', month: 'short', year: 'numeric' })
                })()}
              </button>
              <button
                onClick={() => setDayOffset(d => d + 1)}
                className="p-2 rounded-lg hover:bg-[#8B1A1A]/10 active:scale-90 transition-all bg-transparent border-none cursor-pointer"
                aria-label="Next day"
              >
                <svg className="w-4 h-4 text-[#8B1A1A]/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          <div className="relative flex flex-col md:flex-row">
            <div className="hidden md:flex items-center justify-center w-72 lg:w-80 xl:w-96 shrink-0 px-6 py-4">
              <div className="relative w-[300px] h-[340px] -mt-6">
                {prevImg && (
                  <img
                    src={prevImg}
                    alt=""
                    className="absolute inset-0 w-full h-full object-contain drop-shadow-xl"
                    style={{ opacity: imgFading ? 1 : 0, transition: 'opacity 0.6s ease-out' }}
                  />
                )}
                <img
                  src={currentImg}
                  alt="Thiruvalluvar"
                  className="w-full h-full object-contain drop-shadow-xl transition-transform duration-700 group-hover:scale-[1.02]"
                  style={{ opacity: imgFading ? 0 : 1, transition: 'opacity 0.6s ease-in' }}
                />
                <div className="absolute inset-0 rounded-full bg-gold/0 group-hover:bg-gold/5 blur-3xl transition-all duration-700 -z-10" />
              </div>
            </div>

            <div className={`flex-1 min-w-0 p-6 md:p-8 lg:p-10 md:pt-4 ${
              slideDir === 'right' ? 'animate-slide-right' : slideDir === 'left' ? 'animate-slide-left' : ''
            }`} key={kural.number}>
              <div className="flex flex-wrap items-center gap-2.5 mb-5">
                <span className="font-tamil text-sm font-bold text-[#8B1A1A]">{t('kural')} {kural.number}</span>
                <span className="text-[#8B1A1A]/25">|</span>
                <Link
                  to={`/browse?chapter=${kural.chapter}&focus=division`}
                  className="no-underline group/chapter"
                  title={`${t('chapter')} ${kural.chapter}`}
                >
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-temple-brown/10 text-temple-brown border border-temple-brown/20 transition-all duration-300 group-hover/chapter:border-temple-brown/35 group-hover/chapter:bg-temple-brown/15">
                    <span className="font-tamil">{kural.chapterName}</span>
                    <span className="opacity-40">|</span>
                    <span>{getChapterName(kural.chapter) || kural.chapterEnglish}</span>
                  </span>
                </Link>
                <Link to={`/browse?category=${encodeURIComponent(kural.category)}&focus=division`} className="no-underline group/badge">
                  <span
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-white shadow-sm transition-all duration-300 group-hover/badge:shadow-md group-hover/badge:scale-105"
                    style={{ backgroundColor: catData?.color || '#C6A75E' }}
                  >
                    <span className="font-tamil">{catData?.tamilName}</span>
                    <span className="opacity-60">|</span>
                    <span>{displayCategoryName}</span>
                  </span>
                </Link>
              </div>

              <div className="mb-6">
                <div
                  className="cursor-pointer group/kural"
                  onClick={handleCopyKural}
                  title={t('copyKural')}
                >
                  <KuralText tamil={kural.tamil} baseSizePx={30} className="text-[#3D1C00] group-hover/kural:text-[#8B1A1A] transition-colors duration-300" />
                </div>
                {copied && (
                  <span className="copy-toast text-xs px-2.5 py-1 rounded-full bg-[#8B1A1A] text-gold-light font-medium mt-2 inline-block">
                    {t('copied')}
                  </span>
                )}
              </div>

              <div className="lotus-separator mb-5">
                <span className="text-[#8B1A1A]/30 text-xs">&#10048;</span>
              </div>

              {/* Tamil meaning — always shown */}
              <div className="mb-4">
                <p className="font-tamil text-xs font-bold text-[#8B1A1A]/70 mb-1.5 tracking-wider">{t('tamilMeaning')}</p>
                <p className="font-tamil text-sm text-[#3D1C00]/80 leading-relaxed">{kural.tamilMeaning}</p>
              </div>

              {/* Translated meaning */}
              <div className="mb-6">
                <p className="text-xs font-bold text-[#8B1A1A]/70 mb-1.5 tracking-wider uppercase">{t('meaning')}</p>
                <p className="text-sm text-[#3D1C00]/70 leading-relaxed font-medium">{meaningText}</p>
              </div>

              <div className="flex items-center gap-2.5 pt-2">
                <Link
                  to={`/kural/${kural.number}`}
                  className="group/btn px-5 py-2.5 rounded-xl bg-[#8B1A1A] text-gold-light text-sm font-medium hover:bg-[#7A1515] hover:shadow-lg active:scale-95 transition-all no-underline duration-300 flex items-center gap-2 shadow-sm"
                >
                  <span>{t('readMore')}</span>
                  <svg className="w-4 h-4 transition-transform group-hover/btn:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
                <button
                  onClick={handleBookmark}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer duration-300 active:scale-90 ${
                    bookmarked
                      ? 'border-[#8B1A1A] bg-[#8B1A1A]/10 text-[#8B1A1A] shadow-sm'
                      : 'border-[#8B1A1A]/20 text-[#8B1A1A]/40 hover:text-[#8B1A1A] hover:border-[#8B1A1A]/50 bg-white/50'
                  } ${bookmarked ? 'animate-pop' : ''}`}
                  aria-label={bookmarked ? t('removeFromWatchlist') : t('addToWatchlist')}
                >
                  <svg className="w-5 h-5" fill={bookmarked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                </button>
                <button
                  onClick={handleShare}
                  className="p-2.5 rounded-xl border border-[#8B1A1A]/20 text-[#8B1A1A]/40 hover:text-[#8B1A1A] hover:border-[#8B1A1A]/50 active:scale-90 transition-all cursor-pointer bg-white/50 duration-300"
                  aria-label={t('share')}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                </button>
                <button
                  onClick={handleCopyKural}
                  className="p-2.5 rounded-xl border border-[#8B1A1A]/20 text-[#8B1A1A]/40 hover:text-[#8B1A1A] hover:border-[#8B1A1A]/50 active:scale-90 transition-all cursor-pointer bg-white/50 duration-300"
                  aria-label={t('copyKural')}
                  title={t('copyKural')}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>

            </div>
          </div>

          <div className="md:hidden flex justify-center pb-4 relative">
            <img
              src={currentImg}
              alt="Thiruvalluvar"
              className="w-32 h-40 object-contain opacity-30"
            />
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="mb-16">
        <div className="text-center mb-8">
          <h2 className="font-tamil text-2xl md:text-3xl font-semibold text-dark ornamental-underline">
            {t('divisions')}
          </h2>
          <p className="text-sm text-gray mt-5">{t('theThreeDivisions')}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 stagger-children">
          {categories.map(cat => (
            <CategoryCard
              key={cat.name}
              name={cat.name}
              tamilName={cat.tamilName}
              englishName={cat.englishName}
              icon={cat.icon}
              chapterCount={cat.chapters.length}
              color={cat.color}
            />
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="py-12">
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16">
          <Link to="/browse" className="text-center group hover:scale-105 transition-transform no-underline">
            <p className="font-tamil text-4xl font-bold gold-gradient-text">1330</p>
            <p className="text-sm text-gray mt-1">{t('kurals')}</p>
          </Link>
          <div className="hidden md:block w-px h-12 bg-gold/30" />
          <Link to="/browse" className="text-center group hover:scale-105 transition-transform no-underline">
            <p className="font-tamil text-4xl font-bold gold-gradient-text">133</p>
            <p className="text-sm text-gray mt-1">{t('chapters')}</p>
          </Link>
          <div className="hidden md:block w-px h-12 bg-gold/30" />
          <Link to="/browse?focus=division" className="text-center group hover:scale-105 transition-transform no-underline">
            <p className="font-tamil text-4xl font-bold gold-gradient-text">3</p>
            <p className="text-sm text-gray mt-1">{t('divisions')}</p>
          </Link>
        </div>
      </section>

      {/* Why Thirukkural Matters Today */}
      <section className="mb-12 animate-fade-in">
        <div className="relative rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(135deg, #FDF8EE 0%, #F5EDD6 100%)' }}>
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: 'radial-gradient(circle, #8B4513 1px, transparent 1px)',
            backgroundSize: '20px 20px'
          }} />
          <div className="relative p-8 md:p-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-gold/15 border border-gold/25 flex items-center justify-center text-lg">
                🪔
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-dark">
                {t('whyThirukkuralMatters')}
              </h2>
            </div>
            <div className="space-y-3 ml-13">
              <p className="text-sm md:text-base text-gray leading-relaxed">
                {t('whyThirukkuralMattersP1')}
              </p>
              <p className="text-sm md:text-base text-gray leading-relaxed">
                {t('whyThirukkuralMattersP2')}
              </p>
            </div>
            <div className="mt-6 ml-13">
              <Link
                to="/history"
                className="text-gold-dark hover:text-gold text-sm font-medium transition-colors no-underline"
              >
                {t('readMoreEllipsis')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Did You Know? */}
      <section className="mb-12 animate-fade-in">
        <div className="relative rounded-2xl border border-gold/20 overflow-hidden bg-white">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-gold/0 via-gold to-gold/0 opacity-40" />
          <div className="p-8 md:p-10">
            <div className="flex items-center gap-3 mb-5">
              <span className="text-2xl">💡</span>
              <h2 className="text-xl md:text-2xl font-bold text-dark">
                {t('didYouKnow')}
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {[
                { icon: '🌍', text: t('fact1') },
                { icon: '📏', text: t('fact2') },
                { icon: '🏛️', text: t('fact3') },
                { icon: '📅', text: t('fact4') }
              ].map((fact, i) => (
                <div key={i} className="flex gap-3 p-4 rounded-xl bg-cream/50 border border-gold/10">
                  <span className="text-xl shrink-0 mt-0.5">{fact.icon}</span>
                  <p className="text-sm text-gray leading-relaxed">
                    {fact.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
