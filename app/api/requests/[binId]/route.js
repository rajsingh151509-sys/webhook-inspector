import { getRequests, clearBin } from '../../../../lib/storage';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req, { params }) {
  try {
    const requests = await getRequests(params.binId);
    return NextResponse.json({ ok: true, requests });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    await clearBin(params.binId);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
