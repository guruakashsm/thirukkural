import { useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useKurals } from '../hooks/useKurals'
import { useLanguage, type Language } from '../contexts/LanguageContext'
import { getTamilUraiText, type UraiSourceKey } from '../utils/urai'

export type WidgetTheme = 'light' | 'dark' | 'saffron' | 'ocean' | 'forest' | 'minimal' | 'rose'
export type WidgetBorder = 'classic' | 'ornate' | 'none'
export type WidgetFontSize = 'sm' | 'md' | 'lg'
export type WidgetAlign = 'left' | 'center'
export type WidgetBgPattern = 'none' | 'dots' | 'lines'
export type WidgetLayout = 'spotlight' | 'banner' | 'ticker' | 'square' | 'compact' | 'minimal'

export interface WidgetThemeConfig {
  bg: string; text: string; subtext: string; accent: string
  border: string; chip: string; chipText: string; divider: string
  footerBg: string; footerText: string; link: string; patternColor: string
}

export const WIDGET_THEMES: Record<WidgetTheme, WidgetThemeConfig> = {
  light: { bg: '#FDFBF7', text: '#1F2937', subtext: '#6B7280', accent: '#C6A75E', border: '#E8D9B5', chip: 'rgba(198,167,94,0.13)', chipText: '#8B6914', divider: 'rgba(198,167,94,0.45)', footerBg: '#F5F0E6', footerText: '#A09070', link: '#A88B3E', patternColor: 'rgba(198,167,94,0.06)' },
  dark: { bg: '#2D1E14', text: '#F5ECD7', subtext: '#C5A97B', accent: '#D4BA7A', border: 'rgba(92,61,46,0.9)', chip: 'rgba(212,186,122,0.16)', chipText: '#D4BA7A', divider: 'rgba(140,100,60,0.55)', footerBg: '#1A0E08', footerText: '#7A6040', link: '#D4BA7A', patternColor: 'rgba(212,186,122,0.04)' },
  saffron: { bg: '#FFF8F0', text: '#3D1800', subtext: '#8B5A2B', accent: '#E07800', border: 'rgba(245,192,106,0.65)', chip: 'rgba(224,120,0,0.11)', chipText: '#C06000', divider: 'rgba(224,144,64,0.55)', footerBg: '#FFF0D8', footerText: '#B87033', link: '#C06000', patternColor: 'rgba(224,120,0,0.05)' },
  ocean: { bg: '#0C1A28', text: '#E8F4FD', subtext: '#88BBD8', accent: '#5BA3D9', border: 'rgba(26,58,88,0.9)', chip: 'rgba(91,163,217,0.16)', chipText: '#7BBCE8', divider: 'rgba(37,78,112,0.65)', footerBg: '#081220', footerText: '#406080', link: '#7BBCE8', patternColor: 'rgba(91,163,217,0.04)' },
  forest: { bg: '#0C1C0E', text: '#E8F5E9', subtext: '#7CBB7E', accent: '#5CAF60', border: 'rgba(26,62,30,0.9)', chip: 'rgba(92,175,96,0.16)', chipText: '#7CBB7E', divider: 'rgba(46,96,50,0.65)', footerBg: '#081208', footerText: '#3A5C3C', link: '#7CBB7E', patternColor: 'rgba(92,175,96,0.04)' },
  minimal: { bg: '#FFFFFF', text: '#111827', subtext: '#6B7280', accent: '#374151', border: 'rgba(229,231,235,1)', chip: 'rgba(17,24,39,0.08)', chipText: '#374151', divider: 'rgba(209,213,219,0.9)', footerBg: '#F9FAFB', footerText: '#9CA3AF', link: '#374151', patternColor: 'rgba(17,24,39,0.025)' },
  rose: { bg: '#2A0E1E', text: '#FFE0EC', subtext: '#D4A0B5', accent: '#E87090', border: 'rgba(92,30,56,0.9)', chip: 'rgba(232,112,144,0.16)', chipText: '#E87090', divider: 'rgba(120,42,80,0.65)', footerBg: '#1A0814', footerText: '#8A3055', link: '#E87090', patternColor: 'rgba(232,112,144,0.04)' },
}

