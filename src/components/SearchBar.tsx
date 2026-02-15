interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  autoFocus?: boolean
}

export default function SearchBar({ value, onChange, placeholder = 'Search kurals...', autoFocus = false }: SearchBarProps) {
  return (
    <div className="relative">
      <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gold/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white/80 border border-gold/20 text-dark placeholder-gray-light text-base outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all shadow-[inset_0_1px_3px_rgba(0,0,0,0.04)]"
        style={{ fontFamily: 'var(--font-inter)' }}
      />
    </div>
  )
}
