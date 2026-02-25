import { useState, useEffect, useRef, useCallback } from 'react';
import Head from 'next/head';

const STATUS_OPTIONS = ['Not Contacted', 'Contacted', 'Interested', 'Not Interested', 'Follow Up', 'Closed'];

const STATUS_CLASS = {
  'Not Contacted': 'badge-not-contacted',
  'Contacted': 'badge-contacted',
  'Interested': 'badge-interested',
  'Not Interested': 'badge-not-interested',
  'Follow Up': 'badge-follow-up',
  'Closed': 'badge-closed',
};

function PriorityBadge({ priority }) {
  return (
    <span className={`badge ${priority === 'HIGH' ? 'badge-high' : 'badge-normal'}`}>
      {priority === 'HIGH' ? '⭐ HIGH' : 'Normal'}
    </span>
  );
}

function StatusBadge({ status }) {
  return (
    <span className={`badge ${STATUS_CLASS[status] || 'badge-not-contacted'}`}>
      {status}
    </span>
  );
}

function StatsBar({ leads, lastRun }) {
  const total = leads.length;
  const high = leads.filter(l => l.priority === 'HIGH').length;
  const contacted = leads.filter(l => l.status !== 'Not Contacted').length;
  const lastRunStr = lastRun
    ? new Date(lastRun).toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' })
    : 'Never';
  return (
    <div className="stats-bar">
      <div className="stat-card">
        <div className="stat-label">Total Leads</div>
        <div className="stat-value stat-text">{total}</div>
      </div>
      <div className="stat-card">
        <div className="stat-label">HIGH Priority</div>
        <div className="stat-value stat-green">{high}</div>
      </div>
      <div className="stat-card">
        <div className="stat-label">Contacted</div>
        <div className="stat-value stat-blue">{contacted}</div>
      </div>
      <div className="stat-card">
        <div className="stat-label">Last Run</div>
        <div className="stat-value" style={{ fontSize: '1rem', paddingTop: '8px', color: 'var(--text-secondary)' }}>{lastRunStr}</div>
      </div>
    </div>
  );
}

function LogConsole({ logs, running }) {
  const endRef = useRef(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [logs]);
  const classify = (msg) => {
    if (msg.includes('✅') || msg.includes('Done') || msg.includes('complete')) return 'log-ok';
    if (msg.includes('⚠') || msg.includes('block') || msg.includes('skip')) return 'log-warn';
    if (msg.includes('❌') || msg.includes('Error')) return 'log-err';
    if (msg.startsWith('🔍') || msg.startsWith('🚀') || msg.startsWith('⭐')) return 'log-head';
    return '';
  };
  return (
    <div className="console-wrapper">
      <div className="console-header">
        <div className="console-header-left">
          <div className="console-dots">
            <div className="console-dot dot-red" />
            <div className="console-dot dot-yellow" />
            <div className="console-dot dot-green" />
          </div>
          Live Scraper Console
        </div>
        {running && (
          <span style={{ fontSize: '0.72rem', color: 'var(--green)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--green)', display: 'inline-block', animation: 'pulse 1s infinite' }} />
            Running
          </span>
        )}
      </div>
      <div className="console-body">
        {logs.length === 0 ? (
          <span className="console-idle">// Click "Start Scraping" to begin...</span>
        ) : (
          logs.map((line, i) => (
            <span key={i} className={`log-line ${classify(line)}`}>{line}{'\n'}</span>
          ))
        )}
        <div ref={endRef} />
      </div>
    </div>
  );
}

function EditableCell({ value, placeholder, onSave }) {
  const [val, setVal] = useState(value || '');
  useEffect(() => { setVal(value || ''); }, [value]);
  return (
    <input
      className="editable"
      value={val}
      placeholder={placeholder}
      onChange={e => setVal(e.target.value)}
      onBlur={() => { if (val !== value) onSave(val); }}
      onKeyDown={e => { if (e.key === 'Enter') e.target.blur(); }}
    />
  );
}

