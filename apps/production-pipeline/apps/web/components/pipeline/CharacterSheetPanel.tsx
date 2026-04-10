"use client"

import Image from "next/image"
import { useCallback, useEffect, useState } from "react"
import { fetchAPI } from "../../lib/api"

interface Character {
  name: string
  age: string | null
  gender: string | null
  physical_description: string | null
  wardrobe: string | null
  reference_actor: string | null
  expression: string | null
  image_url: string | null
}

interface CastingDirectorResponse {
  status: string
  characters: Character[]
}

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="animate-pulse rounded-xl border border-gray-800 bg-gray-900">
          <div className="h-48 rounded-t-xl bg-gray-800" />
          <div className="space-y-2 p-4">
            <div className="h-4 w-2/3 rounded bg-gray-800" />
            <div className="h-3 w-1/2 rounded bg-gray-800" />
            <div className="h-3 w-full rounded bg-gray-800" />
            <div className="h-3 w-3/4 rounded bg-gray-800" />
          </div>
        </div>
      ))}
    </div>
  )
}

function InitialsPlaceholder({ name }: { name: string }) {
  const initials = name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className="flex h-48 items-center justify-center rounded-t-xl bg-gradient-to-br from-indigo-900/60 to-purple-900/60">
      <span className="text-4xl font-bold text-white/40">{initials}</span>
    </div>
  )
}

function CharacterCard({ character }: { character: Character }) {
  const meta = [character.age, character.gender].filter(Boolean).join(" / ")

  return (
    <div className="overflow-hidden rounded-xl border border-gray-800 bg-gray-900 transition-colors hover:border-gray-700">
      {character.image_url ? (
        <div className="relative h-48 w-full">
          <Image
            src={character.image_url}
            alt={character.name}
            fill
            className="rounded-t-xl object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        </div>
      ) : (
        <InitialsPlaceholder name={character.name} />
      )}

      <div className="p-4">
        <h3 className="text-sm font-semibold text-white">{character.name}</h3>
        {meta && <p className="mt-0.5 text-xs text-gray-500">{meta}</p>}

        {character.physical_description && (
          <p className="mt-2 text-xs leading-relaxed text-gray-400">{character.physical_description}</p>
        )}

        <div className="mt-3 flex flex-wrap gap-1.5">
          {character.wardrobe && (
            <span className="rounded bg-purple-500/15 px-2 py-0.5 text-[10px] text-purple-400">
              {character.wardrobe}
            </span>
          )}
          {character.reference_actor && (
            <span className="rounded bg-blue-500/15 px-2 py-0.5 text-[10px] text-blue-400">
              Ref: {character.reference_actor}
            </span>
          )}
          {character.expression && (
            <span className="rounded bg-amber-500/15 px-2 py-0.5 text-[10px] text-amber-400">
              {character.expression}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

export function CharacterSheetPanel({ projectId }: { projectId: string }) {
  const [characters, setCharacters] = useState<Character[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(() => {
    setLoading(true)
    setError(null)
    fetchAPI<CastingDirectorResponse>(`/api/projects/${projectId}/agents/casting-director`)
      .then((data) => {
        setCharacters(data.characters ?? [])
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false))
  }, [projectId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
      <h2 className="mb-4 text-lg font-semibold">Character Sheets</h2>

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

      {!loading && !error && characters.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-gray-800 bg-gray-950 py-12">
          <span className="mb-2 text-3xl text-gray-700">🎭</span>
          <p className="text-sm text-gray-500">CastingDirector agent has not run yet</p>
        </div>
      )}

      {!loading && !error && characters.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {characters.map((character) => (
            <CharacterCard key={character.name} character={character} />
          ))}
        </div>
      )}
    </div>
  )
}
