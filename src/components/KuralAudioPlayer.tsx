import { useEffect, useMemo, useRef, useState, type ChangeEvent, type MouseEvent, type SyntheticEvent } from 'react'
import { useLanguage } from '../contexts/LanguageContext'

interface KuralAudioPlayerProps {
  audioPath?: string
  audioWithPorulPath?: string
  className?: string
  compact?: boolean
  stopNavigation?: boolean
}

const formatTime = (seconds: number) => {
  if (!Number.isFinite(seconds) || seconds < 0) return '00:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

const BASE = import.meta.env.BASE_URL

const resolveAudioPath = (rawPath?: string) => {
  if (!rawPath) return ''
  const path = rawPath.trim()
  if (!path) return ''
  if (/^(https?:\/\/|data:|blob:|\/)/i.test(path)) return path
  return `${BASE}${path.replace(/^\.?\//, '')}`
}

export default function KuralAudioPlayer({
  audioPath,
  audioWithPorulPath,
  className = '',
  compact = false,
  stopNavigation = false,
}: KuralAudioPlayerProps) {
  const { t } = useLanguage()
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [hasError, setHasError] = useState(false)
  const [readingMode, setReadingMode] = useState<'kuralOnly' | 'kuralWithPorul'>('kuralOnly')
  const [playbackRate, setPlaybackRate] = useState(1)
  const [repeatEnabled, setRepeatEnabled] = useState(false)

  const baseSource = useMemo(() => resolveAudioPath(audioPath), [audioPath])
  const porulSource = useMemo(() => resolveAudioPath(audioWithPorulPath), [audioWithPorulPath])
  const hasModeToggle = !!baseSource && !!porulSource
  const source = hasModeToggle && readingMode === 'kuralWithPorul' ? porulSource : baseSource
  const speedSteps = [0.75, 1, 1.25, 1.5, 1.75, 2]

  useEffect(() => {
    if (!hasModeToggle && readingMode !== 'kuralOnly') {
      setReadingMode('kuralOnly')
    }
  }, [hasModeToggle, readingMode])

  const trapEvent = (event: SyntheticEvent) => {
    if (!stopNavigation) return
    event.preventDefault()
    event.stopPropagation()
  }

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.pause()
    audio.currentTime = 0
    setIsPlaying(false)
    setCurrentTime(0)
    setDuration(0)
    setHasError(false)
  }, [source])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.playbackRate = playbackRate
    audio.loop = repeatEnabled
  }, [playbackRate, repeatEnabled, source])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !source) return

    const onLoadedMetadata = () => {
      setDuration(Number.isFinite(audio.duration) ? audio.duration : 0)
    }
    const onTimeUpdate = () => setCurrentTime(audio.currentTime || 0)
    const onPlay = () => setIsPlaying(true)
    const onPause = () => setIsPlaying(false)
    const onEnded = () => setIsPlaying(false)
    const onError = () => {
      setHasError(true)
      setIsPlaying(false)
    }

    audio.addEventListener('loadedmetadata', onLoadedMetadata)
    audio.addEventListener('timeupdate', onTimeUpdate)
    audio.addEventListener('play', onPlay)
    audio.addEventListener('pause', onPause)
    audio.addEventListener('ended', onEnded)
    audio.addEventListener('error', onError)

    return () => {
      audio.removeEventListener('loadedmetadata', onLoadedMetadata)
      audio.removeEventListener('timeupdate', onTimeUpdate)
      audio.removeEventListener('play', onPlay)
      audio.removeEventListener('pause', onPause)
      audio.removeEventListener('ended', onEnded)
      audio.removeEventListener('error', onError)
    }
  }, [source])

  const togglePlayback = async (event: MouseEvent<HTMLButtonElement>) => {
    trapEvent(event)
    if (!source || hasError) return
    const audio = audioRef.current
    if (!audio) return

    try {
      if (audio.paused) {
        await audio.play()
      } else {
        audio.pause()
      }
    } catch {
      setHasError(true)
      setIsPlaying(false)
    }
  }

  const handleSeek = (event: ChangeEvent<HTMLInputElement>) => {
    trapEvent(event)
    const audio = audioRef.current
    if (!audio || !source || hasError) return
    const nextTime = Number(event.target.value)
    audio.currentTime = nextTime
    setCurrentTime(nextTime)
  }

  const adjustPlaybackRate = (event: MouseEvent<HTMLButtonElement>, step: -1 | 1) => {
    trapEvent(event)
    setPlaybackRate(prev => {
      const currentIndex = speedSteps.reduce((best, value, idx) => {
        const bestDiff = Math.abs(speedSteps[best] - prev)
        const currentDiff = Math.abs(value - prev)
        return currentDiff < bestDiff ? idx : best
      }, 0)
      const nextIndex = Math.min(speedSteps.length - 1, Math.max(0, currentIndex + step))
      return speedSteps[nextIndex]
    })
  }

  const toggleRepeat = (event: ChangeEvent<HTMLInputElement>) => {
    trapEvent(event)
    setRepeatEnabled(event.target.checked)
  }

  const containerClass = compact
    ? `audio-shell rounded-xl border border-gold/25 bg-gradient-to-br from-[#FFF9EF] via-white to-[#F5EBD2] px-3 py-2.5 shadow-[0_6px_20px_-18px_rgba(90,70,20,0.55)] ${className}`
    : `audio-shell rounded-2xl border border-gold/30 bg-gradient-to-br from-[#FFF9EF] via-[#FFFEFB] to-[#F4E8CA] px-3.5 py-3 shadow-[0_14px_34px_-24px_rgba(90,70,20,0.58)] ${className}`

  if (!source) {
    return (
      <div className={containerClass} onClick={trapEvent}>
        <div className="rounded-xl border border-gold/20 bg-white/75 px-3 py-2.5 flex items-center gap-2 text-xs text-gray-light">
          <span className="text-base">🔇</span>
          <span className="font-medium">{t('audioUnavailable')}</span>
        </div>
      </div>
    )
  }

  if (hasError) {
    return (
      <div className={containerClass} onClick={trapEvent}>
        <div className="rounded-xl border border-terracotta/25 bg-white/75 px-3 py-2.5 flex items-center gap-2 text-xs text-terracotta">
          <span className="text-base">⚠️</span>
          <span className="font-medium">{t('audioLoadError')}</span>
        </div>
      </div>
    )
  }

  return (
    <div className={containerClass} onClick={trapEvent}>
      <audio ref={audioRef} src={source} preload="metadata" />

      <div className="flex items-center justify-between mb-2">
        <span className={`${compact ? 'text-[11px]' : 'text-xs'} inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/85 border border-gold/25 text-gold-dark font-semibold`}>
          <span className="text-sm">🔊</span>
          {t('listenKural')}
        </span>
        <span className={`${compact ? 'text-[10px]' : 'text-[11px]'} text-gray tabular-nums font-medium`}>
          {formatTime(currentTime)} / {duration > 0 ? formatTime(duration) : '--:--'}
        </span>
      </div>

      <div className="flex items-center gap-2.5">
        <button
          onClick={togglePlayback}
          className={`audio-play-btn w-10 h-10 rounded-full bg-gradient-to-br from-gold/30 to-gold/15 border border-gold/35 text-gold-dark hover:from-gold/45 hover:to-gold/25 transition-all duration-300 flex items-center justify-center cursor-pointer shadow-[0_8px_20px_-14px_rgba(146,108,24,0.8)] hover:shadow-[0_14px_26px_-16px_rgba(146,108,24,0.9)] ${isPlaying ? 'audio-play-btn-active' : ''}`}
          aria-label={isPlaying ? t('pauseAudio') : t('playAudio')}
          title={isPlaying ? t('pauseAudio') : t('playAudio')}
        >
          {isPlaying ? (
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M7 5h4v14H7zM13 5h4v14h-4z" />
            </svg>
          ) : (
            <svg className="w-4 h-4 ml-0.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>

        <div className="min-w-0 flex-1 rounded-xl border border-gold/20 bg-white/75 px-2.5 py-1.5">
          <input
            type="range"
            min={0}
            max={duration || 0}
            value={Math.min(currentTime, duration || 0)}
            onChange={handleSeek}
            className="audio-progress w-full h-2 cursor-pointer"
            aria-label={t('listenKural')}
          />
        </div>
      </div>

      <div className={`mt-2.5 ${compact ? 'space-y-2' : 'space-y-2.5'}`}>
        {hasModeToggle && (
          <div className="rounded-xl border border-gold/20 bg-white/75 px-3 py-2">
            <span className="text-[11px] text-gray-light font-semibold uppercase tracking-wide">{t('readMode')}</span>
            <div className="mt-1.5 flex items-center gap-2 flex-wrap">
              <button
                onClick={(event) => { trapEvent(event); setReadingMode('kuralOnly') }}
                className={`px-3 py-1 rounded-lg text-[11px] border transition-all duration-300 cursor-pointer ${
                  readingMode === 'kuralOnly'
                    ? 'bg-gradient-to-br from-gold/30 to-gold/15 border-gold/45 text-gold-dark shadow-[0_6px_16px_-12px_rgba(146,108,24,0.8)]'
                    : 'bg-white border-gray-light/30 text-gray hover:border-gold/35 hover:bg-gold/5'
                }`}
              >
                {t('readKuralOnly')}
              </button>
              <button
                onClick={(event) => { trapEvent(event); setReadingMode('kuralWithPorul') }}
                className={`px-3 py-1 rounded-lg text-[11px] border transition-all duration-300 cursor-pointer ${
                  readingMode === 'kuralWithPorul'
                    ? 'bg-gradient-to-br from-gold/30 to-gold/15 border-gold/45 text-gold-dark shadow-[0_6px_16px_-12px_rgba(146,108,24,0.8)]'
                    : 'bg-white border-gray-light/30 text-gray hover:border-gold/35 hover:bg-gold/5'
                }`}
              >
                {t('readKuralWithPorul')}
              </button>
            </div>
          </div>
        )}

        <div className="rounded-xl border border-gold/20 bg-white/75 px-3 py-2">
          <div className="flex items-center justify-between gap-2.5">
            <span className="text-[11px] text-gray-light font-semibold uppercase tracking-wide">{t('playbackSpeed')}</span>
            <div className="flex items-center gap-2.5">
              <button
                onClick={(event) => adjustPlaybackRate(event, -1)}
                className="w-7 h-7 rounded-lg border border-gray-light/35 bg-white text-dark hover:border-gold/35 hover:bg-gold/5 transition-colors cursor-pointer text-sm leading-none"
                aria-label={t('decrease')}
                title={t('decrease')}
              >
                -
              </button>
              <span className="text-xs font-semibold text-dark min-w-[48px] text-center px-2 py-1 rounded-md bg-gold/10 border border-gold/20">
                {playbackRate.toFixed(2)}x
              </span>
              <button
                onClick={(event) => adjustPlaybackRate(event, 1)}
                className="w-7 h-7 rounded-lg border border-gray-light/35 bg-white text-dark hover:border-gold/35 hover:bg-gold/5 transition-colors cursor-pointer text-sm leading-none"
                aria-label={t('increase')}
                title={t('increase')}
              >
                +
              </button>
            </div>
          </div>
        </div>

        <label className="inline-flex items-center gap-2.5 text-[11px] text-dark cursor-pointer select-none rounded-lg border border-gold/20 bg-white/75 px-3 py-1.5">
          <input
            type="checkbox"
            checked={repeatEnabled}
            onChange={toggleRepeat}
            className="accent-gold-dark"
          />
          <span className="font-medium">{t('repeatAudio')}</span>
        </label>
      </div>
    </div>
  )
}
