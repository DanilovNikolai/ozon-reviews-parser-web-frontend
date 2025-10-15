import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const formData = await req.formData();

    const mode = formData.get('mode');
    const linksText = formData.get('linksText');
    const file = formData.get('file');

    let fileInfo = null;
    if (file && typeof file === 'object') {
      const buffer = Buffer.from(await file.arrayBuffer());
      fileInfo = {
        name: file.name,
        size: buffer.length,
        type: file.type,
      };
    }

    return NextResponse.json({
      success: true,
      message: '✅ Запрос успешно принят',
      mode,
      linksCount: linksText ? linksText.split('\n').filter(Boolean).length : 0,
      fileInfo,
    });
  } catch (err) {
    console.error('Ошибка в API:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
