import { useState } from 'react'

interface AccordionProps {
  title: string
  icon?: string
  defaultOpen?: boolean
  badge?: string
  children: React.ReactNode
}

export default function Accordion({ title, icon, defaultOpen = false, badge, children }: AccordionProps) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="palm-leaf-card overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-5 py-4 bg-transparent border-none cursor-pointer text-left"
      >
        {icon && <span className="text-lg">{icon}</span>}
        <span className="flex-1 font-medium text-dark text-sm">{title}</span>
        {badge && (
          <span className="px-2 py-0.5 text-[10px] font-medium bg-gold/10 text-gold-dark rounded-full">
            {badge}
          </span>
        )}
        <svg
          className={`w-4 h-4 text-gray-light transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div className={`accordion-body ${open ? 'accordion-open' : ''}`}>
        <div className="accordion-inner">
          <div className="px-5 pb-5 pt-0">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