function LeadRow({ lead, onUpdate, isNew }) {
  const handleUpdate = useCallback((field, value) => {
    onUpdate(lead.id, { [field]: value });
  }, [lead.id, onUpdate]);

  return (
    <tr className={`${lead.priority === 'HIGH' ? 'high-priority' : ''} ${isNew ? 'new-row' : ''}`}>
      <td><PriorityBadge priority={lead.priority} /></td>
      <td style={{ fontWeight: 600, maxWidth: 180 }}>{lead.company}</td>
      <td style={{ color: 'var(--text-secondary)', maxWidth: 200 }}>{lead.title}</td>
      <td style={{ color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{lead.location}</td>
      <td>
        <span style={{ padding: '2px 8px', background: 'var(--bg-elevated)', borderRadius: 4, fontSize: '0.72rem', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
          {lead.source}
        </span>
      </td>
      <td>
        {lead.link ? (
          <a href={lead.link} target="_blank" rel="noopener noreferrer" className="job-link">
            View ↗
          </a>
        ) : '—'}
      </td>
      <td>
        <EditableCell value={lead.contactName} placeholder="Name..." onSave={v => handleUpdate('contactName', v)} />
      </td>
      <td>
        <EditableCell value={lead.contactEmail} placeholder="email@..." onSave={v => handleUpdate('contactEmail', v)} />
      </td>
      <td>
        <EditableCell value={lead.notes} placeholder="Notes..." onSave={v => handleUpdate('notes', v)} />
      </td>
      <td>
        <select
          className="status-select"
          value={lead.status || 'Not Contacted'}
          onChange={e => handleUpdate('status', e.target.value)}
          style={{ color: lead.status === 'Interested' ? 'var(--green)' : lead.status === 'Not Interested' ? 'var(--red)' : 'var(--text-secondary)' }}
        >
          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </td>
    </tr>
  );
}

function LeadsTable({ leads, onUpdate }) {
  const [filters, setFilters] = useState({ source: 'All', priority: 'All', status: 'All' });
  const [newIds, setNewIds] = useState(new Set());
  const prevIds = useRef(new Set());

  useEffect(() => {
    const currentIds = new Set(leads.map(l => l.id));
    const added = [...currentIds].filter(id => !prevIds.current.has(id));
    if (added.length > 0) {
      setNewIds(new Set(added));
      setTimeout(() => setNewIds(new Set()), 1000);
    }
    prevIds.current = currentIds;
  }, [leads]);

  const sources = ['All', ...new Set(leads.map(l => l.source))];
  const filtered = leads.filter(l => {
    if (filters.source !== 'All' && l.source !== filters.source) return false;
    if (filters.priority !== 'All' && l.priority !== filters.priority) return false;
    if (filters.status !== 'All' && l.status !== filters.status) return false;
    return true;
  });
  const sorted = [...filtered].sort((a, b) => (a.priority === 'HIGH' ? -1 : 1));

  return (
    <>
      <div className="filters-row">
        <div className="filter-group">
          <span className="filter-label">Source:</span>
          <select className="filter-select" value={filters.source} onChange={e => setFilters(f => ({ ...f, source: e.target.value }))}>
            {sources.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div className="filter-group">
          <span className="filter-label">Priority:</span>
          <select className="filter-select" value={filters.priority} onChange={e => setFilters(f => ({ ...f, priority: e.target.value }))}>
            <option>All</option><option>HIGH</option><option>Normal</option>
          </select>
        </div>
        <div className="filter-group">
          <span className="filter-label">Status:</span>
          <select className="filter-select" value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}>
            <option>All</option>
            {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          {sorted.length} of {leads.length} leads
        </span>
      </div>

      <div className="table-wrapper">
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Priority</th>
                <th>Company</th>
                <th>Job Title</th>
                <th>Location</th>
                <th>Source</th>
                <th>Link</th>
                <th>Contact Name</th>
                <th>Contact Email</th>
                <th>Notes</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {sorted.length === 0 ? (
                <tr>
                  <td colSpan={10}>
                    <div className="empty-state">
                      <h3>No leads yet</h3>
                      <p>Click "Start Scraping" to find insurance agencies</p>
                    </div>
                  </td>
                </tr>
              ) : sorted.map(lead => (
                <LeadRow
                  key={lead.id}
                  lead={lead}
                  onUpdate={onUpdate}
                  isNew={newIds.has(lead.id)}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export default function Dashboard() {
  const [leads, setLeads] = useState([]);
  const [logs, setLogs] = useState([]);
  const [running, setRunning] = useState(false);
  const [lastRun, setLastRun] = useState(null);
  const eventSourceRef = useRef(null);

  // Load existing leads on mount
  useEffect(() => {
    fetch('/api/leads')
      .then(r => r.json())
      .then(data => {
        if (data.leads?.length) setLeads(data.leads);
        if (data.lastRun) setLastRun(data.lastRun);
      })
      .catch(() => { });
  }, []);

  const startScraping = useCallback(() => {
    if (running) return;
    setRunning(true);
    setLogs(['🚀 Starting scraper...']);

    if (eventSourceRef.current) eventSourceRef.current.close();
    const es = new EventSource('/api/scrape');
    eventSourceRef.current = es;

    es.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.type === 'log') {
        setLogs(prev => [...prev, data.message]);
      } else if (data.type === 'done') {
        setLeads(data.leads || []);
        setLastRun(data.lastRun);
        setRunning(false);
        es.close();
      } else if (data.type === 'error') {
        setLogs(prev => [...prev, `❌ ${data.message}`]);
        setRunning(false);
        es.close();
      }
    };
    es.onerror = () => {
      setLogs(prev => [...prev, '⚠ Connection closed.']);
      setRunning(false);
      es.close();
    };
  }, [running]);

  const handleUpdate = useCallback(async (id, changes) => {
    setLeads(prev => prev.map(l => l.id === id ? { ...l, ...changes } : l));
    try {
      await fetch(`/api/leads/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(changes),
      });
    } catch (_) { }
  }, []);

  const clearAll = useCallback(async () => {
    if (!confirm('Clear all leads? This cannot be undone.')) return;
    setLeads([]);
    setLogs([]);
    setLastRun(null);
    await fetch('/api/leads', { method: 'DELETE' });
  }, []);

  const exportCSV = useCallback(() => {
    if (leads.length === 0) return;
    const headers = ['Priority', 'Company', 'Job Title', 'Location', 'Source', 'Link', 'Contact Name', 'Contact Email', 'Notes', 'Status'];
    const rows = leads.map(l => [
      l.priority || 'Normal',
      `"${(l.company || '').replace(/"/g, '""')}"`,
      `"${(l.title || '').replace(/"/g, '""')}"`,
      `"${(l.location || '').replace(/"/g, '""')}"`,
      l.source || '',
      l.link || '',
      `"${(l.contactName || '').replace(/"/g, '""')}"`,
      `"${(l.contactEmail || '').replace(/"/g, '""')}"`,
      `"${(l.notes || '').replace(/"/g, '""')}"`,
      l.status || 'Not Contacted'
    ].join(','));
    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `agency_leads_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [leads]);

  return (
    <>
      <Head>
        <title>Agency Scraper | CallBound Media</title>
        <meta name="description" content="Insurance agency lead scraping dashboard" />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🎯</text></svg>" />
      </Head>

      <nav className="header">
        <div className="header-inner">
          <div className="header-brand">
            <div className="header-logo">AS</div>
            <div>
              <div className="header-title">Agency Scraper</div>
              <div className="header-sub">Pay-Per-Call Lead Finder</div>
            </div>
          </div>
          <div className="header-actions">
            {leads.length > 0 && (
              <>
                <button className="btn btn-ghost" onClick={exportCSV}>
                  ↓ Export CSV
                </button>
                <button className="btn btn-danger" onClick={clearAll}>
                  Clear All
                </button>
              </>
            )}
            <button className="btn btn-primary" onClick={startScraping} disabled={running}>
              {running ? (
                <>
                  <span style={{ width: 14, height: 14, border: '2px solid #000', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
                  Scraping...
                </>
              ) : (
                <>▶ Start Scraping</>
              )}
            </button>
          </div>
        </div>
      </nav>

      <style jsx global>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
      `}</style>

      <div className="page">
        <StatsBar leads={leads} lastRun={lastRun} />
        <LogConsole logs={logs} running={running} />
        <LeadsTable leads={leads} onUpdate={handleUpdate} />
      </div>
    </>
  );
}
