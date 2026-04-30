import React, { useState } from 'react'
import StartupCard from './components/StartupCard.jsx'

function LightningIcon({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M13 2L4.5 13.5H11L10 22L20.5 10H14L13 2Z" />
    </svg>
  )
}

const INDUSTRIES = ['All Industries', 'SaaS', 'Fintech', 'HR Tech', 'HealthTech', 'E-commerce', 'AI / ML', 'DevTools', 'Climate Tech', 'EdTech']
const REGIONS = ['All Regions', 'United States', 'Europe', 'Latin America', 'Asia Pacific', 'Africa', 'Middle East']
const DAYS_OPTIONS = [{ label: 'Last 7 days', value: 7 }, { label: 'Last 30 days', value: 30 }, { label: 'Last 90 days', value: 90 }]

function FilterSelect({ value, onChange, options }) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="bg-[#161b35] border border-[#1c2240] rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-blue-500 cursor-pointer appearance-none pr-8 relative"
      style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center', backgroundSize: '16px' }}
    >
      {options.map(opt => (
        <option key={typeof opt === 'string' ? opt : opt.value} value={typeof opt === 'string' ? opt : opt.value}>
          {typeof opt === 'string' ? opt : opt.label}
        </option>
      ))}
    </select>
  )
}

function EmptyState() {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-24 text-center space-y-4">
      <div className="w-16 h-16 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center">
        <LightningIcon className="w-8 h-8 text-blue-500 opacity-60" />
      </div>
      <div>
        <h3 className="text-slate-300 font-semibold mb-1">Find your next prospect</h3>
        <p className="text-sm text-slate-500 max-w-xs leading-relaxed">
          Hit the button to pull recently funded pre-seed and seed startups — scored and ready to work.
        </p>
      </div>
    </div>
  )
}

function LoadingGrid() {
  return (
    <>
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="card animate-pulse space-y-4">
          <div className="flex justify-between items-start">
            <div className="space-y-1.5">
              <div className="h-4 bg-[#1c2240] rounded w-32" />
              <div className="h-3 bg-[#1c2240] rounded w-24" />
            </div>
            <div className="h-6 bg-[#1c2240] rounded-full w-20" />
          </div>
          <div className="space-y-1.5">
            <div className="h-3 bg-[#1c2240] rounded w-full" />
            <div className="h-3 bg-[#1c2240] rounded w-4/5" />
          </div>
          <div className="flex gap-2">
            <div className="h-6 bg-[#1c2240] rounded-full w-16" />
            <div className="h-6 bg-[#1c2240] rounded w-12" />
          </div>
          <div className="h-12 bg-[#1c2240] rounded-lg" />
          <div className="h-8 bg-[#1c2240] rounded-lg" />
        </div>
      ))}
    </>
  )
}

export default function App() {
  const [industry, setIndustry] = useState('All Industries')
  const [region, setRegion] = useState('All Regions')
  const [daysBack, setDaysBack] = useState(30)
  const [loading, setLoading] = useState(false)
  const [startups, setStartups] = useState([])
  const [error, setError] = useState(null)
  const [hasSearched, setHasSearched] = useState(false)

  async function handleFind() {
    setLoading(true)
    setError(null)
    setStartups([])
    setHasSearched(true)

    try {
      const res = await fetch('/api/find-startups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          industry: industry === 'All Industries' ? 'all' : industry,
          region: region === 'All Regions' ? 'all' : region,
          daysBack,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || `Error ${res.status}`)
      setStartups(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const sortedStartups = [...startups].sort((a, b) => b.icpScore - a.icpScore)

  return (
    <div className="min-h-screen bg-[#0d0f1a]">
      {/* Header */}
      <header className="border-b border-[#1c2240] bg-[#0d0f1a]/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
              <LightningIcon className="w-4 h-4 text-blue-400" />
            </div>
            <span className="font-bold text-white tracking-tight text-lg">Pipeline</span>
            <span className="hidden sm:block text-[10px] font-medium px-2 py-0.5 rounded-full bg-blue-600/15 border border-blue-500/25 text-blue-400 ml-1">
              Funded Startup Finder
            </span>
          </div>
          <p className="text-xs text-slate-600">Powered by Deel · Exa · Claude</p>
        </div>
      </header>

      {/* Search bar */}
      <div className="border-b border-[#1c2240] bg-[#111527]">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-wrap items-center gap-3">
          <FilterSelect value={industry} onChange={setIndustry} options={INDUSTRIES} />
          <FilterSelect value={region} onChange={setRegion} options={REGIONS} />
          <FilterSelect value={daysBack} onChange={v => setDaysBack(Number(v))} options={DAYS_OPTIONS} />

          <button
            onClick={handleFind}
            disabled={loading}
            className="ml-auto btn-primary w-auto px-6 py-2 text-sm"
          >
            {loading ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Searching...
              </>
            ) : (
              <>
                <LightningIcon className="w-4 h-4" />
                Find Funded Startups
              </>
            )}
          </button>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {error && (
          <div className="mb-6 flex items-start gap-3 bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-sm text-red-400 animate-fade-in">
            <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <span>{error}</span>
          </div>
        )}

        {!loading && hasSearched && !error && startups.length === 0 && (
          <div className="text-center py-16 text-slate-500 text-sm">
            No pre-seed or seed companies found for this search. Try expanding the date range or changing filters.
          </div>
        )}

        {!loading && startups.length > 0 && (
          <div className="mb-4 flex items-center justify-between">
            <p className="text-xs text-slate-500">
              <span className="text-slate-300 font-semibold">{startups.length}</span> startups found · sorted by ICP fit
            </p>
            <button
              onClick={handleFind}
              className="text-xs text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
              </svg>
              Refresh
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {loading ? (
            <LoadingGrid />
          ) : hasSearched && startups.length > 0 ? (
            sortedStartups.map((company, i) => (
              <StartupCard key={`${company.name}-${i}`} company={company} />
            ))
          ) : !hasSearched ? (
            <EmptyState />
          ) : null}
        </div>
      </div>
    </div>
  )
}
