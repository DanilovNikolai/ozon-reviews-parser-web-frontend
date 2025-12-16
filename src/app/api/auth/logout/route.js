import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const cookie = req.headers.get('cookie') || '';

    const backendRes = await fetch(`${process.env.SERVER_API_URL}/auth/logout`, {
      method: 'POST',
      headers: {
        cookie,
      },
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
