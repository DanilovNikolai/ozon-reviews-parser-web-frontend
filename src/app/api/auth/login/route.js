import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const body = await req.json();

    const res = await fetch(`${process.env.SERVER_API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      credentials: 'include',
    });

    const data = await res.json();

    return NextResponse.json(data, { status: res.status });
  } catch (e) {
    return NextResponse.json({ success: false, error: 'Auth proxy error' }, { status: 500 });
  }
}
