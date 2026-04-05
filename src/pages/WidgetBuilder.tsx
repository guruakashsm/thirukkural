import { useState, useEffect, useRef, useMemo, useCallback, type ReactNode } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useKurals } from '../hooks/useKurals'
import { LANGUAGES, type Language } from '../contexts/LanguageContext'
import {
  WidgetRender, WIDGET_THEMES, resolveTheme as resolveWidgetTheme,
  type WidgetTheme, type WidgetBorder, type WidgetFontSize,
  type WidgetAlign, type WidgetBgPattern, type WidgetLayout,
} from './Widget'
import { URAI_SOURCES, type UraiSourceKey, getTamilUraiText } from '../utils/urai'

// ─── Types ──────────────────────────────────────────────────────────────────

type ContentMode = 'translation' | 'couplet' | 'explanation'
type ShadowLevel = 'none' | 'sm' | 'md' | 'lg'

interface WidgetConfig {
  mode: 'daily' | 'random' | 'kural'
  kuralNumber: number
  layout: WidgetLayout
  contentMode: ContentMode
  lang: Language
  showChapter: boolean
  showNumber: boolean
  showReadMore: boolean
  showRefresh: boolean
  uraiLabel: boolean
  theme: WidgetTheme
  accentColor: string
  shadow: ShadowLevel
  border: WidgetBorder
  bgPattern: WidgetBgPattern
  fontSize: WidgetFontSize
  align: WidgetAlign
  radius: string
  tickerSpeed: 'slow' | 'normal' | 'fast'
  tickerDir: 'ltr' | 'rtl'
  pauseOnHover: boolean
  width: number
  height: number
  uraiSource: UraiSourceKey
}

const DEFAULT: WidgetConfig = {
  mode: 'daily', kuralNumber: 1, layout: 'spotlight', contentMode: 'translation',
  lang: 'en', showChapter: true, showNumber: true, showReadMore: true,
  showRefresh: false, uraiLabel: false, theme: 'light', accentColor: '',
  shadow: 'none', border: 'classic', bgPattern: 'none', fontSize: 'md',
  align: 'left', radius: 'md', tickerSpeed: 'normal', tickerDir: 'ltr',
  pauseOnHover: true, width: 420, height: 280, uraiSource: 'parimel',
}

// ─── Presets ─────────────────────────────────────────────────────────────────

const PRESETS: { name: string; swatches: string[]; cfg: Partial<WidgetConfig> }[] = [
  { name: 'Daily Inspiration', swatches: ['#FDFBF7', '#C6A75E'], cfg: { mode: 'daily', layout: 'spotlight', theme: 'light', lang: 'en', contentMode: 'translation', showChapter: true, showNumber: true, border: 'classic', radius: 'md', fontSize: 'md', align: 'left', shadow: 'none', width: 420, height: 280 } },
  { name: 'Tamil Scholar', swatches: ['#FDFBF7', '#8B6914'], cfg: { mode: 'daily', layout: 'spotlight', theme: 'light', lang: 'ta', contentMode: 'explanation', showChapter: true, showNumber: true, uraiLabel: true, border: 'ornate', showReadMore: true, radius: 'md', fontSize: 'md', align: 'left', shadow: 'sm', width: 440, height: 360 } },
  { name: 'Night Mode', swatches: ['#2D1E14', '#D4BA7A'], cfg: { mode: 'daily', layout: 'spotlight', theme: 'dark', lang: 'en', contentMode: 'translation', showChapter: true, showNumber: true, border: 'classic', radius: 'md', fontSize: 'md', align: 'left', shadow: 'none', width: 420, height: 280 } },
  { name: 'Saffron Glow', swatches: ['#FFF8F0', '#E07800'], cfg: { mode: 'daily', layout: 'spotlight', theme: 'saffron', lang: 'en', contentMode: 'translation', showChapter: true, showNumber: true, border: 'ornate', showReadMore: true, radius: 'lg', fontSize: 'md', align: 'center', shadow: 'sm', width: 420, height: 300 } },
  { name: 'Minimalist', swatches: ['#FFFFFF', '#374151'], cfg: { mode: 'daily', layout: 'spotlight', theme: 'minimal', lang: 'en', contentMode: 'translation', showChapter: false, showNumber: false, border: 'none', radius: 'sm', fontSize: 'sm', align: 'left', shadow: 'none', width: 360, height: 220 } },
  { name: 'Ocean Calm', swatches: ['#0C1A28', '#5BA3D9'], cfg: { mode: 'daily', layout: 'spotlight', theme: 'ocean', lang: 'en', contentMode: 'translation', showChapter: true, showNumber: true, border: 'classic', radius: 'md', fontSize: 'md', align: 'left', bgPattern: 'dots', shadow: 'none', width: 420, height: 280 } },
  { name: 'Banner Strip', swatches: ['#FDFBF7', '#C6A75E'], cfg: { mode: 'daily', layout: 'banner', theme: 'light', lang: 'en', contentMode: 'translation', showChapter: true, showNumber: true, border: 'classic', radius: 'sm', fontSize: 'md', align: 'left', shadow: 'sm', width: 600, height: 68 } },
  { name: 'Ticker', swatches: ['#2D1E14', '#D4BA7A'], cfg: { mode: 'random', layout: 'ticker', theme: 'dark', lang: 'en', contentMode: 'translation', border: 'none', radius: 'none', fontSize: 'md', tickerSpeed: 'normal', pauseOnHover: true, shadow: 'none', width: 600, height: 48 } },
  { name: 'Couplet Only', swatches: ['#FDFBF7', '#C6A75E'], cfg: { mode: 'daily', layout: 'spotlight', theme: 'light', lang: 'en', contentMode: 'couplet', showChapter: false, showNumber: true, border: 'ornate', radius: 'md', fontSize: 'lg', align: 'center', shadow: 'none', width: 380, height: 200 } },
  { name: 'Rose Mystic', swatches: ['#2A0E1E', '#E87090'], cfg: { mode: 'daily', layout: 'spotlight', theme: 'rose', lang: 'en', contentMode: 'translation', showChapter: true, showNumber: true, border: 'ornate', radius: 'lg', fontSize: 'md', align: 'center', bgPattern: 'lines', shadow: 'md', width: 420, height: 300 } },
]

const THEMES: { key: WidgetTheme; label: string }[] = [
  { key: 'light', label: 'Classic' }, { key: 'dark', label: 'Night' },
  { key: 'saffron', label: 'Saffron' }, { key: 'ocean', label: 'Ocean' },
  { key: 'forest', label: 'Forest' }, { key: 'minimal', label: 'Pure' },
  { key: 'rose', label: 'Rose' },
]

