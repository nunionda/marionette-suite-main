/**
 * Skeleton loading primitives for consistent loading states across all pages.
 *
 * Usage:
 *   <SkeletonText lines={3} />
 *   <SkeletonCard />
 *   <SkeletonAgentCard />
 */

interface SkeletonBaseProps {
  className?: string
}

/** Single pulsing block — the primitive all skeletons compose from */
export function SkeletonBlock({ className = "" }: SkeletonBaseProps) {
  return <div className={`animate-pulse rounded bg-gray-800 ${className}`} />
}

/** Multiple lines of text */
export function SkeletonText({ lines = 2, className = "" }: { lines?: number; className?: string }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonBlock
          key={i}
          className={`h-4 ${i === lines - 1 && lines > 1 ? "w-3/4" : "w-full"}`}
        />
      ))}
    </div>
  )
}

/** Generic card outline */
export function SkeletonCard({ className = "" }: SkeletonBaseProps) {
  return (
    <div className={`rounded-xl border border-gray-800 bg-gray-900 p-6 ${className}`}>
      <SkeletonBlock className="mb-4 h-5 w-1/3" />
      <SkeletonText lines={3} />
    </div>
  )
}

/** Matches the AgentCard layout in project detail */
export function SkeletonAgentCard() {
  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
      <div className="mb-2 flex items-center gap-2">
        <SkeletonBlock className="h-5 w-12" />
        <SkeletonBlock className="h-5 w-40" />
      </div>
      <SkeletonText lines={2} className="mb-4" />
      <SkeletonBlock className="h-9 w-36" />
    </div>
  )
}

/** Row in a list/table */
export function SkeletonRow({ className = "" }: SkeletonBaseProps) {
  return (
    <div className={`flex items-center gap-3 rounded-lg border border-gray-800 bg-gray-900/50 px-4 py-2.5 ${className}`}>
      <SkeletonBlock className="h-5 w-20" />
      <SkeletonBlock className="h-4 flex-1" />
      <SkeletonBlock className="h-4 w-24" />
    </div>
  )
}

/** 2-column asset grid thumbnail */
export function SkeletonAssetGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonBlock key={i} className="aspect-video w-full" />
      ))}
    </div>
  )
}
