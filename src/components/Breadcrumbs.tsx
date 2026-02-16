import { Link } from 'react-router-dom'

interface BreadcrumbItem {
  label: string
  to?: string
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  if (items.length === 0) return null

  return (
    <nav aria-label="Breadcrumb" className="mb-6 animate-fade-in">
      <div className="breadcrumbs-shell">
        <ol className="flex flex-wrap items-center gap-1.5">
        {items.map((item, index) => {
          const isLast = index === items.length - 1
          const chipClass = `breadcrumbs-chip ${isLast ? 'breadcrumbs-chip-current' : 'breadcrumbs-chip-link'}`
          const hasHomeGlyph = index === 0

          return (
            <li key={`${item.label}-${index}`} className="inline-flex items-center gap-1.5">
              {item.to && !isLast ? (
                <Link to={item.to} className={`no-underline ${chipClass}`} aria-label={hasHomeGlyph ? item.label : undefined}>
                  {hasHomeGlyph ? (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1h-2z" />
                    </svg>
                  ) : item.label}
                </Link>
              ) : (
                <span className={chipClass} aria-current={isLast ? 'page' : undefined}>
                  {hasHomeGlyph ? (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1h-2z" />
                    </svg>
                  ) : item.label}
                </span>
              )}
              {!isLast && (
                <span className="breadcrumbs-separator" aria-hidden>
                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.6}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              )}
            </li>
          )
        })}
        </ol>
      </div>
    </nav>
  )
}