const FS = { sm: { tamil: 14, meaning: 11, meta: 9 }, md: { tamil: 17, meaning: 12, meta: 9.5 }, lg: { tamil: 21, meaning: 14, meta: 10.5 } }
const RADIUS = { none: 0, sm: 6, md: 12, lg: 20 }
const SHADOW = { none: 'none', sm: '0 2px 8px rgba(0,0,0,0.08)', md: '0 4px 24px rgba(0,0,0,0.12)', lg: '0 8px 40px rgba(0,0,0,0.22)' }

export function resolveTheme(themeKey: WidgetTheme, accentHex?: string): WidgetThemeConfig {
  const base = WIDGET_THEMES[themeKey] ?? WIDGET_THEMES.light
  if (!accentHex) return base
  const r = parseInt(accentHex.slice(0, 2), 16)
  const g = parseInt(accentHex.slice(2, 4), 16)
  const b = parseInt(accentHex.slice(4, 6), 16)
  if (isNaN(r) || isNaN(g) || isNaN(b)) return base
  const ac = `#${accentHex}`
  return { ...base, accent: ac, chip: `rgba(${r},${g},${b},0.13)`, chipText: ac, divider: `rgba(${r},${g},${b},0.4)`, link: ac, patternColor: `rgba(${r},${g},${b},0.05)` }
}

function getBgPattern(pattern: WidgetBgPattern, color: string) {
  if (pattern === 'dots') return { backgroundImage: `radial-gradient(circle, ${color} 1.5px, transparent 1.5px)`, backgroundSize: '20px 20px' }
  if (pattern === 'lines') return { backgroundImage: `repeating-linear-gradient(45deg, ${color} 0, ${color} 1px, transparent 0, transparent 50%)`, backgroundSize: '8px 8px' }
  return {}
}

export interface WidgetRenderProps {
  kuralNumber: number; tamil: string; tamilMeaning: string
  englishMeaning: string; chapterEnglish: string; category: string; meaning: string
  layout: WidgetLayout; theme: WidgetThemeConfig
  border: WidgetBorder; fontSize: WidgetFontSize; align: WidgetAlign
  radius: string; bgPattern: WidgetBgPattern; shadow: string
  showMeaning: boolean; showTamilMeaning: boolean; showChapter: boolean
  showNumber: boolean; showReadMore: boolean; uraiLabel: boolean
  tickerSpeed?: string; tickerDir?: string; pauseOnHover?: boolean
  kuralUrl?: string; onRefresh?: () => void; showRefresh?: boolean
  footerLabel?: string
}

