"use client"

import { useEffect, useRef, useState } from "react"

interface AudioWaveformProps {
  src: string | null
  title?: string
  duration?: number
}

const BAR_COUNT = 40

export function AudioWaveform({ src, title, duration }: AudioWaveformProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)
  const [bars] = useState(() =>
    Array.from({ length: BAR_COUNT }, () => 20 + Math.random() * 60)
  )

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    const onEnded = () => setPlaying(false)
    audio.addEventListener("ended", onEnded)
    return () => audio.removeEventListener("ended", onEnded)
  }, [])

  const toggle = () => {
    const audio = audioRef.current
    if (!audio) return
    if (playing) { audio.pause(); setPlaying(false) }
    else { audio.play(); setPlaying(true) }
  }

  const fmt = (s?: number) => s ? `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}` : "--:--"

  if (!src) {
    return (
      <div className="w-full rounded-xl bg-white/5 border border-white/10 p-4">
        <div className="animate-pulse h-16 bg-white/5 rounded-lg" />
        {title && <p className="mt-2 text-xs text-white/40">{title}</p>}
      </div>
    )
  }

  return (
    <div className="w-full rounded-xl bg-white/5 border border-white/10 p-4">
      <audio ref={audioRef} src={src} preload="metadata" />
      <div className="flex items-center gap-3">
        <button
          onClick={toggle}
          className="shrink-0 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
        >
          {playing ? "⏸" : "▶"}
        </button>
        <div className="flex-1 flex items-end gap-[2px] h-12">
          {bars.map((h, i) => (
            <div
              key={i}
              className="flex-1 rounded-sm bg-white/30 origin-bottom"
              style={{
                height: `${h}%`,
                animation: playing ? `pulse 0.${(i % 5) + 3}s ease-in-out infinite alternate` : "none",
              }}
            />
          ))}
        </div>
        <span className="shrink-0 text-xs text-white/40 tabular-nums">{fmt(duration)}</span>
      </div>
      {title && <p className="mt-2 text-xs text-white/60">{title}</p>}
    </div>
  )
}
