import { NextResponse } from 'next/server';

export async function GET(req) {
  try {
    const cookie = req.headers.get('cookie') || '';

    const res = await fetch(`${process.env.SERVER_API_URL}/auth/me`, {
      headers: { cookie },
    });

    const data = await res.json();

    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ success: false, error: 'Auth proxy error' }, { status: 500 });
  }
}
