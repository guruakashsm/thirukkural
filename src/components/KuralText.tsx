import { useRef, useEffect, useState } from 'react'

interface KuralTextProps {
  tamil: string
  baseSizePx?: number
  className?: string
}

export default function KuralText({ tamil, baseSizePx = 28, className = '' }: KuralTextProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [fontSize, setFontSize] = useState(baseSizePx)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const fit = () => {
      const availableWidth = container.clientWidth
      if (availableWidth === 0) return

      // Find all line spans inside the container
      const lines = container.querySelectorAll<HTMLElement>('.kural-line')
      if (lines.length === 0) return

      // Reset to base size for measurement
      let size = baseSizePx
      container.style.fontSize = `${size}px`

      // Shrink until every line fits on a single row without wrapping
      const fitsAllLines = () => {
        for (const line of lines) {
          if (line.scrollWidth > availableWidth + 1) return false
        }
        return true
      }

      while (!fitsAllLines() && size > 10) {
        size -= 1
        container.style.fontSize = `${size}px`
      }

      setFontSize(size)
    }

    // Run after a frame so layout is settled
    const raf = requestAnimationFrame(fit)

    // Re-run after Tamil font loads
    document.fonts.ready.then(() => requestAnimationFrame(fit))

    window.addEventListener('resize', fit)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', fit)
    }
  }, [tamil, baseSizePx])

  return (
    <div
      ref={containerRef}
      className={`font-tamil font-semibold leading-loose text-dark ${className}`}
      style={{ fontSize: `${fontSize}px` }}
    >
      {tamil.split('\n').map((line, i) => (
        <div key={i} className="kural-line" style={{ whiteSpace: 'nowrap' }}>{line}</div>
      ))}
    </div>
  )
}
