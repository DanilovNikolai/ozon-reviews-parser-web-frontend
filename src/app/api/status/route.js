// app/api/status/route.js
import { NextResponse } from 'next/server';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const jobId = searchParams.get('jobId');

    if (!jobId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Не передан jobId',
        },
        { status: 400 }
      );
    }

    const backendRes = await fetch(`${process.env.SERVER_API_URL}/parse/${jobId}/status`, {
      method: 'GET',
    });

    let data;
    try {
      data = await backendRes.json();
    } catch (e) {
      console.error('Ошибка парсинга JSON от backend /parse/:jobId/status:', e);
      return NextResponse.json(
        {
          success: false,
          error: 'Ошибка получения статуса задачи',
        },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    console.error('Ошибка /api/status GET:', err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || 'Неизвестная ошибка /api/status',
      },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const { jobId, action } = body || {};

    if (!jobId) {
      return NextResponse.json({ success: false, error: 'Не передан jobId' }, { status: 400 });
    }

    if (action !== 'cancel') {
      return NextResponse.json({ success: false, error: 'Неизвестное действие' }, { status: 400 });
    }

    const backendRes = await fetch(`${process.env.SERVER_API_URL}/parse/${jobId}/cancel`, {
      method: 'POST',
    });

    let data;
    try {
      data = await backendRes.json();
    } catch {
      data = {
        success: backendRes.ok,
        error: backendRes.ok ? null : 'Ошибка отмены на бэкенде',
      };
    }

    return NextResponse.json(data, { status: backendRes.status || 200 });
  } catch (err) {
    console.error('Ошибка /api/status POST:', err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || 'Неизвестная ошибка /api/status POST',
      },
      { status: 500 }
    );
  }
}
