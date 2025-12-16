import { NextResponse } from 'next/server';

export async function GET(req) {
  try {
    const cookie = req.headers.get('cookie') || '';

    const backendRes = await fetch(`${process.env.SERVER_API_URL}/parse/jobs`, {
      method: 'GET',
      headers: {
        cookie,
      },
      credentials: 'include',
    });

    const data = await backendRes.json();

    return NextResponse.json(data, {
      status: backendRes.status,
    });
  } catch (err) {
    console.error('❌ /api/history error:', err);
    return NextResponse.json(
      { success: false, error: 'Ошибка получения истории' },
      { status: 500 }
    );
  }
}
