import { useEffect, useRef, useState, type ReactNode } from 'react'

interface RevealSectionProps {
  children: ReactNode
  className?: string
  delayMs?: number
}

export default function RevealSection({ children, className = '', delayMs = 0 }: RevealSectionProps) {
  const sectionRef = useRef<HTMLElement | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const element = sectionRef.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        setIsVisible(true)
        observer.disconnect()
      },
      {
        threshold: 0.14,
        rootMargin: '0px 0px -10% 0px',
      }
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  return (
    <section
      ref={sectionRef}
      className={`reveal-section ${isVisible ? 'is-visible' : ''} ${className}`.trim()}
      style={delayMs > 0 ? { transitionDelay: `${delayMs}ms` } : undefined}
    >
      {children}
    </section>
  )
}
