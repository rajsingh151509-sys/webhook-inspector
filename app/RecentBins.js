'use client';

import { useEffect, useState } from 'react';

export default function RecentBins() {
  const [bins, setBins] = useState([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem('recent-bins');
      if (stored) {
        setBins(JSON.parse(stored));
      }
    } catch {}
  }, []);

  const removeBin = (id) => {
    const updated = bins.filter((b) => b.id !== id);
    setBins(updated);
    localStorage.setItem('recent-bins', JSON.stringify(updated));
  };

  if (!mounted || bins.length === 0) return null;

  return (
    <div style={{ marginTop: 48 }}>
      <h2 style={{ fontSize: 18, marginBottom: 12, color: '#e6e6e6' }}>Your recent endpoints</h2>
      <div style={{ border: '1px solid #2a2d33', borderRadius: 8, overflow: 'hidden' }}>
        {bins.map((bin, i) => (
          <div key={bin.id} style={{
            padding: '12px 16px',
            background: i % 2 === 0 ? '#16181d' : '#13151a',
            borderTop: i === 0 ? 'none' : '1px solid #2a2d33',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}>
            <a href={`/b/${bin.id}`} style={{
              color: '#7dd3fc',
              textDecoration: 'none',
              fontFamily: 'monospace',
              fontSize: 14,
              flex: 1,
            }}>
              /b/{bin.id}
            </a>
            <span style={{ color: '#9aa0a6', fontSize: 12 }}>
              {new Date(bin.lastVisited).toLocaleDateString()}
            </span>
            <button
              onClick={() => removeBin(bin.id)}
              style={{
                background: 'transparent',
                border: '1px solid #2a2d33',
                color: '#9aa0a6',
                padding: '4px 10px',
                borderRadius: 4,
                cursor: 'pointer',
                fontSize: 12,
              }}
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
