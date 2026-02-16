import { useEffect, useMemo, useState } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

const DISMISS_KEY = 'pwa-install-dismissed-at'
const DISMISS_DAYS = 7

const isStandaloneMode = () => {
  const standaloneMatch = window.matchMedia('(display-mode: standalone)').matches
  const iosStandalone = 'standalone' in window.navigator && (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  return standaloneMatch || iosStandalone
}

const wasDismissedRecently = () => {
  const saved = localStorage.getItem(DISMISS_KEY)
  if (!saved) return false
  const dismissedAt = Number(saved)
  if (Number.isNaN(dismissedAt)) return false
  const ageMs = Date.now() - dismissedAt
  return ageMs < DISMISS_DAYS * 24 * 60 * 60 * 1000
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [isInstalled, setIsInstalled] = useState(() => isStandaloneMode())

  const blockedByDismiss = useMemo(() => wasDismissedRecently(), [])

  useEffect(() => {
    if (blockedByDismiss || isInstalled) return

    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault()
      setDeferredPrompt(event as BeforeInstallPromptEvent)
      setIsVisible(true)
    }

    const onAppInstalled = () => {
      setIsInstalled(true)
      setIsVisible(false)
      setDeferredPrompt(null)
    }

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt)
    window.addEventListener('appinstalled', onAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt)
      window.removeEventListener('appinstalled', onAppInstalled)
    }
  }, [blockedByDismiss, isInstalled])

  const dismissPrompt = () => {
    localStorage.setItem(DISMISS_KEY, String(Date.now()))
    setIsVisible(false)
    setDeferredPrompt(null)
  }

  const handleInstall = async () => {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    setDeferredPrompt(null)
    setIsVisible(false)

    if (outcome !== 'accepted') {
      localStorage.setItem(DISMISS_KEY, String(Date.now()))
    }
  }

  if (!isVisible || !deferredPrompt || isInstalled || blockedByDismiss) return null

  return (
    <div className="fixed left-1/2 -translate-x-1/2 bottom-4 z-50 w-[calc(100%-1.5rem)] max-w-sm rounded-2xl border border-gold/35 bg-cream/95 backdrop-blur p-3.5 shadow-xl">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 text-gold text-lg">&#10043;</div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-dark leading-snug font-medium">Install this app for daily Kurals!</p>
          <div className="mt-2 flex items-center gap-2">
            <button
              onClick={handleInstall}
              className="px-3 py-1.5 rounded-lg bg-gold text-white border-none cursor-pointer text-xs font-semibold hover:bg-gold-dark transition-colors"
            >
              Install
            </button>
            <button
              onClick={dismissPrompt}
              className="px-2.5 py-1.5 rounded-lg bg-transparent border border-gray-light/35 cursor-pointer text-xs text-gray hover:text-dark hover:border-gray-light transition-colors"
            >
              Not now
            </button>
          </div>
        </div>
        <button
          onClick={dismissPrompt}
          aria-label="Dismiss install prompt"
          className="bg-transparent border-none cursor-pointer text-gray-light hover:text-dark text-sm leading-none p-0.5"
        >
          ×
        </button>
      </div>
    </div>
  )
}
