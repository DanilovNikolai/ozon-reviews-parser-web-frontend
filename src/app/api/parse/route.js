// app/api/parse/route.js
import { NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import * as XLSX from 'xlsx';

const s3Client = new S3Client({
  region: 'ru-central1',
  endpoint: process.env.YANDEX_ENDPOINT,
  credentials: {
    accessKeyId: process.env.YANDEX_ACCESS_KEY,
    secretAccessKey: process.env.YANDEX_SECRET_KEY,
  },
});

const BUCKET = process.env.YANDEX_BUCKET;
const UPLOAD_FOLDER = 'uploaded_files/';

export async function POST(req) {
  try {
    const formData = await req.formData();
    const mode = formData.get('mode');
    const linksText = formData.get('linksText');
    const file = formData.get('file');

    if (!linksText && !file) {
      return NextResponse.json(
        { success: false, error: 'Необходимо ввести ссылки или загрузить файл', s3OutputUrl: null },
        { status: 400 }
      );
    }

    // --- Создание Excel при вводе ссылок ---
    let inputBuffer;
    let filename;

    if (linksText) {
      const links = linksText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);

      const ws = XLSX.utils.aoa_to_sheet(links.map((l) => [l]));
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Links');
      inputBuffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
      filename = `links_${Date.now()}.xlsx`;
    }

    if (file && file.size > 0) {
      inputBuffer = Buffer.from(await file.arrayBuffer());
      filename = file.name;
    }

    // --- Загружаем Excel на S3 ---
    const key = `${UPLOAD_FOLDER}${filename}`;
    await s3Client.send(
      new PutObjectCommand({
        Bucket: BUCKET,
        Key: key,
        Body: inputBuffer,
        ContentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })
    );

    const s3InputFileUrl = `https://storage.yandexcloud.net/${BUCKET}/${key}`;
    console.log('✅ Uploaded input file:', s3InputFileUrl);

    // --- Отправляем запрос на backend ---
    const backendRes = await fetch(`${process.env.SERVER_API_URL}/parse`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ s3InputFileUrl, mode }),
    });

    // 🔥 Если backend вернул 204 — молча выходим, ничего НЕ шлём клиенту
    if (backendRes.status === 204) {
      console.log('⚠ Backend: second process rejected — UI not notified.');
      return new NextResponse(null, { status: 204 });
    }

    // --- Пытаемся прочитать JSON, но мягко ---
    let data = null;
    try {
      data = await backendRes.json();
    } catch {
      // Если JSON не прочитан — тихо завершаем, ничего не отправляем клиенту
      console.warn('⚠ Backend did not return JSON — ignoring.');
      return new NextResponse(null, { status: 204 });
    }

    const success = Boolean(data?.success);
    const error = data?.error || null;
    const s3OutputUrl = data?.s3OutputUrl || null;

    return NextResponse.json(
      {
        success,
        error,
        s3OutputUrl,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error('Ошибка /api/parse:', err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || 'Неизвестная ошибка /api/parse',
        s3OutputUrl: null,
      },
      { status: 500 }
    );
  }
}