// ── Spotlight / Square / Compact / Minimal (card layouts) ─────────────────────
function CardLayout(p: WidgetRenderProps) {
  const { theme, layout } = p
  const fs = FS[p.fontSize]
  const isCenter = p.align === 'center' || layout === 'square'
  const isCompact = layout === 'compact'
  const isMinimal = layout === 'minimal'
  const isOrnate = p.border === 'ornate'
  const radiusPx = RADIUS[p.radius as keyof typeof RADIUS] ?? 12
  const hasMeaning = (p.showMeaning || p.showTamilMeaning) && !isMinimal

  const cornerPos: { v: 'top' | 'bottom'; h: 'left' | 'right' }[] = [
    { v: 'top', h: 'left' }, { v: 'top', h: 'right' },
    { v: 'bottom', h: 'left' }, { v: 'bottom', h: 'right' },
  ]

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: theme.bg,
        fontFamily: "'Inter','Helvetica Neue',sans-serif",
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
        borderRadius: radiusPx,
        boxShadow: SHADOW[p.shadow as keyof typeof SHADOW] || 'none',
        ...getBgPattern(p.bgPattern, theme.patternColor),
        ['--w-accent' as never]: theme.accent,
        ['--w-bg' as never]: theme.bg,
        ['--w-link' as never]: theme.link,
      }}
    >
      {/* Ornate corners */}
      {isOrnate && cornerPos.map(({ v, h }) => (
        <div key={`${v}-${h}`} style={{ position: 'absolute', [v]: 5, [h]: 5, width: 14, height: 14, borderColor: theme.accent, borderStyle: 'solid', borderTopWidth: v === 'top' ? 1.5 : 0, borderBottomWidth: v === 'bottom' ? 1.5 : 0, borderLeftWidth: h === 'left' ? 1.5 : 0, borderRightWidth: h === 'right' ? 1.5 : 0, borderRadius: v === 'top' && h === 'left' ? '3px 0 0 0' : v === 'top' && h === 'right' ? '0 3px 0 0' : v === 'bottom' && h === 'left' ? '0 0 0 3px' : '0 0 3px 0', zIndex: 1 }} />
      ))}
      {/* Top accent line */}
      {p.border !== 'none' && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${theme.accent}, transparent)`, opacity: 0.7 }} />}

      {/* Content */}
      <div style={{ flex: 1, padding: isCompact ? '10px 14px 8px' : isOrnate ? '18px 20px 10px' : '14px 16px 10px', display: 'flex', flexDirection: 'column', gap: isCompact ? 6 : 8, overflow: 'hidden', textAlign: isCenter ? 'center' : 'left' }}>

        {/* Header row */}
        {!isMinimal && (p.showNumber || p.showChapter) && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', justifyContent: isCenter ? 'center' : 'flex-start', flexShrink: 0 }}>
            {p.showNumber && (
              <div style={{ width: isCompact ? 20 : 24, height: isCompact ? 20 : 24, border: `1.5px solid ${theme.accent}`, transform: 'rotate(45deg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ transform: 'rotate(-45deg)', fontSize: 8, fontWeight: 700, color: theme.accent, lineHeight: 1 }}>{p.kuralNumber}</span>
              </div>
            )}
            {p.showChapter && !isCompact && (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <span style={{ padding: '3px 8px', borderRadius: 999, background: theme.chip, color: theme.chipText, fontSize: fs.meta, fontWeight: 600 }}>{p.category}</span>
                <span style={{ padding: '3px 8px', borderRadius: 999, background: theme.chip, color: theme.chipText, fontSize: fs.meta }}>{p.chapterEnglish}</span>
              </div>
            )}
            {p.showChapter && isCompact && (
              <span style={{ fontSize: fs.meta, color: theme.chipText, fontWeight: 500 }}>{p.category} · {p.chapterEnglish}</span>
            )}
          </div>
        )}

        {/* Tamil text */}
        <p style={{ fontFamily: "'Noto Serif Tamil',serif", fontSize: isMinimal ? fs.tamil + 3 : fs.tamil, lineHeight: 1.9, color: theme.text, fontWeight: 600, margin: 0, whiteSpace: 'pre-line', flexShrink: 0, overflow: isCompact ? 'hidden' : undefined, display: isCompact ? '-webkit-box' : undefined, WebkitLineClamp: isCompact ? 2 : undefined, WebkitBoxOrient: isCompact ? 'vertical' : undefined }}>
          {p.tamil}
        </p>

        {/* Divider */}
        {hasMeaning && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, justifyContent: isCenter ? 'center' : 'flex-start' }}>
            {isCenter || <div style={{ flex: 1, height: 1, background: theme.divider }} />}
            <span style={{ color: theme.accent, fontSize: 8 }}>✦</span>
            <div style={{ flex: 1, height: 1, background: theme.divider }} />
          </div>
        )}

        {/* Tamil meaning */}
        {p.showTamilMeaning && p.tamilMeaning && !isMinimal && (
          <div style={{ flexShrink: 0 }}>
            {p.uraiLabel && <p style={{ fontSize: fs.meta, color: theme.accent, fontWeight: 600, margin: '0 0 3px', fontFamily: "'Noto Serif Tamil',serif" }}>விளக்கம்:</p>}
            <p style={{ fontFamily: "'Noto Serif Tamil',serif", fontSize: fs.meta + 1.5, lineHeight: 1.75, color: theme.subtext, margin: 0, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>{p.tamilMeaning}</p>
          </div>
        )}

        {/* Meaning */}
        {p.showMeaning && p.meaning && !isMinimal && (
          <p style={{ fontSize: fs.meaning, lineHeight: 1.68, color: theme.subtext, margin: 0, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: isCompact ? 2 : 3, WebkitBoxOrient: 'vertical' }}>{p.meaning}</p>
        )}

        {/* Read more */}
        {p.showReadMore && p.kuralUrl && !isMinimal && (
          <a
            href={p.kuralUrl}
            target="_blank"
            rel="noreferrer"
            className="widget-action widget-action--primary"
            style={{ fontSize: fs.meta, alignSelf: isCenter ? 'center' : 'flex-start', flexShrink: 0 }}
          >
            Read More <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6m0 0v6m0-6L10 14" /></svg>
          </a>
        )}
      </div>

      {/* Footer */}
      <div style={{ borderTop: `1px solid ${theme.border}`, background: theme.footerBg, padding: isCompact ? '5px 14px' : '6px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <span style={{ fontFamily: "'Noto Serif Tamil',serif", fontSize: 10, color: theme.footerText }}>{p.footerLabel || 'திருக்குறள்'}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {p.showRefresh && p.onRefresh && (
            <button type="button" onClick={p.onRefresh} className="widget-action widget-action--subtle" style={{ fontSize: 10 }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h5M20 20v-5h-5M4 9a9 9 0 0115-4.2M20 15A9 9 0 015 19.2" /></svg>
              Next
            </button>
          )}
          {p.kuralUrl && !p.showReadMore && (
            <a href={p.kuralUrl} target="_blank" rel="noreferrer" className="widget-action widget-action--subtle" style={{ fontSize: 9.5 }}>
              View ↗
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Banner layout ──────────────────────────────────────────────────────────────
function BannerLayout(p: WidgetRenderProps) {
  const { theme } = p
  const radiusPx = RADIUS[p.radius as keyof typeof RADIUS] ?? 12
  const firstLine = p.tamil.split('\n')[0] || p.tamil
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: theme.bg,
        fontFamily: "'Inter','Helvetica Neue',sans-serif",
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '0 16px',
        position: 'relative',
        overflow: 'hidden',
        borderRadius: radiusPx,
        boxShadow: SHADOW[p.shadow as keyof typeof SHADOW] || 'none',
        ...getBgPattern(p.bgPattern, theme.patternColor),
        ['--w-accent' as never]: theme.accent,
        ['--w-bg' as never]: theme.bg,
        ['--w-link' as never]: theme.link,
      }}
    >
      {p.border !== 'none' && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${theme.accent}, transparent)`, opacity: 0.6 }} />}
      {p.showNumber && (
        <div style={{ width: 28, height: 28, border: `1.5px solid ${theme.accent}`, transform: 'rotate(45deg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <span style={{ transform: 'rotate(-45deg)', fontSize: 8, fontWeight: 700, color: theme.accent }}>{p.kuralNumber}</span>
        </div>
      )}
      {p.showChapter && (
        <span style={{ padding: '3px 9px', borderRadius: 999, background: theme.chip, color: theme.chipText, fontSize: 9.5, fontWeight: 600, flexShrink: 0, whiteSpace: 'nowrap' }}>{p.category}</span>
      )}
      <p style={{ fontFamily: "'Noto Serif Tamil',serif", fontSize: FS[p.fontSize].tamil - 2, color: theme.text, fontWeight: 600, margin: 0, flexShrink: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '35%' }}>{firstLine}</p>
      {p.showMeaning && p.meaning && (
        <>
          <div style={{ width: 1, height: 24, background: theme.divider, flexShrink: 0 }} />
          <p style={{ fontSize: FS[p.fontSize].meaning, color: theme.subtext, margin: 0, flex: 1, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{p.meaning}</p>
        </>
      )}
      {p.kuralUrl && (
        <a href={p.kuralUrl} target="_blank" rel="noreferrer" className="widget-action widget-action--subtle" style={{ fontSize: 10, flexShrink: 0, whiteSpace: 'nowrap' }}>
          View ↗
        </a>
      )}
    </div>
  )
}

// ── Ticker layout ──────────────────────────────────────────────────────────────
function TickerLayout(p: WidgetRenderProps) {
  const { theme } = p
  const radiusPx = RADIUS[p.radius as keyof typeof RADIUS] ?? 0
  const dur = p.tickerSpeed === 'slow' ? '35s' : p.tickerSpeed === 'fast' ? '15s' : '24s'
  const dir = p.tickerDir === 'rtl' ? 'reverse' : 'normal'
  const text = `  ◇ குறள் ${p.kuralNumber}: ${p.tamil.replace('\n', ' ')}${p.showMeaning && p.meaning ? ` — ${p.meaning}` : ''}  `
  const pauseStyle = p.pauseOnHover ? { animationPlayState: 'running' } : {}
  const id = `ticker-${p.kuralNumber}`
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: theme.bg,
        fontFamily: "'Inter','Helvetica Neue',sans-serif",
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
        borderRadius: radiusPx,
        boxShadow: SHADOW[p.shadow as keyof typeof SHADOW] || 'none',
        ['--w-accent' as never]: theme.accent,
        ['--w-bg' as never]: theme.bg,
        ['--w-link' as never]: theme.link,
      }}
    >
      <style>{`@keyframes ${id}{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}${p.pauseOnHover ? `#${id}-inner:hover{animation-play-state:paused}` : ''}`}</style>
      {p.border !== 'none' && (
        <>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${theme.accent}, transparent)`, opacity: 0.6 }} />
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 1, background: theme.border }} />
        </>
      )}
      {/* left fade */}
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 40, background: `linear-gradient(90deg, ${theme.bg}, transparent)`, zIndex: 2 }} />
      {/* right fade */}
      <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 40, background: `linear-gradient(270deg, ${theme.bg}, transparent)`, zIndex: 2 }} />
      <div id={`${id}-inner`} style={{ display: 'inline-flex', whiteSpace: 'nowrap', animation: `${id} ${dur} linear infinite ${dir}`, ...pauseStyle }}>
        {[text, text].map((t, i) => (
          <span key={i} style={{ fontFamily: "'Noto Serif Tamil',serif", fontSize: FS[p.fontSize].tamil - 4, color: theme.text, fontWeight: 500, padding: '0 20px' }}>
            {t}
            <span style={{ color: theme.accent, margin: '0 8px' }}>✦</span>
          </span>
        ))}
      </div>
    </div>
  )
}

// ── Main WidgetRender dispatcher ───────────────────────────────────────────────
export function WidgetRender(props: WidgetRenderProps) {
  if (props.layout === 'ticker') return <TickerLayout {...props} />
  if (props.layout === 'banner') return <BannerLayout {...props} />
  return <CardLayout {...props} />
}

// ── Widget page (iframe entry point) ──────────────────────────────────────────
export default function Widget() {
  const [params] = useSearchParams()
  const { getKural, getKuralOfTheDay, getRandomKural } = useKurals()
  const { setLang, getMeaning } = useLanguage()

  const mode = params.get('mode') || params.get('type') || 'daily'
  const kuralNum = parseInt(params.get('n') || '0', 10)
  const themeKey = (params.get('theme') || 'light') as WidgetTheme
  const accentHex = params.get('accent') || ''
  const langParam = (params.get('lang') || 'en') as Language
  const layout = (params.get('layout') || 'spotlight') as WidgetLayout
  const showMeaning = params.get('meaning') !== '0'
  const showTamilMeaning = params.get('tmeaning') === '1'
  const showChapter = params.get('chapter') !== '0'
  const border = (params.get('border') || 'classic') as WidgetBorder
  const fontSize = (params.get('fs') || 'md') as WidgetFontSize
  const align = (params.get('al') || 'left') as WidgetAlign
  const radius = params.get('r') || 'md'
  const bgPattern = (params.get('bp') || 'none') as WidgetBgPattern
  const shadow = params.get('shadow') || 'none'
  const showNumber = params.get('num') !== '0'
  const showReadMore = true
  const showRefresh = params.get('refresh') === '1'
  const uraiLabel = params.get('urai') === '1'
  const uraiBy = (params.get('ub') || 'parimel') as UraiSourceKey
  const tickerSpeed = params.get('speed') || 'normal'
  const tickerDir = params.get('dir') || 'ltr'
  const pauseOnHover = params.get('pausehover') === '1'

  const resolvedTheme = resolveTheme(themeKey, accentHex)

  useEffect(() => { setLang(langParam) }, [langParam, setLang])

  const [randomKural, setRandomKural] = useState(() => mode === 'random' ? getRandomKural() : null)
  const handleRefresh = useCallback(() => setRandomKural(getRandomKural()), [getRandomKural])

  const kural = mode === 'random' ? randomKural
    : mode === 'daily' ? getKuralOfTheDay(0)
    : getKural(kuralNum || 1)

  const [tamilMeaningOverride, setTamilMeaningOverride] = useState<string | null>(null)

  useEffect(() => {
    let alive = true
    if (!kural) return
    if (!showTamilMeaning || langParam !== 'ta') {
      setTamilMeaningOverride(null)
      return
    }
    if (uraiBy === 'default') {
      setTamilMeaningOverride(null)
      return
    }

    getTamilUraiText({ kuralNumber: kural.number, source: uraiBy, fallback: kural.tamilMeaning }).then((text) => {
      if (!alive) return
      setTamilMeaningOverride(text)
    })

    return () => { alive = false }
  }, [kural, showTamilMeaning, langParam, uraiBy])

  if (!kural) {
    return (
      <div style={{ width: '100%', minHeight: '100vh', background: resolvedTheme.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: resolvedTheme.subtext, fontFamily: 'Inter,sans-serif', fontSize: 13 }}>Loading…</p>
      </div>
    )
  }

  const meaning = getMeaning(kural.number) || kural.englishMeaning
  const kuralUrl = `${window.location.origin}${import.meta.env.BASE_URL}#/kural/${kural.number}`
  const footerLabel = langParam === 'ta' ? 'திருக்குறள்' : 'Thirukkural'

  return (
    <div style={{ width: '100%', minHeight: '100vh' }}>
      <WidgetRender
        kuralNumber={kural.number} tamil={kural.tamil} tamilMeaning={tamilMeaningOverride ?? kural.tamilMeaning}
        englishMeaning={kural.englishMeaning} chapterEnglish={kural.chapterEnglish}
        category={kural.category} meaning={meaning} layout={layout} theme={resolvedTheme}
        border={border} fontSize={fontSize} align={align} radius={radius}
        bgPattern={bgPattern} shadow={shadow} showMeaning={showMeaning}
        showTamilMeaning={showTamilMeaning} showChapter={showChapter}
        showNumber={showNumber} showReadMore={showReadMore} showRefresh={showRefresh}
        uraiLabel={uraiLabel} tickerSpeed={tickerSpeed} tickerDir={tickerDir}
        pauseOnHover={pauseOnHover} kuralUrl={kuralUrl}
        onRefresh={mode === 'random' ? handleRefresh : undefined}
        footerLabel={footerLabel}
      />
    </div>
  )
}