const LAYOUTS: { key: WidgetLayout; label: string; icon: ReactNode }[] = [
  { key: 'spotlight', label: 'Spotlight', icon: <svg viewBox="0 0 36 50" fill="none" className="w-full h-full"><rect x="1" y="1" width="34" height="48" rx="3" stroke="currentColor" strokeWidth="1.5"/><rect x="5" y="7" width="9" height="9" rx="1" stroke="currentColor" strokeWidth="1.2" transform="rotate(45 9.5 11.5)" /><line x1="5" y1="23" x2="31" y2="23" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><line x1="5" y1="29" x2="31" y2="29" stroke="currentColor" strokeWidth="0.9" strokeLinecap="round" strokeOpacity=".5"/><line x1="5" y1="35" x2="24" y2="35" stroke="currentColor" strokeWidth="0.9" strokeLinecap="round" strokeOpacity=".4"/><line x1="5" y1="44" x2="14" y2="44" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" strokeOpacity=".35"/><line x1="22" y1="44" x2="31" y2="44" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" strokeOpacity=".35"/></svg> },
  { key: 'banner', label: 'Banner', icon: <svg viewBox="0 0 54 22" fill="none" className="w-full h-full"><rect x="1" y="1" width="52" height="20" rx="3" stroke="currentColor" strokeWidth="1.5"/><circle cx="11" cy="11" r="5" stroke="currentColor" strokeWidth="1.2"/><line x1="20" y1="8" x2="38" y2="8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/><line x1="20" y1="12" x2="46" y2="12" stroke="currentColor" strokeWidth="0.9" strokeLinecap="round" strokeOpacity=".5"/><line x1="44" y1="9.5" x2="52" y2="11" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeOpacity=".6"/></svg> },
  { key: 'ticker', label: 'Ticker', icon: <svg viewBox="0 0 54 16" fill="none" className="w-full h-full"><rect x="1" y="1" width="52" height="14" rx="3" stroke="currentColor" strokeWidth="1.5"/><line x1="5" y1="8" x2="44" y2="8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/><path d="M44 5.5l5 2.5-5 2.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg> },
  { key: 'square', label: 'Square', icon: <svg viewBox="0 0 40 40" fill="none" className="w-full h-full"><rect x="1" y="1" width="38" height="38" rx="3" stroke="currentColor" strokeWidth="1.5"/><line x1="10" y1="15" x2="30" y2="15" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/><line x1="12" y1="20" x2="28" y2="20" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeOpacity=".7"/><line x1="10" y1="25" x2="30" y2="25" stroke="currentColor" strokeWidth="0.9" strokeLinecap="round" strokeOpacity=".4"/><line x1="10" y1="34" x2="18" y2="34" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" strokeOpacity=".3"/></svg> },
  { key: 'compact', label: 'Compact', icon: <svg viewBox="0 0 38 30" fill="none" className="w-full h-full"><rect x="1" y="1" width="36" height="28" rx="3" stroke="currentColor" strokeWidth="1.5"/><circle cx="7" cy="9" r="4" stroke="currentColor" strokeWidth="1"/><line x1="14" y1="7" x2="32" y2="7" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/><line x1="14" y1="11" x2="28" y2="11" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" strokeOpacity=".5"/><line x1="5" y1="18" x2="33" y2="18" stroke="currentColor" strokeWidth="0.9" strokeLinecap="round" strokeOpacity=".5"/><line x1="5" y1="25" x2="14" y2="25" stroke="currentColor" strokeWidth="0.7" strokeLinecap="round" strokeOpacity=".3"/></svg> },
  { key: 'minimal', label: 'Minimal', icon: <svg viewBox="0 0 38 44" fill="none" className="w-full h-full"><rect x="1" y="1" width="36" height="42" rx="3" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 2"/><line x1="6" y1="13" x2="32" y2="13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><line x1="9" y1="19" x2="29" y2="19" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><line x1="14" y1="34" x2="24" y2="34" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" strokeOpacity=".3"/></svg> },
]

const SIZE_PRESETS = [
  { label: 'Compact', w: 340, h: 200 }, { label: 'Standard', w: 420, h: 280 },
  { label: 'Tall', w: 420, h: 360 }, { label: 'Wide', w: 560, h: 240 },
  { label: 'Banner', w: 600, h: 68 }, { label: 'Ticker', w: 600, h: 48 },
]

// ─── URL builder ─────────────────────────────────────────────────────────────

function buildUrl(c: WidgetConfig): string {
  const base = `${window.location.origin}${import.meta.env.BASE_URL}`
  const p = new URLSearchParams()
  p.set('mode', c.mode)
  if (c.mode === 'kural') p.set('n', String(c.kuralNumber))
  p.set('theme', c.theme)
  p.set('lang', c.lang)
  p.set('layout', c.layout)
  if (c.accentColor) p.set('accent', c.accentColor.replace('#', ''))
  if (c.shadow !== 'none') p.set('shadow', c.shadow)
  if (c.contentMode === 'couplet') p.set('meaning', '0')
  else if (c.contentMode === 'explanation') p.set('tmeaning', '1')
  if (!c.showChapter) p.set('chapter', '0')
  if (!c.showNumber) p.set('num', '0')
  if (!c.showReadMore) p.set('rm', '0')
  if (c.showRefresh && c.mode === 'random') p.set('refresh', '1')
  if (c.uraiLabel) p.set('urai', '1')
  if (c.uraiSource !== 'default') p.set('ub', c.uraiSource)
  if (c.border !== 'classic') p.set('border', c.border)
  if (c.bgPattern !== 'none') p.set('bp', c.bgPattern)
  if (c.fontSize !== 'md') p.set('fs', c.fontSize)
  if (c.align !== 'left') p.set('al', c.align)
  if (c.radius !== 'md') p.set('r', c.radius)
  if (c.layout === 'ticker') {
    if (c.tickerSpeed !== 'normal') p.set('speed', c.tickerSpeed)
    if (c.tickerDir !== 'ltr') p.set('dir', c.tickerDir)
    if (c.pauseOnHover) p.set('pausehover', '1')
  }
  return `${base}#/widget?${p.toString()}`
}

// ─── Small reusable parts ────────────────────────────────────────────────────

function Toggle({ on, set }: { on: boolean; set: (v: boolean) => void }) {
  return (
    <button
      type="button" role="switch" aria-checked={on}
      onClick={() => set(!on)}
      className="relative inline-flex h-[22px] w-[42px] rounded-full transition-colors duration-200 cursor-pointer border-0 flex-shrink-0"
      style={{ background: on ? 'var(--color-gold)' : 'rgba(107,114,128,0.22)' }}
    >
      <span className="absolute top-[3px] left-[3px] inline-block h-4 w-4 rounded-full bg-cream shadow transition-transform duration-200"
        style={{ transform: on ? 'translateX(20px)' : 'translateX(0)' }} />
    </button>
  )
}

function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`relative rounded-2xl border border-gold/20 bg-cream p-5 shadow-[0_3px_14px_rgba(0,0,0,0.07)] transition-shadow duration-300 hover:shadow-[0_6px_24px_rgba(0,0,0,0.10)] ${className}`}>
      <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
      {children}
    </div>
  )
}

function SectionTitle({ icon, title }: { icon: ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="w-8 h-8 rounded-full bg-gold/15 border border-gold/30 flex items-center justify-center flex-shrink-0 text-gold-dark">
        {icon}
      </div>
      <h3 className="text-sm font-semibold text-dark">{title}</h3>
    </div>
  )
}

function Label({ children }: { children: ReactNode }) {
  return <p className="text-xs tracking-widest uppercase text-gold-dark/70 font-semibold mb-2.5">{children}</p>
}

function Row({ label, desc, on, set }: { label: string; desc?: string; on: boolean; set: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-gold/10 last:border-0 gap-4">
      <div className="min-w-0">
        <p className="text-sm font-medium text-dark leading-snug">{label}</p>
        {desc && <p className="text-xs text-gray-light leading-snug mt-0.5">{desc}</p>}
      </div>
      <Toggle on={on} set={set} />
    </div>
  )
}

function SquareOptionGrid({
  cols,
  sizePx,
  gapPx,
  children,
  className = '',
}: {
  cols: 2 | 3 | 4
  sizePx?: number
  gapPx?: number
  children: ReactNode
  className?: string
}) {
  const colClass = cols === 2 ? 'grid-cols-2' : cols === 3 ? 'grid-cols-3' : 'grid-cols-4'
  const resolvedGapPx = gapPx ?? 8 // gap-2
  const resolvedSizePx = sizePx ?? 88
  const maxWidthPx = cols * resolvedSizePx + (cols - 1) * resolvedGapPx
  return (
    <div className={`grid ${colClass} gap-2 w-full mr-auto ${className}`} style={{ maxWidth: maxWidthPx }}>
      {children}
    </div>
  )
}

function SquareOptionRow({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`flex items-start gap-2 overflow-x-auto overflow-y-visible py-1.5 pr-1 ${className}`}>
      {children}
    </div>
  )
}

