import { saveRequest } from '../../../../../lib/storage';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

async function handle(req, { params }) {
  return capture(req, params.binId, params.path || []);
}

export const GET = handle;
export const POST = handle;
export const PUT = handle;
export const PATCH = handle;
export const DELETE = handle;
export const HEAD = handle;
export const OPTIONS = handle;

async function capture(req, binId, pathParts) {
  const url = new URL(req.url);
  const headers = {};
  req.headers.forEach((value, key) => {
    headers[key] = value;
  });

  let body = '';
  try {
    body = await req.text();
  } catch {
    body = '';
  }

  const query = {};
  url.searchParams.forEach((value, key) => {
    query[key] = value;
  });

  const requestData = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    method: req.method,
    path: '/' + pathParts.join('/'),
    query,
    headers,
    body,
    bodySize: body.length,
    receivedAt: new Date().toISOString(),
    ip: headers['x-forwarded-for'] || headers['x-real-ip'] || 'unknown',
  };

  try {
    await saveRequest(binId, requestData);
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: 'Failed to persist request', detail: String(e) },
      { status: 500 }
    );
  }

  return NextResponse.json({
    ok: true,
    binId,
    receivedAt: requestData.receivedAt,
    requestId: requestData.id,
  });
}
