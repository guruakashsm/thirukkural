import { useState, useEffect, useRef } from 'react'
import { useLanguage, LANGUAGES } from '../contexts/LanguageContext'

interface LanguageDropdownProps {
  showLabel?: boolean
}

export default function LanguageDropdown({ showLabel = false }: LanguageDropdownProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const { lang, setLang } = useLanguage()

  useEffect(() => {
    if (!open) return
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1.5 rounded-lg hover:bg-gold/10 transition-colors bg-transparent cursor-pointer text-sm text-gray hover:text-gold-dark ${
          showLabel ? 'px-2.5 py-1.5 border border-gold/20' : 'p-2 border-none'
        }`}
        aria-label="Select language"
      >
        <span className="text-base">🌐</span>
        {showLabel && <span className="text-xs font-medium uppercase">{lang}</span>}
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1.5 w-56 bg-white rounded-xl shadow-xl border border-gold/20 py-2 z-50 max-h-80 overflow-y-auto animate-fade-in">
          {LANGUAGES.map(l => (
            <button
              key={l.code}
              onClick={() => { setLang(l.code); setOpen(false) }}
              className={`w-full text-left px-4 py-2 text-sm flex items-center gap-3 transition-colors bg-transparent border-none cursor-pointer ${
                lang === l.code ? 'bg-gold/10 text-gold-dark font-medium' : 'text-gray hover:bg-gold/5 hover:text-gold-dark'
              }`}
            >
              <span className="flex-1">{l.nativeName} <span className="text-gray-light text-xs">{l.englishName}</span></span>
              {lang === l.code && <span className="text-gold">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
