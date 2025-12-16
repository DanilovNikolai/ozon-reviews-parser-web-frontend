import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const body = await req.json();

    const backendRes = await fetch(`${process.env.SERVER_API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await backendRes.json();

    const response = NextResponse.json(data, {
      status: backendRes.status,
    });

    const setCookie = backendRes.headers.get('set-cookie');
    if (setCookie) {
      response.headers.set('set-cookie', setCookie);
    }

    return response;
  } catch (e) {
    return NextResponse.json({ success: false, error: 'Auth proxy error' }, { status: 500 });
  }
}
