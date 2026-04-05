import { useEffect, useRef } from 'react'
import { useSettings, type Theme, type FontSize } from '../contexts/SettingsContext'

const THEMES: { id: Theme; label: string; bg: string; accent: string; text: string; border: string }[] = [
  {
    id: 'classic',
    label: 'Classic',
    bg: '#FDFBF7',
    accent: '#C6A75E',
    text: '#1F2937',
    border: '#D4BA7A',
  },
  {
    id: 'sepia',
    label: 'Sepia',
    bg: '#F2E8D5',
    accent: '#C6A75E',
    text: '#3B2A1A',
    border: '#C6A75E',
  },
  {
    id: 'dark',
    label: 'Dark',
    bg: '#1C1917',
    accent: '#D4BA7A',
    text: '#F5F5F4',
    border: '#3C3330',
  },
  {
    id: 'night',
    label: 'Night',
    bg: '#0F0F1A',
    accent: '#C6A75E',
    text: '#E8E8F0',
    border: '#252540',
  },
]

const FONT_SIZES: { id: FontSize; label: string; display: string }[] = [
  { id: 'small', label: 'Small', display: 'A' },
  { id: 'medium', label: 'Medium', display: 'A' },
  { id: 'large', label: 'Large', display: 'A' },
]

export default function SettingsPanel() {
  const { theme, setTheme, fontSize, setFontSize, settingsOpen: open, closeSettings: onClose } = useSettings()
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('keydown', handleKey)
    document.addEventListener('mousedown', handleClick)
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.removeEventListener('mousedown', handleClick)
    }
  }, [open, onClose])

  // Prevent body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-dark/30 backdrop-blur-sm transition-opacity duration-300 ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Settings"
        className={`fixed top-0 right-0 h-full z-50 w-80 max-w-[90vw] flex flex-col transition-transform duration-300 ease-in-out ${open ? 'translate-x-0' : 'translate-x-full'}`}
        style={{ background: 'var(--color-cream)', borderLeft: '1px solid color-mix(in srgb, var(--color-gold) 25%, transparent)' }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: '1px solid color-mix(in srgb, var(--color-gold) 20%, transparent)' }}
        >
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" style={{ color: 'var(--color-gold)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="font-semibold text-sm" style={{ color: 'var(--color-dark)' }}>Settings</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gold/10 transition-colors bg-transparent border-none cursor-pointer"
            aria-label="Close settings"
          >
            <svg className="w-4 h-4" style={{ color: 'var(--color-gray)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-7">

          {/* Color Theme */}
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: 'var(--color-gold-dark)' }}>
              Color Theme
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {THEMES.map((t) => {
                const active = theme === t.id
                return (
                  <button
                    key={t.id}
                    onClick={() => setTheme(t.id)}
                    className="relative flex flex-col items-start gap-2 p-3 rounded-xl cursor-pointer transition-all duration-200 border-none"
                    style={{
                      background: t.bg,
                      border: active
                        ? `2px solid ${t.accent}`
                        : `2px solid ${t.border}40`,
                      boxShadow: active
                        ? `0 0 0 2px ${t.accent}40`
                        : 'none',
                    }}
                    aria-pressed={active}
                    aria-label={`${t.label} theme`}
                  >
                    {/* Mini preview */}
                    <div className="flex gap-1 w-full">
                      <div className="h-2 flex-1 rounded-sm" style={{ background: t.text, opacity: 0.7 }} />
                      <div className="h-2 w-3 rounded-sm" style={{ background: t.accent }} />
                    </div>
                    <div className="h-1.5 w-3/4 rounded-sm" style={{ background: t.text, opacity: 0.3 }} />
                    <span
                      className="text-xs font-medium mt-0.5"
                      style={{ color: t.text }}
                    >
                      {t.label}
                    </span>
                    {active && (
                      <span
                        className="absolute top-2 right-2 w-4 h-4 rounded-full flex items-center justify-center"
                        style={{ background: t.accent }}
                      >
                        <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </section>

          {/* Divider */}
          <div className="h-px" style={{ background: 'color-mix(in srgb, var(--color-gold) 20%, transparent)' }} />

          {/* Font Size */}
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: 'var(--color-gold-dark)' }}>
              Text Size
            </h3>
            <div className="flex gap-2">
              {FONT_SIZES.map((s, i) => {
                const active = fontSize === s.id
                const textSizes = ['text-sm', 'text-base', 'text-lg']
                return (
                  <button
                    key={s.id}
                    onClick={() => setFontSize(s.id)}
                    className={`flex-1 flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border-none cursor-pointer transition-all duration-200 ${textSizes[i]}`}
                    style={{
                      background: active
                        ? 'color-mix(in srgb, var(--color-gold) 15%, var(--color-cream))'
                        : 'color-mix(in srgb, var(--color-cream-dark) 60%, var(--color-cream))',
                      border: active
                        ? '2px solid var(--color-gold)'
                        : '2px solid color-mix(in srgb, var(--color-gold) 20%, transparent)',
                      color: active ? 'var(--color-gold-dark)' : 'var(--color-gray)',
                      fontWeight: active ? 600 : 400,
                    }}
                    aria-pressed={active}
                    aria-label={`${s.label} text size`}
                  >
                    <span style={{ fontFamily: 'var(--font-inter)', fontWeight: active ? 700 : 400 }}>
                      {s.display}
                    </span>
                    <span className="text-xs" style={{ fontSize: '0.65rem', color: active ? 'var(--color-gold-dark)' : 'var(--color-gray-light)' }}>
                      {s.label}
                    </span>
                  </button>
                )
              })}
            </div>
            <p className="text-xs mt-3" style={{ color: 'var(--color-gray-light)' }}>
              Adjusts text size across the entire app.
            </p>
          </section>

        </div>

        {/* Footer */}
        <div
          className="px-5 py-3"
          style={{ borderTop: '1px solid color-mix(in srgb, var(--color-gold) 15%, transparent)' }}
        >
          <p className="text-xs text-center" style={{ color: 'var(--color-gray-light)' }}>
            Preferences saved automatically
          </p>
        </div>
      </div>
    </>
  )
}
