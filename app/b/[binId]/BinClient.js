'use client';

import { useEffect, useState, useCallback } from 'react';

export default function BinClient({ binId, baseUrl }) {
  const hookUrl = `${baseUrl}/api/hook/${binId}`;
  const [requests, setRequests] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [copied, setCopied] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/requests/${binId}`, { cache: 'no-store' });
      const data = await res.json();
      if (data.ok) {
        setRequests(data.requests);
        if (data.requests.length > 0 && !selected) {
          setSelected(data.requests[0].id);
        }
      }
    } finally {
      setLoading(false);
    }
  }, [binId, selected]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!autoRefresh) return;
    const i = setInterval(load, 3000);
    return () => clearInterval(i);
  }, [autoRefresh, load]);

  const copyUrl = () => {
    navigator.clipboard.writeText(hookUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const clearAll = async () => {
    if (!confirm('Delete all captured requests for this bin?')) return;
    await fetch(`/api/requests/${binId}`, { method: 'DELETE' });
    setRequests([]);
    setSelected(null);
  };

  const selectedRequest = requests.find((r) => r.id === selected);

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header style={{
        padding: '16px 24px',
        borderBottom: '1px solid #2a2d33',
        background: '#16181d',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <a href="/" style={{ color: '#9aa0a6', textDecoration: 'none', fontSize: 14 }}>← Home</a>
          <div style={{ flex: 1, minWidth: 300 }}>
            <div style={{ fontSize: 12, color: '#9aa0a6', marginBottom: 4 }}>Your endpoint URL</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <code style={{
                background: '#0e0f12',
                padding: '8px 12px',
                borderRadius: 4,
                fontSize: 14,
                color: '#7dd3fc',
                border: '1px solid #2a2d33',
                flex: 1,
                overflow: 'auto',
                whiteSpace: 'nowrap',
              }}>{hookUrl}</code>
              <button onClick={copyUrl} style={btnStyle}>
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, color: '#9aa0a6' }}>
            <input type="checkbox" checked={autoRefresh} onChange={(e) => setAutoRefresh(e.target.checked)} />
            Auto-refresh
          </label>
          <button onClick={load} style={btnStyle}>Refresh</button>
          <button onClick={clearAll} style={{ ...btnStyle, background: '#3a1d1d', borderColor: '#5a2a2a' }}>Clear all</button>
        </div>
      </header>

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <aside style={{
          width: 340,
          borderRight: '1px solid #2a2d33',
          overflowY: 'auto',
          background: '#13151a',
        }}>
          {loading && <div style={{ padding: 16, color: '#9aa0a6' }}>Loading...</div>}
          {!loading && requests.length === 0 && (
            <div style={{ padding: 24, color: '#9aa0a6', fontSize: 14, lineHeight: 1.6 }}>
              <strong style={{ color: '#e6e6e6' }}>Waiting for requests.</strong>
              <p>Send any HTTP request to your endpoint URL above and it'll appear here.</p>
              <p style={{ marginTop: 16, marginBottom: 4 }}>Quick test from terminal:</p>
              <pre style={{
                background: '#0e0f12',
                padding: 12,
                borderRadius: 4,
                fontSize: 12,
                overflow: 'auto',
                border: '1px solid #2a2d33',
              }}>{`curl -X POST ${hookUrl} \\
  -H "Content-Type: application/json" \\
  -d '{"test": true}'`}</pre>
            </div>
          )}
          {requests.map((r) => (
            <div
              key={r.id}
              onClick={() => setSelected(r.id)}
              style={{
                padding: '12px 16px',
                borderBottom: '1px solid #2a2d33',
                cursor: 'pointer',
                background: selected === r.id ? '#1f2329' : 'transparent',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span style={methodPill(r.method)}>{r.method}</span>
                <span style={{ fontSize: 13, color: '#cbd5e1', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {r.path || '/'}
                </span>
              </div>
              <div style={{ fontSize: 12, color: '#9aa0a6' }}>
                {new Date(r.receivedAt).toLocaleString()} · {r.bodySize}B
              </div>
            </div>
          ))}
        </aside>

        <main style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
          {!selectedRequest && (
            <div style={{ color: '#9aa0a6', padding: 24 }}>Select a request to inspect.</div>
          )}
          {selectedRequest && <RequestDetail req={selectedRequest} />}
        </main>
      </div>
    </div>
  );
}

function RequestDetail({ req }) {
  let prettyBody = req.body;
  let bodyType = 'raw';
  if (req.body) {
    try {
      prettyBody = JSON.stringify(JSON.parse(req.body), null, 2);
      bodyType = 'json';
    } catch {
      bodyType = 'raw';
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <span style={methodPill(req.method)}>{req.method}</span>
        <code style={{ fontSize: 15, color: '#7dd3fc' }}>{req.path || '/'}</code>
        <span style={{ color: '#9aa0a6', fontSize: 13 }}>{new Date(req.receivedAt).toLocaleString()}</span>
        <span style={{ color: '#9aa0a6', fontSize: 13 }}>from {req.ip}</span>
      </div>

      <Section title="Query Parameters">
        {Object.keys(req.query || {}).length === 0 ? (
          <Empty>No query parameters</Empty>
        ) : (
          <KVTable data={req.query} />
        )}
      </Section>

      <Section title={`Headers (${Object.keys(req.headers || {}).length})`}>
        <KVTable data={req.headers} />
      </Section>

      <Section title={`Body (${req.bodySize}B, ${bodyType})`}>
        {req.body ? (
          <pre style={{
            background: '#0e0f12',
            padding: 16,
            borderRadius: 6,
            fontSize: 13,
            border: '1px solid #2a2d33',
            overflow: 'auto',
            maxHeight: 500,
            color: '#e6e6e6',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}>{prettyBody}</pre>
        ) : (
          <Empty>Empty body</Empty>
        )}
      </Section>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <h3 style={{ fontSize: 14, color: '#9aa0a6', margin: '0 0 8px 0', textTransform: 'uppercase', letterSpacing: 0.5 }}>{title}</h3>
      {children}
    </div>
  );
}

function Empty({ children }) {
  return <div style={{ color: '#9aa0a6', fontSize: 14, fontStyle: 'italic' }}>{children}</div>;
}

function KVTable({ data }) {
  return (
    <div style={{ border: '1px solid #2a2d33', borderRadius: 6, overflow: 'hidden' }}>
      {Object.entries(data).map(([k, v], i) => (
        <div key={k} style={{
          display: 'grid',
          gridTemplateColumns: '200px 1fr',
          background: i % 2 === 0 ? '#16181d' : '#13151a',
          borderTop: i === 0 ? 'none' : '1px solid #2a2d33',
        }}>
          <div style={{ padding: '8px 12px', color: '#9aa0a6', fontSize: 13, fontFamily: 'monospace', borderRight: '1px solid #2a2d33' }}>{k}</div>
          <div style={{ padding: '8px 12px', fontSize: 13, fontFamily: 'monospace', wordBreak: 'break-all' }}>{String(v)}</div>
        </div>
      ))}
    </div>
  );
}

function methodPill(method) {
  const colors = {
    GET: '#10b981',
    POST: '#3b82f6',
    PUT: '#f59e0b',
    PATCH: '#a855f7',
    DELETE: '#ef4444',
    HEAD: '#64748b',
    OPTIONS: '#64748b',
  };
  return {
    background: colors[method] || '#64748b',
    color: 'white',
    padding: '2px 8px',
    borderRadius: 4,
    fontSize: 11,
    fontWeight: 700,
    fontFamily: 'monospace',
  };
}

const btnStyle = {
  background: '#2a2d33',
  color: '#e6e6e6',
  border: '1px solid #3a3d43',
  padding: '6px 12px',
  borderRadius: 4,
  fontSize: 13,
  cursor: 'pointer',
};
