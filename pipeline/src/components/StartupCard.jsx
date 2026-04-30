import React, { useState } from 'react'
import OutreachPanel from './OutreachPanel.jsx'

const STAGE_COLORS = {
  'Pre-seed': 'bg-violet-500/15 text-violet-400 border-violet-500/25',
  'Seed': 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
}

function ScoreBadge({ score }) {
  const color =
    score >= 75 ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/25' :
    score >= 55 ? 'text-blue-400 bg-blue-500/10 border-blue-500/25' :
    score >= 35 ? 'text-amber-400 bg-amber-500/10 border-amber-500/25' :
    'text-red-400 bg-red-500/10 border-red-500/25'

  const label =
    score >= 75 ? 'Strong fit' :
    score >= 55 ? 'Good fit' :
    score >= 35 ? 'Marginal' : 'Weak fit'

  return (
    <div className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${color}`}>
      <span className="text-[10px]">●</span>
      <span>{score}</span>
      <span className="font-normal opacity-75">{label}</span>
    </div>
  )
}

export default function StartupCard({ company }) {
  const [showOutreach, setShowOutreach] = useState(false)
  const [prospectName, setProspectName] = useState('')
  const [prospectTitle, setProspectTitle] = useState('')
  const [outreach, setOutreach] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [inputMode, setInputMode] = useState(false)

  async function handleGenerate() {
    if (!prospectName.trim()) return
    setLoading(true)
    setError(null)
    setOutreach(null)

    try {
      const res = await fetch('/api/generate-outreach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company, prospectName, prospectTitle }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to generate outreach')
      setOutreach(data)
      setInputMode(false)
      setShowOutreach(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function handleOpenOutreach() {
    if (outreach) {
      setShowOutreach(true)
    } else {
      setInputMode(true)
    }
  }

  const stageClass = STAGE_COLORS[company.stage] || 'bg-slate-500/15 text-slate-400 border-slate-500/25'

  return (
    <>
      <div className="card flex flex-col gap-4 hover:border-[#2a3260] transition-colors duration-200 animate-slide-up">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-white text-base leading-tight truncate">{company.name}</h3>
            <p className="text-xs text-slate-500 mt-0.5">{company.industry} · {company.location}</p>
          </div>
          <ScoreBadge score={company.icpScore} />
        </div>

        {/* Description */}
        <p className="text-sm text-slate-400 leading-relaxed line-clamp-2">{company.description}</p>

        {/* Funding + date */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${stageClass}`}>
            {company.stage}
          </span>
          <span className="text-xs text-slate-300 font-medium">{company.amount}</span>
          {company.fundedDate && company.fundedDate !== 'Recent' && (
            <span className="text-xs text-slate-600">{company.fundedDate}</span>
          )}
        </div>

        {/* Why Deel */}
        <div className="bg-blue-600/5 border border-blue-500/15 rounded-lg px-3 py-2">
          <p className="text-xs text-blue-300/80 leading-relaxed">
            <span className="font-semibold text-blue-400">Deel angle: </span>
            {company.whyDeel}
          </p>
        </div>

        {/* Prospect input or Generate button */}
        {inputMode ? (
          <div className="space-y-2 pt-1">
            <input
              type="text"
              placeholder="Prospect name *"
              value={prospectName}
              onChange={e => setProspectName(e.target.value)}
              className="input-field text-xs py-2"
              autoFocus
            />
            <input
              type="text"
              placeholder="Title (optional)"
              value={prospectTitle}
              onChange={e => setProspectTitle(e.target.value)}
              className="input-field text-xs py-2"
            />
            {error && <p className="text-xs text-red-400">{error}</p>}
            <div className="flex gap-2">
              <button
                onClick={handleGenerate}
                disabled={!prospectName.trim() || loading}
                className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold py-2 px-3 rounded-lg transition-colors flex items-center justify-center gap-1.5"
              >
                {loading ? (
                  <>
                    <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    Writing...
                  </>
                ) : 'Generate Outreach'}
              </button>
              <button
                onClick={() => { setInputMode(false); setError(null) }}
                className="text-xs text-slate-500 hover:text-slate-300 px-3 py-2 rounded-lg hover:bg-[#1c2240] transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={handleOpenOutreach}
            className="w-full text-xs font-semibold py-2 px-3 rounded-lg border border-[#1c2240] text-slate-400 hover:text-white hover:border-blue-500/50 hover:bg-blue-600/5 transition-all flex items-center justify-center gap-1.5 mt-auto"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
            </svg>
            {outreach ? 'View Outreach' : 'Generate Outreach'}
          </button>
        )}
      </div>

      {showOutreach && outreach && (
        <OutreachPanel
          company={company}
          prospectName={prospectName}
          outreach={outreach}
          onClose={() => setShowOutreach(false)}
          onRegenerate={() => { setOutreach(null); setShowOutreach(false); setInputMode(true) }}
        />
      )}
    </>
  )
}
