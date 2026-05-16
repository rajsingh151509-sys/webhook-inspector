import { kv } from '@vercel/kv';

const MAX_REQUESTS_PER_BIN = 100;


export async function saveRequest(binId, requestData) {
  const key = `bin:${binId}`;
  // Push to the head of the list, keep newest first
  await kv.lpush(key, JSON.stringify(requestData));
  // Trim so we never store more than MAX_REQUESTS_PER_BIN
  await kv.ltrim(key, 0, MAX_REQUESTS_PER_BIN - 1);
  // Refresh TTL on every write so active bins stay alive
  ;
}

export async function getRequests(binId) {
  const key = `bin:${binId}`;
  const items = await kv.lrange(key, 0, MAX_REQUESTS_PER_BIN - 1);
  return items.map((item) => {
    if (typeof item === 'string') {
      try {
        return JSON.parse(item);
      } catch {
        return null;
      }
    }
    return item;
  }).filter(Boolean);
}

export async function clearBin(binId) {
  await kv.del(`bin:${binId}`);
}

export function newBinId() {
  // 10-char URL-safe id
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let id = '';
  for (let i = 0; i < 10; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}
