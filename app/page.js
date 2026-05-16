import Link from 'next/link';
import { newBinId } from '../lib/storage';
import { redirect } from 'next/navigation';

async function createBin() {
  'use server';
  const id = newBinId();
  redirect(`/b/${id}`);
}

export default function Home() {
  return (
    <div style={{ maxWidth: 720, margin: '80px auto', padding: '0 24px' }}>
      <h1 style={{ fontSize: 32, marginBottom: 8 }}>Webhook Inspector</h1>
      <p style={{ color: '#9aa0a6', marginTop: 0, marginBottom: 32 }}>
        Create a unique URL. Point any system at it. Inspect what comes in.
      </p>

      <form action={createBin}>
        <button
          type="submit"
          style={{
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: 6,
            fontSize: 16,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Create new endpoint
        </button>
      </form>

      <div style={{ marginTop: 48, padding: 24, background: '#16181d', borderRadius: 8, border: '1px solid #2a2d33' }}>
        <h3 style={{ marginTop: 0 }}>How it works</h3>
        <ol style={{ color: '#9aa0a6', lineHeight: 1.7 }}>
          <li>Click the button above to generate a unique URL like <code style={codeStyle}>/hook/abc123xyz</code></li>
          <li>Share that URL with the system that needs to send you requests</li>
          <li>Every request hitting it (GET, POST, PUT, etc.) is captured</li>
          <li>Review headers, body, query params, and method on the bin page</li>
        </ol>
        <p style={{ color: '#9aa0a6', marginBottom: 0 }}>
          Bins keep the last 100 requests. Inactive bins expire after 30 days.
        </p>
      </div>
    </div>
  );
}

const codeStyle = {
  background: '#2a2d33',
  padding: '2px 6px',
  borderRadius: 4,
  fontSize: 13,
};
