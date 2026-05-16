import BinClient from './BinClient';
import { headers } from 'next/headers';

export default function BinPage({ params }) {
  const h = headers();
  const host = h.get('host');
  const proto = h.get('x-forwarded-proto') || 'https';
  const baseUrl = `${proto}://${host}`;
  return <BinClient binId={params.binId} baseUrl={baseUrl} />;
}
