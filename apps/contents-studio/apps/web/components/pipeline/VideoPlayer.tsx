"use client"

import { useState } from "react"

interface VideoPlayerProps {
  src: string | null
  title?: string
  poster?: string
}

export function VideoPlayer({ src, title, poster }: VideoPlayerProps) {
  const [error, setError] = useState(false)

  if (!src) {
    return (
      <div className="w-full rounded-xl overflow-hidden bg-white/5 border border-white/10">
        <div className="animate-pulse bg-white/5" style={{ aspectRatio: "2.35" }} />
        {title && <p className="px-4 py-2 text-xs text-white/40">{title}</p>}
      </div>
    )
  }

  if (error) {
    return (
      <div
        className="w-full rounded-xl flex items-center justify-center bg-white/5 border border-red-500/30 text-red-400 text-sm"
        style={{ aspectRatio: "2.35" }}
      >
        영상을 불러올 수 없습니다
      </div>
    )
  }

  return (
    <div className="w-full rounded-xl overflow-hidden border border-white/10 bg-black">
      <video
        src={src}
        poster={poster}
        controls
        preload="metadata"
        onError={() => setError(true)}
        className="w-full"
        style={{ aspectRatio: "2.35" }}
      />
      {title && (
        <p className="px-4 py-2 text-xs text-white/60 bg-white/5">{title}</p>
      )}
    </div>
  )
}
