import React from 'react'

function Skeleton({ className = '' }) {
  return (
    <div className={`bg-[#1c2240] rounded animate-pulse ${className}`} />
  )
}

export default function SkeletonLoader() {
  return (
    <div className="space-y-4 animate-fade-in">
      {/* Snapshot skeleton */}
      <div className="card space-y-3">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/6" />
      </div>

      {/* Score skeleton */}
      <div className="card space-y-4">
        <Skeleton className="h-3 w-36" />
        <div className="flex items-center gap-6">
          <Skeleton className="w-32 h-32 rounded-full flex-shrink-0" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-3 w-48" />
            <Skeleton className="h-3 w-40" />
          </div>
        </div>
        <div className="space-y-3 pt-2 border-t border-[#1c2240]">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="space-y-1.5">
              <div className="flex justify-between">
                <Skeleton className="h-3 w-28" />
                <Skeleton className="h-3 w-8" />
              </div>
              <Skeleton className="h-1.5 w-full rounded-full" />
              <Skeleton className="h-3 w-3/4" />
            </div>
          ))}
        </div>
      </div>

      {/* Cold email skeleton */}
      <div className="card space-y-3">
        <Skeleton className="h-3 w-40" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <div className="pt-1 space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
        <div className="pt-1 space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/6" />
        </div>
      </div>

      {/* Talk track skeleton */}
      <div className="card space-y-4">
        <Skeleton className="h-3 w-36" />
        {[1, 2, 3].map(i => (
          <div key={i} className="flex gap-3 items-start">
            <Skeleton className="w-5 h-5 rounded-full flex-shrink-0" />
            <Skeleton className="h-4 flex-1" />
          </div>
        ))}
      </div>
    </div>
  )
}
