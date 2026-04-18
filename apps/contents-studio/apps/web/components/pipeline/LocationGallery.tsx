"use client"

import Image from "next/image"
import { useCallback, useEffect, useState } from "react"
import { fetchAPI } from "../../lib/api"

interface Location {
  setting: string
  time_of_day: string
  scene_numbers: number[]
  description: string | null
  image_url: string | null
}

interface LocationScoutResponse {
  status: string
  locations: Location[]
}

const TIME_BADGE: Record<string, { bg: string; text: string }> = {
  DAY: { bg: "bg-amber-500/20", text: "text-amber-400" },
  NIGHT: { bg: "bg-indigo-500/20", text: "text-indigo-400" },
  DAWN: { bg: "bg-purple-500/20", text: "text-purple-400" },
  DUSK: { bg: "bg-orange-500/20", text: "text-orange-400" },
}

const TIME_GRADIENT: Record<string, string> = {
  DAY: "from-amber-900/40 to-yellow-900/20",
  NIGHT: "from-slate-900/60 to-indigo-950/40",
  DAWN: "from-purple-900/40 to-pink-900/20",
  DUSK: "from-orange-900/40 to-red-900/20",
}

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="animate-pulse rounded-xl border border-gray-800 bg-gray-900">
          <div className="h-44 rounded-t-xl bg-gray-800" />
          <div className="space-y-2 p-4">
            <div className="h-4 w-3/4 rounded bg-gray-800" />
            <div className="h-3 w-full rounded bg-gray-800" />
          </div>
        </div>
      ))}
    </div>
  )
}

function LocationCard({ location }: { location: Location }) {
  const tod = location.time_of_day?.toUpperCase() ?? "DAY"
  const badge = TIME_BADGE[tod] ?? { bg: "bg-amber-500/20", text: "text-amber-400" }
  const gradient = TIME_GRADIENT[tod] ?? "from-amber-900/40 to-yellow-900/20"

  return (
    <div className="overflow-hidden rounded-xl border border-gray-800 bg-gray-900 transition-colors hover:border-gray-700">
      {location.image_url ? (
        <div className="relative h-44 w-full">
          <Image
            src={location.image_url}
            alt={location.setting}
            fill
            className="rounded-t-xl object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        </div>
      ) : (
        <div className={`flex h-44 items-center justify-center rounded-t-xl bg-gradient-to-br ${gradient}`}>
          <span className="text-3xl text-white/20">🏔</span>
        </div>
      )}

      <div className="p-4">
        <div className="mb-2 flex items-center gap-2">
          <h3 className="text-sm font-semibold text-white">{location.setting}</h3>
          <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${badge.bg} ${badge.text}`}>
            {tod}
          </span>
        </div>

        {location.description && (
          <p className="mb-3 text-xs leading-relaxed text-gray-400">{location.description}</p>
        )}

        {location.scene_numbers.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {location.scene_numbers.map((num) => (
              <span
                key={num}
                className="rounded bg-blue-500/15 px-1.5 py-0.5 text-[10px] font-medium text-blue-400"
              >
                S#{num}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export function LocationGallery({ projectId }: { projectId: string }) {
  const [locations, setLocations] = useState<Location[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(() => {
    setLoading(true)
    setError(null)
    fetchAPI<LocationScoutResponse>(`/api/projects/${projectId}/agents/location-scout`)
      .then((data) => {
        setLocations(data.locations ?? [])
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false))
  }, [projectId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
      <h2 className="mb-4 text-lg font-semibold">Location Scout</h2>

      {loading && <LoadingSkeleton />}

      {error && (
        <div className="flex items-center justify-between rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3">
          <span className="text-sm text-red-400">{error}</span>
          <button
            onClick={fetchData}
            className="rounded-lg border border-red-500/30 px-3 py-1.5 text-xs text-red-400 transition hover:bg-red-500/10"
          >
            Retry
          </button>
        </div>
      )}

      {!loading && !error && locations.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-gray-800 bg-gray-950 py-12">
          <span className="mb-2 text-3xl text-gray-700">🗺</span>
          <p className="text-sm text-gray-500">LocationScout agent has not run yet</p>
        </div>
      )}

      {!loading && !error && locations.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {locations.map((location) => (
            <LocationCard key={location.setting} location={location} />
          ))}
        </div>
      )}
    </div>
  )
}
