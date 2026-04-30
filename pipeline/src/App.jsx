import React, { useState } from 'react'
import ScoreGauge from './components/ScoreGauge.jsx'
import { SnapshotCard, ColdEmailCard, TalkTrackCard } from './components/ResultCard.jsx'
import SkeletonLoader from './components/SkeletonLoader.jsx'

function LightningIcon({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M13 2L4.5 13.5H11L10 22L20.5 10H14L13 2Z" />
    </svg>
  )
}

function InputField({ label, id, type = 'text', placeholder, value, onChange, required }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-xs font-medium text-slate-400 tracking-wide">
        {label} {required && <span className="text-blue-500">*</span>}
      </label>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="input-field"
        autoComplete="off"
      />
    </div>
  )
}

function ErrorBanner({ message, onDismiss }) {
  return (
    <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-sm text-red-400 animate-fade-in">
      <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span className="flex-1">{message}</span>
      <button onClick={onDismiss} className="text-red-400 hover:text-red-300 flex-shrink-0">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center px-8 space-y-4">
      <div className="w-16 h-16 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center">
        <LightningIcon className="w-8 h-8 text-blue-500 opacity-60" />
      </div>
      <div>
        <h3 className="text-slate-300 font-semibold mb-1">Ready to prospect</h3>
        <p className="text-sm text-slate-500 max-w-xs leading-relaxed">
          Enter a company and prospect name on the left to generate a full intelligence report.
        </p>
      </div>
      <div className="flex flex-wrap gap-2 justify-center pt-2">
        {['Company Snapshot', 'ICP Score', 'Cold Email', 'Talk Track'].map(tag => (
          <span key={tag} className="text-xs px-2.5 py-1 rounded-full bg-[#161b35] border border-[#1c2240] text-slate-500">
            {tag}
          </span>
        ))}
      </div>
    </div>
  )
}

export default function App() {
  const [form, setForm] = useState({
    companyName: '',
    websiteUrl: '',
    prospectName: '',
    prospectTitle: '',
  })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  function handleChange(field) {
    return (e) => setForm(prev => ({ ...prev, [field]: e.target.value }))
  }

  async function handleAnalyze(e) {
    e.preventDefault()
    if (!form.companyName.trim() || !form.prospectName.trim()) return

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || `Server error ${res.status}`)
      }

      setResult(data)
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function handleReset() {
    setResult(null)
    setError(null)
    setForm({ companyName: '', websiteUrl: '', prospectName: '', prospectTitle: '' })
  }

  const canSubmit = form.companyName.trim() && form.prospectName.trim() && !loading

  return (
    <div className="min-h-screen bg-[#0d0f1a]">
      {/* Header */}
      <header className="border-b border-[#1c2240] bg-[#0d0f1a]/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
              <LightningIcon className="w-4 h-4 text-blue-400" />
            </div>
            <span className="font-bold text-white tracking-tight text-lg">Pipeline</span>
            <span className="hidden sm:block text-[10px] font-medium px-2 py-0.5 rounded-full bg-blue-600/15 border border-blue-500/25 text-blue-400 ml-1">
              SDR Intelligence
            </span>
          </div>
          <div className="text-xs text-slate-600">
            Powered by Claude
          </div>
        </div>
      </header>

      {/* Main layout */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6 items-start">

          {/* Left panel — Input */}
          <div className="space-y-4">
            <div className="card">
              <div className="mb-5">
                <h2 className="text-sm font-semibold text-white mb-1">Prospect Details</h2>
                <p className="text-xs text-slate-500">Fill in what you know and Pipeline does the rest.</p>
              </div>

              <form onSubmit={handleAnalyze} className="space-y-4">
                <InputField
                  label="Company Name"
                  id="companyName"
                  placeholder="Acme Corp"
                  value={form.companyName}
                  onChange={handleChange('companyName')}
                  required
                />
                <InputField
                  label="Website URL"
                  id="websiteUrl"
                  type="url"
                  placeholder="https://acme.com"
                  value={form.websiteUrl}
                  onChange={handleChange('websiteUrl')}
                />
                <InputField
                  label="Prospect Name"
                  id="prospectName"
                  placeholder="Jane Smith"
                  value={form.prospectName}
                  onChange={handleChange('prospectName')}
                  required
                />
                <InputField
                  label="Prospect Title"
                  id="prospectTitle"
                  placeholder="VP of Sales"
                  value={form.prospectTitle}
                  onChange={handleChange('prospectTitle')}
                />

                <div className="pt-1 space-y-2">
                  <button type="submit" disabled={!canSubmit} className="btn-primary">
                    {loading ? (
                      <>
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <LightningIcon className="w-4 h-4" />
                        Analyze Prospect
                      </>
                    )}
                  </button>

                  {result && (
                    <button
                      type="button"
                      onClick={handleReset}
                      className="w-full text-xs text-slate-500 hover:text-slate-300 transition-colors py-1.5"
                    >
                      Clear &amp; start over
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Tips card */}
            <div className="card bg-blue-600/5 border-blue-500/15">
              <p className="text-xs font-semibold text-blue-400 mb-2 uppercase tracking-wider">Pro Tips</p>
              <ul className="space-y-1.5 text-xs text-slate-500 leading-relaxed">
                <li className="flex gap-2"><span className="text-blue-500 flex-shrink-0">→</span>Adding the website URL improves accuracy significantly</li>
                <li className="flex gap-2"><span className="text-blue-500 flex-shrink-0">→</span>Include the prospect's title for a more tailored email</li>
                <li className="flex gap-2"><span className="text-blue-500 flex-shrink-0">→</span>Scores above 70 are worth prioritizing in your sequence</li>
              </ul>
            </div>
          </div>

          {/* Right panel — Results */}
          <div className="min-h-[400px]">
            {error && (
              <div className="mb-4">
                <ErrorBanner message={error} onDismiss={() => setError(null)} />
              </div>
            )}

            {loading && <SkeletonLoader />}

            {!loading && !result && !error && <EmptyState />}

            {!loading && result && (
              <div className="space-y-4">
                <SnapshotCard snapshot={result.snapshot} />
                <ScoreGauge score={result.icpScore} breakdown={result.icpBreakdown} />
                <ColdEmailCard coldEmail={result.coldEmail} />
                <TalkTrackCard talkTrack={result.talkTrack} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
