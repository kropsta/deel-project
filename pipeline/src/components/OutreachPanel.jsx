import React, { useState, useEffect } from 'react'

function CopyButton({ text, label = 'Copy' }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      const el = document.createElement('textarea')
      el.value = text
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-blue-400 transition-colors px-2 py-1 rounded hover:bg-[#1c2240]"
    >
      {copied ? (
        <span className="text-emerald-400 flex items-center gap-1">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
          </svg>
          Copied!
        </span>
      ) : (
        <span className="flex items-center gap-1">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2"/>
          </svg>
          {label}
        </span>
      )}
    </button>
  )
}

export default function OutreachPanel({ company, prospectName, outreach, onClose, onRegenerate }) {
  const paragraphs = outreach.coldEmail.split('\n\n').filter(Boolean)
  const talkTrackText = outreach.talkTrack.map((t, i) => `${i + 1}. ${t}`).join('\n')

  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-[#0d0f1a]/80 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-xl bg-[#111527] border border-[#1c2240] rounded-2xl shadow-2xl animate-slide-up overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1c2240]">
          <div>
            <h2 className="font-bold text-white text-sm">{company.name} outreach</h2>
            <p className="text-xs text-slate-500 mt-0.5">For {prospectName}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onRegenerate}
              className="text-xs text-slate-500 hover:text-slate-300 px-2.5 py-1.5 rounded-lg hover:bg-[#1c2240] transition-colors flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
              </svg>
              Regenerate
            </button>
            <button onClick={onClose} className="text-slate-500 hover:text-slate-300 p-1.5 rounded-lg hover:bg-[#1c2240] transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
        </div>

        <div className="p-5 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* Cold email */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="section-label mb-0">Cold Email</p>
              <CopyButton text={paragraphs.join('\n\n')} label="Copy email" />
            </div>
            <div className="bg-[#0d0f1a] rounded-xl border border-[#1c2240] px-4 py-4 space-y-3">
              {paragraphs.map((p, i) => (
                <p key={i} className="text-sm text-slate-300 leading-relaxed">{p}</p>
              ))}
            </div>
          </div>

          {/* Talk track */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="section-label mb-0">Cold Call Talk Track</p>
              <CopyButton text={talkTrackText} label="Copy all" />
            </div>
            <ul className="space-y-2.5">
              {outreach.talkTrack.map((point, i) => (
                <li key={i} className="flex gap-3 items-start bg-[#0d0f1a] rounded-lg border border-[#1c2240] px-4 py-3">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-[10px] font-bold text-blue-400 mt-0.5">
                    {i + 1}
                  </span>
                  <span className="text-sm text-slate-300 leading-relaxed">{point}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
