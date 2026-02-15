import { useRef, useEffect, useState } from 'react'

interface KuralTextProps {
  tamil: string
  baseSizePx?: number
  className?: string
}

export default function KuralText({ tamil, baseSizePx = 28, className = '' }: KuralTextProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [fontSize, setFontSize] = useState(baseSizePx)
  const [allowWrap, setAllowWrap] = useState(false)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const fit = () => {
      const availableWidth = container.clientWidth
      if (availableWidth === 0) return

      // Reset to base size and nowrap for measurement
      let size = baseSizePx
      container.style.fontSize = `${size}px`

      // Shrink until text fits or we hit minimum
      while (container.scrollWidth > availableWidth + 1 && size > 14) {
        size -= 1
        container.style.fontSize = `${size}px`
      }

      // If still overflowing at 14px, allow wrapping as a fallback
      const stillOverflows = container.scrollWidth > availableWidth + 1
      setAllowWrap(stillOverflows)
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
      className={`font-tamil font-semibold leading-loose text-dark overflow-hidden ${className}`}
      style={{ fontSize: `${fontSize}px` }}
    >
      {tamil.split('\n').map((line, i) => (
        <div key={i} style={{ whiteSpace: allowWrap ? 'normal' : 'nowrap' }}>{line}</div>
      ))}
    </div>
  )
}
