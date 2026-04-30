import React, { useEffect, useState } from 'react'

const RADIUS = 54
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

function getColor(score) {
  if (score >= 80) return '#10b981'
  if (score >= 60) return '#3b82f6'
  if (score >= 40) return '#f59e0b'
  return '#ef4444'
}

function getLabel(score) {
  if (score >= 80) return 'Strong Fit'
  if (score >= 60) return 'Good Fit'
  if (score >= 40) return 'Marginal'
  return 'Weak Fit'
}

function BreakdownRow({ label, score, maxScore, rationale }) {
  const pct = (score / maxScore) * 100
  const color = getColor((score / maxScore) * 100)
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center text-xs">
        <span className="text-slate-400">{label}</span>
        <span className="font-semibold text-slate-200">{score}/{maxScore}</span>
      </div>
      <div className="h-1.5 bg-[#1c2240] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      <p className="text-xs text-slate-500 leading-relaxed">{rationale}</p>
    </div>
  )
}

export default function ScoreGauge({ score, breakdown }) {
  const [animated, setAnimated] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(score), 100)
    return () => clearTimeout(timer)
  }, [score])

  const offset = CIRCUMFERENCE - (animated / 100) * CIRCUMFERENCE
  const color = getColor(score)
  const label = getLabel(score)

  return (
    <div className="card animate-slide-up space-y-5">
      <p className="section-label">ICP Qualification Score</p>

      <div className="flex items-center gap-6">
        <div className="relative flex-shrink-0">
          <svg width="128" height="128" viewBox="0 0 128 128" className="-rotate-90">
            <circle
              cx="64" cy="64" r={RADIUS}
              fill="none"
              stroke="#1c2240"
              strokeWidth="10"
            />
            <circle
              cx="64" cy="64" r={RADIUS}
              fill="none"
              stroke={color}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={offset}
              style={{ transition: 'stroke-dashoffset 1s ease-out, stroke 0.5s ease' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center rotate-0">
            <span className="text-3xl font-bold text-white leading-none">{score}</span>
            <span className="text-[10px] text-slate-400 mt-0.5">/ 100</span>
          </div>
        </div>

        <div>
          <div
            className="text-lg font-bold mb-1"
            style={{ color }}
          >
            {label}
          </div>
          <p className="text-xs text-slate-400 leading-relaxed max-w-[160px]">
            Based on size fit, industry alignment, estimated budget, and growth signals.
          </p>
        </div>
      </div>

      {breakdown && (
        <div className="space-y-4 pt-2 border-t border-[#1c2240]">
          <BreakdownRow
            label="Company Size Fit"
            score={breakdown.companySizeFit?.score ?? 0}
            maxScore={25}
            rationale={breakdown.companySizeFit?.rationale}
          />
          <BreakdownRow
            label="Industry Fit"
            score={breakdown.industryFit?.score ?? 0}
            maxScore={25}
            rationale={breakdown.industryFit?.rationale}
          />
          <BreakdownRow
            label="Likely Budget"
            score={breakdown.likelyBudget?.score ?? 0}
            maxScore={25}
            rationale={breakdown.likelyBudget?.rationale}
          />
          <BreakdownRow
            label="Growth Signals"
            score={breakdown.growthSignals?.score ?? 0}
            maxScore={25}
            rationale={breakdown.growthSignals?.rationale}
          />
        </div>
      )}
    </div>
  )
}