function SquareOptionBtn({
  active,
  onClick,
  children,
  className = '',
}: {
  active: boolean
  onClick: () => void
  children: ReactNode
  className?: string
}) {
  const base = 'w-full aspect-square rounded-md text-[9.5px] leading-tight font-semibold cursor-pointer border-2 transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/35 focus-visible:ring-offset-2 focus-visible:ring-offset-cream flex items-center justify-center text-center px-1.5'
  const inactive = 'border-gold/20 bg-cream text-gray shadow-[0_2px_10px_rgba(0,0,0,0.04)] hover:border-gold/40 hover:shadow-[0_14px_26px_rgba(168,139,62,0.20)] hover:-translate-y-0.5 active:translate-y-0'
  const selected = 'border-gold/70 bg-cream text-dark shadow-[0_16px_30px_rgba(168,139,62,0.26)] -translate-y-0.5'
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${base} ${active ? selected : inactive} ${className}`}
    >
      {children}
    </button>
  )
}

function SquareOptionBtnFixed({
  active,
  onClick,
  children,
  sizePx = 72,
  className = '',
}: {
  active: boolean
  onClick: () => void
  children: ReactNode
  sizePx?: number
  className?: string
}) {
  const base = 'shrink-0 rounded-md text-[9.5px] leading-tight font-semibold cursor-pointer border-2 transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/35 focus-visible:ring-offset-2 focus-visible:ring-offset-cream flex items-center justify-center text-center px-1.5'
  const inactive = 'border-gold/20 bg-cream text-gray shadow-[0_2px_10px_rgba(0,0,0,0.04)] hover:border-gold/40 hover:shadow-[0_14px_26px_rgba(168,139,62,0.20)] hover:-translate-y-0.5 active:translate-y-0'
  const selected = 'border-gold/70 bg-cream text-dark shadow-[0_16px_30px_rgba(168,139,62,0.26)] -translate-y-0.5'
  return (
    <button
      type="button"
      onClick={onClick}
      style={{ width: sizePx, height: sizePx }}
      className={`${base} ${active ? selected : inactive} ${className}`}
    >
      {children}
    </button>
  )
}

function PatternSwatch({ kind }: { kind: WidgetBgPattern }) {
  const baseStyle: React.CSSProperties = {
    width: 26,
    height: 26,
    borderRadius: 6,
    border: '1px solid rgba(168,139,62,0.28)',
    backgroundColor: 'color-mix(in srgb, var(--color-cream) 65%, transparent)',
  }
  if (kind === 'dots') {
    return (
      <div
        aria-hidden
        style={{
          ...baseStyle,
          backgroundImage: 'radial-gradient(circle, rgba(168,139,62,0.35) 1.4px, transparent 1.4px)',
          backgroundSize: '10px 10px',
        }}
      />
    )
  }
  if (kind === 'lines') {
    return (
      <div
        aria-hidden
        style={{
          ...baseStyle,
          backgroundImage: 'repeating-linear-gradient(45deg, rgba(168,139,62,0.28) 0, rgba(168,139,62,0.28) 1px, transparent 1px, transparent 6px)',
        }}
      />
    )
  }
  return <div aria-hidden style={{ ...baseStyle, backgroundImage: 'none' }} />
}

function MiniCard({
  border = '1px solid rgba(168,139,62,0.32)',
  radius = 6,
  bg = 'color-mix(in srgb, var(--color-cream) 65%, transparent)',
  shadow,
}: {
  border?: string
  radius?: number
  bg?: string
  shadow?: string
}) {
  return (
    <div
      aria-hidden
      style={{
        width: 26,
        height: 26,
        borderRadius: radius,
        border,
        background: bg,
        boxShadow: shadow,
      }}
    />
  )
}

function ShadowSwatch({ level }: { level: ShadowLevel }) {
  const shadow =
    level === 'none'
      ? 'none'
      : level === 'sm'
        ? '0 2px 8px rgba(0,0,0,0.14)'
        : level === 'md'
          ? '0 5px 18px rgba(0,0,0,0.18)'
          : '0 10px 30px rgba(0,0,0,0.22)'
  return <MiniCard shadow={shadow} />
}

function BorderSwatch({ kind }: { kind: WidgetBorder }) {
  if (kind === 'none') return <MiniCard border="1px solid rgba(168,139,62,0.10)" />
  if (kind === 'ornate') {
    return (
      <div aria-hidden style={{ width: 26, height: 26, position: 'relative' }}>
        <MiniCard border="1.5px solid rgba(168,139,62,0.55)" />
        <div style={{ position: 'absolute', top: 2, left: 2, right: 2, height: 1, background: 'linear-gradient(90deg, transparent, rgba(168,139,62,0.75), transparent)' }} />
        <div style={{ position: 'absolute', bottom: 2, left: 2, right: 2, height: 1, background: 'linear-gradient(90deg, transparent, rgba(168,139,62,0.45), transparent)', opacity: 0.65 }} />
      </div>
    )
  }
  return <MiniCard border="1.5px solid rgba(168,139,62,0.55)" />
}

function AlignSwatch({ align }: { align: WidgetAlign }) {
  const line = (w: number) => (
    <div
      key={w}
      style={{
        height: 2,
        width: w,
        background: 'rgba(168,139,62,0.42)',
        borderRadius: 999,
      }}
    />
  )
  return (
    <div
      aria-hidden
      style={{
        width: 26,
        height: 26,
        borderRadius: 6,
        border: '1px solid rgba(168,139,62,0.22)',
        background: 'color-mix(in srgb, var(--color-cream) 55%, transparent)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        gap: 4,
        padding: '4px 5px',
        alignItems: align === 'center' ? 'center' : 'flex-start',
      }}
    >
      {line(12)}
      {line(16)}
      {line(10)}
    </div>
  )
}

function ModeIcon({ mode }: { mode: WidgetConfig['mode'] }) {
  const common = { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor' }
  const stroke = { strokeWidth: 2.4, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
  if (mode === 'daily') {
    return (
      <svg aria-hidden {...common}>
        <path {...stroke} d="M8 7V3m8 4V3M5 11h14M6 21h12a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z" />
      </svg>
    )
  }
  if (mode === 'random') {
    return (
      <svg aria-hidden {...common}>
        <path {...stroke} d="M4 4h4l12 12h-4M4 20h4l3-3M20 8h-4l-3 3" />
      </svg>
    )
  }
  return (
    <svg aria-hidden {...common}>
      <path {...stroke} d="M7 7h10M7 12h10M7 17h10" />
      <path {...stroke} d="M5 7h.01M5 12h.01M5 17h.01" />
    </svg>
  )
}

function ContentIcon({ kind }: { kind: ContentMode }) {
  const common = { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor' }
  const stroke = { strokeWidth: 2.4, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
  if (kind === 'couplet') {
    return (
      <svg aria-hidden {...common}>
        <path {...stroke} d="M7 7h10M7 12h10M7 17h7" />
      </svg>
    )
  }
  if (kind === 'explanation') {
    return (
      <svg aria-hidden {...common}>
        <path {...stroke} d="M4 19a2 2 0 0 0 2 2h12" />
        <path {...stroke} d="M6 3h12v14H6a2 2 0 0 0-2 2V5a2 2 0 0 1 2-2z" />
      </svg>
    )
  }
  return (
    <svg aria-hidden {...common}>
      <path {...stroke} d="M4 7h16M4 12h10M4 17h16" />
    </svg>
  )
}

// ─── Main ────────────────────────────────────────────────────────────────────

export default function WidgetBuilder() {
  const [cfg, setCfg] = useState<WidgetConfig>(DEFAULT)
  const [preset, setPreset] = useState<number | null>(0)
  const [copied, setCopied] = useState(false)
  const [copiedUrl, setCopiedUrl] = useState(false)
  const [customSize, setCustomSize] = useState(false)
  const [kuralNumberDraft, setKuralNumberDraft] = useState(() => String(DEFAULT.kuralNumber))
  const [sizeDraft, setSizeDraft] = useState(() => ({ width: String(DEFAULT.width), height: String(DEFAULT.height) }))
  const kuralDraftTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const sizeDraftTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const accentRef = useRef<HTMLInputElement>(null)
  const [urlParams] = useSearchParams()
  const { getKural, getKuralOfTheDay } = useKurals()

  useEffect(() => {
    const n = parseInt(urlParams.get('n') || '0', 10)
    if (n >= 1 && n <= 1330) {
      setCfg(prev => ({ ...prev, mode: 'kural', kuralNumber: n }))
      setPreset(null)
    }
  }, []) // eslint-disable-line

  const upd = useCallback((p: Partial<WidgetConfig>) => {
    setCfg(prev => ({ ...prev, ...p }))
    setPreset(null)
  }, [])

  const applyPreset = useCallback((i: number) => {
    setCfg(prev => ({ ...prev, ...PRESETS[i].cfg, kuralNumber: prev.kuralNumber }))
    setPreset(i)
  }, [])

  const kural = useMemo(() => {
    return cfg.mode === 'daily' ? getKuralOfTheDay(0) : getKural(cfg.kuralNumber || 1)
  }, [cfg.mode, cfg.kuralNumber, getKural, getKuralOfTheDay])

  const embedUrl = useMemo(() => buildUrl(cfg), [cfg])
  const embedCode = useMemo(() => {
    return `<iframe src="${embedUrl}" width="${cfg.width}" height="${cfg.height}" frameborder="0" scrolling="no" style="border-radius:12px;border:none;display:block;" title="Thirukkural Widget"></iframe>`
  }, [embedUrl, cfg.width, cfg.height])

  const copy = useCallback((text: string, fn: (v: boolean) => void) => {
    navigator.clipboard.writeText(text).then(() => { fn(true); setTimeout(() => fn(false), 2200) })
  }, [])

  const resolvedTheme = useMemo(() => {
    return resolveWidgetTheme(cfg.theme, cfg.accentColor.replace('#', ''))
  }, [cfg.theme, cfg.accentColor])

  const previewMeaning = useMemo(() => {
    return cfg.lang === 'ta' ? (kural?.tamilMeaning || '') : (kural?.englishMeaning || '')
  }, [cfg.lang, kural?.tamilMeaning, kural?.englishMeaning])

  const showTamilMeaning = cfg.contentMode === 'explanation'
  const showMeaning = cfg.contentMode !== 'couplet'
  const clampedW = useMemo(() => Math.min(cfg.width, 680), [cfg.width])
  const isTicker = cfg.layout === 'ticker'
  const isBanner = cfg.layout === 'banner'

  const previewKuralUrl = useMemo(() => {
    return kural ? `${window.location.origin}${import.meta.env.BASE_URL}#/kural/${kural.number}` : undefined
  }, [kural?.number])

  const [tamilUraiText, setTamilUraiText] = useState<string>('')

  useEffect(() => {
    let alive = true
    if (!kural) return
    if (cfg.lang !== 'ta' || cfg.contentMode !== 'explanation') {
      setTamilUraiText('')
      return
    }

    const fallback = kural.tamilMeaning || ''
    if (cfg.uraiSource === 'default') {
      setTamilUraiText(fallback)
      return
    }

    getTamilUraiText({ kuralNumber: kural.number, source: cfg.uraiSource, fallback }).then((text) => {
      if (!alive) return
      setTamilUraiText(text)
    })

    return () => { alive = false }
  }, [cfg.lang, cfg.contentMode, cfg.uraiSource, kural])

  useEffect(() => {
    if (cfg.mode === 'kural') setKuralNumberDraft(String(cfg.kuralNumber))
  }, [cfg.mode, cfg.kuralNumber])

  useEffect(() => {
    if (customSize) setSizeDraft({ width: String(cfg.width), height: String(cfg.height) })
  }, [customSize, cfg.width, cfg.height])

  useEffect(() => {
    return () => {
      if (kuralDraftTimer.current) clearTimeout(kuralDraftTimer.current)
      if (sizeDraftTimer.current) clearTimeout(sizeDraftTimer.current)
    }
  }, [])

  const commitKuralDraft = useCallback((raw: string) => {
    const n = Math.min(1330, Math.max(1, parseInt(raw || '1', 10) || 1))
    upd({ kuralNumber: n })
  }, [upd])

  const scheduleCommitKuralDraft = useCallback((raw: string) => {
    if (kuralDraftTimer.current) clearTimeout(kuralDraftTimer.current)
    kuralDraftTimer.current = setTimeout(() => commitKuralDraft(raw), 300)
  }, [commitKuralDraft])

  const commitSizeDraft = useCallback((draft: { width: string; height: string }) => {
    const w = Math.max(200, parseInt(draft.width || '0', 10) || cfg.width)
    const h = Math.max(40, parseInt(draft.height || '0', 10) || cfg.height)
    upd({ width: w, height: h })
  }, [cfg.width, cfg.height, upd])

  const scheduleCommitSizeDraft = useCallback((draft: { width: string; height: string }) => {
    if (sizeDraftTimer.current) clearTimeout(sizeDraftTimer.current)
    sizeDraftTimer.current = setTimeout(() => commitSizeDraft(draft), 250)
  }, [commitSizeDraft])

  return (
    <div className="min-h-screen bg-cream">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

        {/* ── Header ──────────────────────────────────────────────────── */}
        <div className="relative rounded-3xl overflow-hidden border border-gold/25 hero-card-bg paper-texture p-6 md:p-8 mb-7 shadow-[0_8px_24px_rgba(168,139,62,0.10)]">
          <div className="corner-ornament top-left left-3 top-3" />
          <div className="corner-ornament top-right right-3 top-3" />
          <div className="corner-ornament bottom-left left-3 bottom-3" />
          <div className="corner-ornament bottom-right right-3 bottom-3" />
          <div className="temple-border-top" />
          <div className="relative z-10 text-center">
            <p className="text-xs tracking-[0.25em] uppercase text-gold-dark/70 font-semibold mb-2">Embed · Customise · Share</p>
            <h1 className="font-tamil text-3xl md:text-4xl font-bold text-dark mb-2 ornamental-underline">Widget Builder</h1>
            <p className="text-sm text-gray mt-4 max-w-xl mx-auto leading-relaxed">
              Create embeddable Thirukkural widgets for your website. Pick a layout, choose a theme, configure the content — then copy the <code className="text-gold-dark/80 text-xs bg-gold/10 px-1.5 py-0.5 rounded-md font-mono">&lt;iframe&gt;</code> code.
            </p>
          </div>
        </div>

        {/* ── Presets ─────────────────────────────────────────────────── */}
        <div className="mb-7">
          <p className="text-xs font-semibold text-gray-light uppercase tracking-widest mb-3">Quick Presets</p>
          <div className="flex gap-2.5 overflow-x-auto pb-1">
            {PRESETS.map((p, i) => (
              <button key={p.name} type="button" onClick={() => applyPreset(i)}
                className={`group flex-shrink-0 relative rounded-md border-2 p-3 text-left cursor-pointer w-[130px] transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/35 focus-visible:ring-offset-2 focus-visible:ring-offset-cream ${preset === i ? 'border-gold bg-gold/10' : 'border-gold/20 bg-cream hover:border-gold/40 hover:bg-gold/10'}`}>
                <div className="flex gap-1 mb-2">
                  {p.swatches.map((s, j) => <div key={j} className="w-3.5 h-3.5 rounded-full border border-black/10" style={{ background: s }} />)}
                </div>
                <p className="text-xs font-semibold text-dark leading-snug">{p.name}</p>
                {preset === i && <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-gold flex items-center justify-center"><svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg></div>}
              </button>
            ))}
          </div>
        </div>

        {/* ── Grid ────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 xl:grid-cols-[400px,1fr] gap-6 items-start">

          {/* ══ LEFT: Settings ══════════════════════════════════════════ */}
          <div className="space-y-4">

            {/* Widget */}
            <Card>
              <SectionTitle icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" /></svg>} title="Widget" />

              {/* Mode */}
              <Label>Mode</Label>
              <SquareOptionGrid cols={3} className="mb-5">
                {[{ v: 'daily', l: 'Daily' }, { v: 'random', l: 'Random' }, { v: 'kural', l: 'Specific' }].map(m => (
                  <SquareOptionBtn key={m.v} active={cfg.mode === m.v} onClick={() => upd({ mode: m.v as WidgetConfig['mode'] })}>
                    <div className="flex flex-col items-center justify-center gap-2 text-gold-dark">
                      <ModeIcon mode={m.v as WidgetConfig['mode']} />
                      <span className="text-gray">{m.l}</span>
                    </div>
                  </SquareOptionBtn>
                ))}
              </SquareOptionGrid>
              {cfg.mode === 'kural' && (
                <div className="mb-5">
                  <Label>Kural Number</Label>
                  <input
                    type="number"
                    min={1}
                    max={1330}
                    value={kuralNumberDraft}
                    onChange={e => {
                      setKuralNumberDraft(e.target.value)
                      scheduleCommitKuralDraft(e.target.value)
                    }}
                    onBlur={() => {
                      if (kuralDraftTimer.current) clearTimeout(kuralDraftTimer.current)
                      commitKuralDraft(kuralNumberDraft)
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-gold/25 bg-cream text-dark text-sm focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all" />
                  {kural && <p className="mt-1.5 text-xs text-gray-light">{kural.category} · {kural.chapterEnglish}</p>}
                </div>
              )}

              {/* Layout */}
              <Label>Layout</Label>
              <div className="grid grid-cols-3 gap-2">
                {LAYOUTS.map(l => (
                  <button key={l.key} type="button" onClick={() => upd({ layout: l.key })}
                    className={`flex flex-col items-center gap-2 p-3 rounded-md border-2 cursor-pointer transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/35 focus-visible:ring-offset-2 focus-visible:ring-offset-cream ${cfg.layout === l.key ? 'border-gold bg-gold/12 text-gold-dark' : 'border-gold/25 bg-cream text-gray hover:border-gold/45 hover:bg-gold/10'}`}>
                    <div className="w-10 h-8 flex items-center justify-center">{l.icon}</div>
                    <span className="text-[10px] font-semibold">{l.label}</span>
                  </button>
                ))}
              </div>

              {/* Ticker-specific options */}
              {isTicker && (
                <div className="mt-4 p-3.5 rounded-xl border border-gold/15 bg-gold/5 space-y-3">
                  <p className="text-xs font-semibold text-gold-dark">Ticker Options</p>
                  <div>
                    <Label>Speed</Label>
                    <SquareOptionGrid cols={3}>
                      {(['slow', 'normal', 'fast'] as const).map(s => (
                        <SquareOptionBtn key={s} active={cfg.tickerSpeed === s} onClick={() => upd({ tickerSpeed: s })}>
                          {s.charAt(0).toUpperCase() + s.slice(1)}
                        </SquareOptionBtn>
                      ))}
                    </SquareOptionGrid>
                  </div>
                  <div>
                    <Label>Direction</Label>
                    <SquareOptionGrid cols={2}>
                      <SquareOptionBtn active={cfg.tickerDir === 'ltr'} onClick={() => upd({ tickerDir: 'ltr' })}>← Left</SquareOptionBtn>
                      <SquareOptionBtn active={cfg.tickerDir === 'rtl'} onClick={() => upd({ tickerDir: 'rtl' })}>Right →</SquareOptionBtn>
                    </SquareOptionGrid>
                  </div>
                  <Row label="Pause on Hover" on={cfg.pauseOnHover} set={v => upd({ pauseOnHover: v })} />
                </div>
              )}
            </Card>

            {/* Language & Content */}
            <Card>
              <SectionTitle icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" /></svg>} title="Language & Content" />

              <Label>Language</Label>
              <select value={cfg.lang} onChange={e => upd({ lang: e.target.value as Language })}
                className="w-full px-3 py-2.5 rounded-xl border border-gold/25 bg-cream text-dark text-sm focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all cursor-pointer mb-4">
                {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.nativeName} — {l.englishName}</option>)}
              </select>

              {!isTicker && !isBanner && (
                <>
                  <Label>Content</Label>
                  <SquareOptionGrid cols={3} className="mb-4">
                    {([{ v: 'translation', l: 'Translation' }, { v: 'couplet', l: 'Couplet Only' }, { v: 'explanation', l: 'Explanation' }] as const).map(m => (
                      <SquareOptionBtn key={m.v} active={cfg.contentMode === m.v} onClick={() => upd({ contentMode: m.v })}>
                        <div className="flex flex-col items-center justify-center gap-2 text-gold-dark">
                          <ContentIcon kind={m.v} />
                          <span className="text-gray">{m.l}</span>
                        </div>
                      </SquareOptionBtn>
                    ))}
                  </SquareOptionGrid>
                </>
              )}

              <Row label="Chapter Info" desc="Category and chapter chips" on={cfg.showChapter} set={v => upd({ showChapter: v })} />
              <Row label="Kural Number" desc="Diamond number badge" on={cfg.showNumber} set={v => upd({ showNumber: v })} />
              {!isTicker && !isBanner && (
                <Row label="Read More Button" desc="Links to full kural page" on={cfg.showReadMore} set={v => upd({ showReadMore: v })} />
              )}
              {cfg.mode === 'random' && <Row label="Next Button" desc="Refresh to show another kural" on={cfg.showRefresh} set={v => upd({ showRefresh: v })} />}

              {/* Tamil urai options */}
              {cfg.lang === 'ta' && !isTicker && !isBanner && cfg.contentMode === 'explanation' && (
                <div className="mt-3 pt-3 border-t border-gold/10">
                  <p className="text-xs font-semibold text-gold-dark mb-2 font-tamil">தமிழ் உரை Options</p>
                  <Label>Urai Source</Label>
                  <select
                    value={URAI_SOURCES.some(s => s.key === cfg.uraiSource) ? cfg.uraiSource : 'parimel'}
                    onChange={e => upd({ uraiSource: e.target.value as UraiSourceKey })}
                    className="w-full px-3 py-2.5 rounded-xl border border-gold/25 bg-cream text-dark text-sm focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all cursor-pointer mb-3"
                  >
                    {URAI_SOURCES.map(s => (
                      <option key={s.key} value={s.key}>{s.label}</option>
                    ))}
                  </select>
                  <Row label='Label as "விளக்கம்:"' desc="Prefix Tamil commentary with a header" on={cfg.uraiLabel} set={v => upd({ uraiLabel: v })} />
                </div>
              )}
            </Card>

            {/* Appearance */}
            <Card>
              <SectionTitle icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>} title="Appearance" />

              <Label>Theme</Label>
              <div className="grid grid-cols-7 gap-1.5 mb-5">
                {THEMES.map(t => {
                  const th = WIDGET_THEMES[t.key]
                  return (
                    <button key={t.key} type="button" onClick={() => upd({ theme: t.key })} title={t.label}
                      className={`flex flex-col items-center gap-1 p-1.5 rounded-md border-2 cursor-pointer transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/35 focus-visible:ring-offset-2 focus-visible:ring-offset-cream ${cfg.theme === t.key ? 'border-gold bg-gold/10' : 'border-transparent hover:border-gold/30 hover:bg-gold/10'}`}>
                      <div className="w-8 h-8 rounded-lg border border-black/10 flex items-center justify-center" style={{ background: th.bg }}>
                        <div className="w-3 h-3 rounded-full" style={{ background: th.accent }} />
                      </div>
                      <span className="text-[9px] font-medium text-gray">{t.label}</span>
                    </button>
                  )
                })}
              </div>

              {/* Accent Color */}
              <div className="mb-5">
                <Label>Custom Accent Color</Label>
                <div className="flex items-center gap-2.5">
                  <div className="relative flex-shrink-0">
                    <input ref={accentRef} type="color" value={cfg.accentColor || WIDGET_THEMES[cfg.theme].accent} onChange={e => upd({ accentColor: e.target.value })}
                      className="w-10 h-10 rounded-xl border border-gold/25 cursor-pointer p-0.5 bg-transparent" />
                  </div>
                  <input type="text" placeholder={WIDGET_THEMES[cfg.theme].accent} value={cfg.accentColor}
                    onChange={e => upd({ accentColor: e.target.value })}
                    className="flex-1 px-3 py-2 rounded-xl border border-gold/25 bg-cream text-dark text-sm font-mono focus:outline-none focus:border-gold transition-all placeholder:text-gray-light" />
                  {cfg.accentColor && (
                    <button onClick={() => upd({ accentColor: '' })} className="text-xs text-gray-light hover:text-gray transition-colors cursor-pointer bg-transparent border-none px-0">Reset</button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
                {/* Shadow */}
                <div>
                  <Label>Shadow</Label>
                  <div className="sm:hidden">
                    <SquareOptionGrid cols={2} sizePx={72}>
                      {([{ v: 'none', l: 'None' }, { v: 'sm', l: 'Soft' }, { v: 'md', l: 'Medium' }, { v: 'lg', l: 'Deep' }] as const).map(s => (
                      <SquareOptionBtn key={s.v} active={cfg.shadow === s.v} onClick={() => upd({ shadow: s.v })}>
                        <div className="flex flex-col items-center justify-center gap-2">
                          <ShadowSwatch level={s.v} />
                          <span>{s.l}</span>
                        </div>
                      </SquareOptionBtn>
                    ))}
                  </SquareOptionGrid>
                </div>
                  <div className="hidden sm:block">
                    <SquareOptionGrid cols={4} sizePx={72}>
                      {([{ v: 'none', l: 'None' }, { v: 'sm', l: 'Soft' }, { v: 'md', l: 'Medium' }, { v: 'lg', l: 'Deep' }] as const).map(s => (
                      <SquareOptionBtn key={s.v} active={cfg.shadow === s.v} onClick={() => upd({ shadow: s.v })}>
                        <div className="flex flex-col items-center justify-center gap-2">
                          <ShadowSwatch level={s.v} />
                          <span>{s.l}</span>
                        </div>
                      </SquareOptionBtn>
                    ))}
                  </SquareOptionGrid>
                </div>
                </div>

                {/* Border */}
                <div>
                  <Label>Border Style</Label>
                  <div className="sm:hidden">
                    <SquareOptionGrid cols={2} sizePx={72}>
                      {([{ v: 'classic', l: 'Classic' }, { v: 'ornate', l: 'Ornate' }, { v: 'none', l: 'None' }] as const).map(b => (
                      <SquareOptionBtn key={b.v} active={cfg.border === b.v} onClick={() => upd({ border: b.v })}>
                        <div className="flex flex-col items-center justify-center gap-2">
                          <BorderSwatch kind={b.v} />
                          <span>{b.l}</span>
                        </div>
                      </SquareOptionBtn>
                    ))}
                  </SquareOptionGrid>
                </div>
                  <div className="hidden sm:block">
                    <SquareOptionGrid cols={3} sizePx={72}>
                      {([{ v: 'classic', l: 'Classic' }, { v: 'ornate', l: 'Ornate' }, { v: 'none', l: 'None' }] as const).map(b => (
                      <SquareOptionBtn key={b.v} active={cfg.border === b.v} onClick={() => upd({ border: b.v })}>
                        <div className="flex flex-col items-center justify-center gap-2">
                          <BorderSwatch kind={b.v} />
                          <span>{b.l}</span>
                        </div>
                      </SquareOptionBtn>
                    ))}
                  </SquareOptionGrid>
                </div>
              </div>
              </div>

              {/* Background texture */}
              <div>
                <Label>Background Texture</Label>
                <SquareOptionGrid cols={3}>
                  {([{ v: 'none', l: 'None' }, { v: 'dots', l: 'Dots' }, { v: 'lines', l: 'Lines' }] as const).map(bp => (
                    <SquareOptionBtn key={bp.v} active={cfg.bgPattern === bp.v} onClick={() => upd({ bgPattern: bp.v })}>
                      <div className="flex flex-col items-center justify-center gap-2">
                        <PatternSwatch kind={bp.v} />
                        <span>{bp.l}</span>
                      </div>
                    </SquareOptionBtn>
                  ))}
                </SquareOptionGrid>
              </div>
            </Card>

            {/* Typography & Style */}
            {!isTicker && !isBanner && (
              <Card>
                <SectionTitle icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h8m-8 6h16" /></svg>} title="Typography & Style" />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <Label>Font Size</Label>
                    <div className="sm:hidden">
                      <SquareOptionGrid cols={2} sizePx={72}>
                        {([{ v: 'sm', l: 'Small', t: 'text-sm' }, { v: 'md', l: 'Medium', t: 'text-base' }, { v: 'lg', l: 'Large', t: 'text-lg' }] as const).map(fs => (
                          <SquareOptionBtn
                            key={fs.v}
                            active={cfg.fontSize === fs.v}
                            onClick={() => upd({ fontSize: fs.v })}
                            className="flex flex-col items-center justify-center gap-1"
                          >
                            <span className={`font-tamil font-bold ${fs.t}`}>அ</span>
                            <span>{fs.l}</span>
                          </SquareOptionBtn>
                        ))}
                      </SquareOptionGrid>
                    </div>
                    <div className="hidden sm:block">
                      <SquareOptionRow>
                        {([{ v: 'sm', l: 'Small', t: 'text-sm' }, { v: 'md', l: 'Medium', t: 'text-base' }, { v: 'lg', l: 'Large', t: 'text-lg' }] as const).map(fs => (
                          <SquareOptionBtnFixed
                            key={fs.v}
                            active={cfg.fontSize === fs.v}
                            onClick={() => upd({ fontSize: fs.v })}
                            className="flex flex-col items-center justify-center gap-1"
                          >
                            <span className={`font-tamil font-bold ${fs.t}`}>அ</span>
                            <span>{fs.l}</span>
                          </SquareOptionBtnFixed>
                        ))}
                      </SquareOptionRow>
                    </div>
                  </div>
                  <div>
                    <Label>Corner Radius</Label>
                    <div className="sm:hidden">
                      <SquareOptionGrid cols={2} sizePx={72}>
                        {([{ v: 'none', l: 'Sharp', px: 0 }, { v: 'sm', l: 'Soft', px: 6 }, { v: 'md', l: 'Round', px: 12 }, { v: 'lg', l: 'Full', px: 20 }] as const).map(r => (
                          <SquareOptionBtn
                            key={r.v}
                            active={cfg.radius === r.v}
                            onClick={() => upd({ radius: r.v })}
                            className="flex flex-col items-center justify-center gap-2"
                          >
                            <div className="w-5 h-3.5 border border-current opacity-60" style={{ borderRadius: r.px }} />
                            <span>{r.l}</span>
                          </SquareOptionBtn>
                        ))}
                      </SquareOptionGrid>
                    </div>
                    <div className="hidden sm:block">
                      <SquareOptionRow>
                        {([{ v: 'none', l: 'Sharp', px: 0 }, { v: 'sm', l: 'Soft', px: 6 }, { v: 'md', l: 'Round', px: 12 }, { v: 'lg', l: 'Full', px: 20 }] as const).map(r => (
                          <SquareOptionBtnFixed
                            key={r.v}
                            active={cfg.radius === r.v}
                            onClick={() => upd({ radius: r.v })}
                            className="flex flex-col items-center justify-center gap-2"
                          >
                            <div className="w-5 h-3.5 border border-current opacity-60" style={{ borderRadius: r.px }} />
                            <span>{r.l}</span>
                          </SquareOptionBtnFixed>
                        ))}
                      </SquareOptionRow>
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <Label>Text Alignment</Label>
                  <SquareOptionGrid cols={2}>
                    {([{ v: 'left', l: 'Left' }, { v: 'center', l: 'Centre' }] as const).map(a => (
                      <SquareOptionBtn key={a.v} active={cfg.align === a.v} onClick={() => upd({ align: a.v })}>
                        <div className="flex flex-col items-center justify-center gap-2">
                          <AlignSwatch align={a.v} />
                          <span>{a.l}</span>
                        </div>
                      </SquareOptionBtn>
                    ))}
                  </SquareOptionGrid>
                </div>
              </Card>
            )}

            {/* Size */}
            <Card>
              <SectionTitle icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>} title="Widget Size" />

              <div className="grid grid-cols-3 gap-2 mb-3">
                {SIZE_PRESETS.map(s => (
                  <button key={s.label} type="button" onClick={() => { upd({ width: s.w, height: s.h }); setCustomSize(false) }}
                    className={`py-2 px-2 rounded-md text-left text-xs cursor-pointer border-2 transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/35 focus-visible:ring-offset-2 focus-visible:ring-offset-cream ${cfg.width === s.w && cfg.height === s.h && !customSize ? 'border-gold bg-gold/15 text-dark' : 'border-gold/25 bg-cream text-gray hover:border-gold/45 hover:bg-gold/10'}`}>
                    <span className="block font-semibold">{s.label}</span>
                    <span className="text-[10px] text-gray-light">{s.w}×{s.h}</span>
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => {
                  setCustomSize(v => {
                    const next = !v
                    if (next) setSizeDraft({ width: String(cfg.width), height: String(cfg.height) })
                    return next
                  })
                }}
                className={`w-full py-2 rounded-md text-xs font-medium cursor-pointer border-2 transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/35 focus-visible:ring-offset-2 focus-visible:ring-offset-cream ${customSize ? 'border-gold bg-gold/15 text-dark' : 'border-gold/25 bg-cream text-gray hover:border-gold/45 hover:bg-gold/10'}`}>
                Custom Size…
              </button>
              {customSize && (
                <div className="flex gap-3 mt-3">
	                  {[{ label: 'Width', key: 'width' as const, min: 200 }, { label: 'Height', key: 'height' as const, min: 40 }].map(f => (
	                    <div key={f.key} className="flex-1">
	                      <label className="block text-xs text-gray-light mb-1">{f.label} px</label>
	                      <input
	                        type="number"
	                        value={sizeDraft[f.key]}
	                        onChange={e => {
	                          const next = { ...sizeDraft, [f.key]: e.target.value }
	                          setSizeDraft(next)
	                          scheduleCommitSizeDraft(next)
	                        }}
	                        onBlur={() => {
	                          if (sizeDraftTimer.current) clearTimeout(sizeDraftTimer.current)
	                          commitSizeDraft(sizeDraft)
	                        }}
	                        className="w-full px-3 py-2 rounded-xl border border-gold/25 bg-cream text-dark text-sm focus:outline-none focus:border-gold transition-all" />
	                    </div>
	                  ))}
	                </div>
              )}
            </Card>
          </div>

          {/* ══ RIGHT: Preview + Code ══════════════════════════════════ */}
          <div className="space-y-5 xl:sticky xl:top-24">

            {/* Preview */}
            <Card>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-400" />
                  <span className="text-sm font-semibold text-dark">Live Preview</span>
                  <span className="text-xs text-gray-light">{cfg.width} × {cfg.height} px</span>
                </div>
                <a
                  href={embedUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-gold-dark hover:text-gold transition-colors no-underline font-medium border border-gold/25 bg-cream/70 px-2.5 py-1.5 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/35 focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
                >
                  Open standalone
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                </a>
              </div>
              <div className="mx-auto overflow-hidden rounded-xl" style={{ width: clampedW, height: cfg.height, maxWidth: '100%', boxShadow: '0 4px 24px rgba(0,0,0,0.10), 0 0 0 1px rgba(0,0,0,0.06)' }}>
                {kural ? (
	                  <WidgetRender
	                    kuralNumber={kural.number} tamil={kural.tamil} tamilMeaning={(cfg.lang === 'ta' && cfg.contentMode === 'explanation') ? (tamilUraiText || kural.tamilMeaning) : kural.tamilMeaning}
	                    englishMeaning={kural.englishMeaning} chapterEnglish={kural.chapterEnglish}
	                    category={kural.category} meaning={previewMeaning}
	                    layout={cfg.layout} theme={resolvedTheme}
	                    border={cfg.border} fontSize={cfg.fontSize} align={cfg.align}
	                    radius={cfg.radius} bgPattern={cfg.bgPattern} shadow={cfg.shadow}
	                    showMeaning={showMeaning} showTamilMeaning={showTamilMeaning}
	                    showChapter={cfg.showChapter} showNumber={cfg.showNumber}
	                    showReadMore={cfg.showReadMore} showRefresh={false}
	                    uraiLabel={cfg.uraiLabel} tickerSpeed={cfg.tickerSpeed}
	                    tickerDir={cfg.tickerDir} pauseOnHover={cfg.pauseOnHover}
	                    kuralUrl={previewKuralUrl}
	                    footerLabel={cfg.lang === 'ta' ? 'திருக்குறள்' : 'Thirukkural'}
	                  />
                ) : (
                  <div style={{ width: '100%', height: '100%', background: resolvedTheme.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <p style={{ color: resolvedTheme.subtext, fontSize: 12 }}>Loading…</p>
                  </div>
                )}
              </div>
              <div className="mt-2.5 space-y-1">
                {cfg.mode === 'random' && (
                  <p className="text-xs text-gray-light text-center">Preview shows a fixed kural — the embedded widget will show a random one.</p>
                )}
                {cfg.lang !== 'en' && cfg.lang !== 'ta' && (
                  <p className="text-xs text-gray-light text-center">Preview shows English — the embedded widget will display {LANGUAGES.find(l => l.code === cfg.lang)?.englishName}.</p>
                )}
              </div>
            </Card>

            {/* Embed Code */}
            <Card>
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-semibold text-dark">Embed Code</span>
                <button type="button" onClick={() => copy(embedCode, setCopied)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-sm text-xs font-medium cursor-pointer border transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/35 focus-visible:ring-offset-2 focus-visible:ring-offset-cream border-gold/30 bg-cream text-gold-dark hover:border-gold/55 hover:bg-gold/10"
                  style={copied ? { backgroundColor: 'color-mix(in srgb, var(--color-quiz-correct) 12%, transparent)', borderColor: 'color-mix(in srgb, var(--color-quiz-correct) 35%, transparent)', color: 'var(--color-quiz-correct-text)' } : undefined}>
                  {copied
                    ? <><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>Copied!</>
                    : <><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>Copy Code</>}
                </button>
              </div>
              {/* Code block */}
              <div className="rounded-xl overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2" style={{ background: '#0F1117' }}>
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-400/60" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/60" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-400/60" />
                  </div>
                  <span className="text-[10px] text-white/25 font-mono">iframe</span>
                </div>
                <pre className="p-4 text-xs leading-relaxed overflow-x-auto m-0" style={{ background: '#1A1A2E', color: '#A8B2D8', fontFamily: "'Fira Code','Consolas',monospace" }}>
                  <span style={{ color: '#E2B714' }}>&lt;iframe</span>{'\n'}
                  {'  '}<span style={{ color: '#7FDBCA' }}>src</span>=<span style={{ color: '#A8FF78' }}>"{embedUrl}"</span>{'\n'}
                  {'  '}<span style={{ color: '#7FDBCA' }}>width</span>=<span style={{ color: '#A8FF78' }}>"{cfg.width}"</span>{'  '}<span style={{ color: '#7FDBCA' }}>height</span>=<span style={{ color: '#A8FF78' }}>"{cfg.height}"</span>{'\n'}
                  {'  '}<span style={{ color: '#7FDBCA' }}>frameborder</span>=<span style={{ color: '#A8FF78' }}>"0"</span>{'  '}<span style={{ color: '#7FDBCA' }}>scrolling</span>=<span style={{ color: '#A8FF78' }}>"no"</span>{'\n'}
                  {'  '}<span style={{ color: '#7FDBCA' }}>style</span>=<span style={{ color: '#A8FF78' }}>"border-radius:12px;border:none;display:block;"</span>{'\n'}
                  {'  '}<span style={{ color: '#7FDBCA' }}>title</span>=<span style={{ color: '#A8FF78' }}>"Thirukkural Widget"</span>{'\n'}
                  <span style={{ color: '#E2B714' }}>&gt;&lt;/iframe&gt;</span>
                </pre>
              </div>
              {/* URL row */}
              <div className="mt-3 flex items-start gap-2 p-3 rounded-xl bg-cream border border-gold/15">
                <p className="flex-1 text-xs text-gray break-all leading-relaxed">{embedUrl}</p>
                <button onClick={() => copy(embedUrl, setCopiedUrl)}
                  className={`flex-shrink-0 text-xs font-medium transition-colors cursor-pointer bg-transparent border-none px-0 ${copiedUrl ? 'text-green-600' : 'text-gold-dark hover:text-gold'}`}>
                  {copiedUrl ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </Card>

            {/* Tips */}
            <Card className="bg-parchment/60">
              <SectionTitle
                icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M9 21h6a2 2 0 002-2v-1a3 3 0 00-1.5-2.6A3 3 0 0114 12V9a2 2 0 10-4 0v3a3 3 0 01-1.5 2.4A3 3 0 007 18v1a2 2 0 002 2z" /></svg>}
                title="Tips"
              />
              <ul className="space-y-2.5 text-sm text-gray leading-relaxed m-0 pl-4">
                <li><strong>Read More</strong> is on by default; turn it off if you want a clean, self-contained widget.</li>
                <li><strong>Tamil → Explanation</strong> lets you pick the <strong>Urai source</strong> (e.g., பரிமேலழகர்).</li>
                <li><strong>Ticker</strong> options appear only when the <strong>Ticker</strong> layout is selected.</li>
                <li><strong>Font Size</strong> and <strong>Corner Radius</strong> stay in one row on web; scroll horizontally if needed.</li>
                <li>For responsive embeds, set <code className="text-xs bg-gold/10 px-1 rounded">width="100%"</code> and keep the height fixed.</li>
              </ul>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
