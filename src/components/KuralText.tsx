import { useRef, useEffect, useState } from 'react'

interface KuralTextProps {
  tamil: string
  baseSizePx?: number
  minSizePx?: number
  lineHeight?: number
  className?: string
}

export default function KuralText({
  tamil,
  baseSizePx = 28,
  minSizePx = 12,
  lineHeight = 1.7,
  className = '',
}: KuralTextProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [fontSize, setFontSize] = useState(baseSizePx)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const fit = () => {
      const availableWidth = container.clientWidth
      if (availableWidth === 0) return

      const lines = container.querySelectorAll<HTMLElement>('.kural-line')
      if (lines.length === 0) return

      let size = baseSizePx
      container.style.fontSize = `${size}px`

      const fitsAllLines = () => {
        for (const line of lines) {
          if (line.scrollWidth > availableWidth + 1) return false
        }
        return true
      }

      while (!fitsAllLines() && size > minSizePx) {
        size -= 1
        container.style.fontSize = `${size}px`
      }

      setFontSize(size)
    }

    // Initial fit
    const raf = requestAnimationFrame(fit)

    // Re-fit when any font finishes loading (catches Tamil font on-demand load)
    const onFontLoad = () => requestAnimationFrame(fit)
    document.fonts.addEventListener('loadingdone', onFontLoad)

    // ResizeObserver catches container width changes (layout shifts, orientation changes)
    const ro = new ResizeObserver(fit)
    ro.observe(container)

    return () => {
      cancelAnimationFrame(raf)
      document.fonts.removeEventListener('loadingdone', onFontLoad)
      ro.disconnect()
    }
  }, [tamil, baseSizePx, minSizePx])

  // Split each kural line into 4+3 word sub-lines for mobile readability
  const splitLine = (line: string) => {
    const words = line.trim().split(/\s+/)
    if (words.length <= 4) return [line]
    return [words.slice(0, 4).join(' '), words.slice(4).join(' ')]
  }

  return (
    <div
      ref={containerRef}
      className={`font-tamil font-semibold text-dark ${className}`}
      style={{ fontSize: `${fontSize}px`, lineHeight }}
    >
      {tamil.split('\n').map((line, i) => {
        const parts = splitLine(line)
        return (
          <div key={i} className="kural-line-group">
            {parts.map((part, j) => (
              <div key={j} className="kural-line" style={{ whiteSpace: 'nowrap' }}>{part}</div>
            ))}
          </div>
        )
      })}
    </div>
  )
}
