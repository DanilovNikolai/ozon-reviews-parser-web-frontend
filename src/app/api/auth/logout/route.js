import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const cookie = req.headers.get('cookie') || '';

    const res = await fetch(`${process.env.SERVER_API_URL}/auth/logout`, {
      method: 'POST',
      headers: { cookie },
      credentials: 'include',
    });

    const data = await res.json();

    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ success: false, error: 'Auth proxy error' }, { status: 500 });
  }
}
