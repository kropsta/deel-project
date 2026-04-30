import React, { useState } from 'react'

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback for non-secure contexts
      const el = document.createElement('textarea')
      el.value = text
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <button
      onClick={handleCopy}
      title="Copy to clipboard"
      className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-blue-400 transition-colors px-2 py-1 rounded hover:bg-[#1c2240]"
    >
      {copied ? (
        <>
          <CheckIcon />
          <span className="text-emerald-400">Copied!</span>
        </>
      ) : (
        <>
          <ClipboardIcon />
          <span>Copy</span>
        </>
      )}
    </button>
  )
}

function ClipboardIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  )
}

export function SnapshotCard({ snapshot }) {
  return (
    <div className="card animate-slide-up">
      <div className="flex items-center justify-between mb-3">
        <p className="section-label mb-0">Company Snapshot</p>
        <CopyButton text={snapshot} />
      </div>
      <p className="text-sm text-slate-300 leading-relaxed">{snapshot}</p>
    </div>
  )
}

export function ColdEmailCard({ coldEmail }) {
  const paragraphs = coldEmail.split('\n\n').filter(Boolean)
  const plainText = paragraphs.join('\n\n')

  return (
    <div className="card animate-slide-up">
      <div className="flex items-center justify-between mb-3">
        <p className="section-label mb-0">Personalized Cold Email</p>
        <CopyButton text={plainText} />
      </div>
      <div className="space-y-3 text-sm text-slate-300 leading-relaxed">
        {paragraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
    </div>
  )
}

export function TalkTrackCard({ talkTrack }) {
  const fullText = talkTrack.map((t, i) => `${i + 1}. ${t}`).join('\n')

  return (
    <div className="card animate-slide-up">
      <div className="flex items-center justify-between mb-3">
        <p className="section-label mb-0">Cold Call Talk Track</p>
        <CopyButton text={fullText} />
      </div>
      <ul className="space-y-3">
        {talkTrack.map((point, i) => (
          <li key={i} className="flex gap-3 items-start">
            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-[10px] font-bold text-blue-400 mt-0.5">
              {i + 1}
            </span>
            <span className="text-sm text-slate-300 leading-relaxed">{point}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
