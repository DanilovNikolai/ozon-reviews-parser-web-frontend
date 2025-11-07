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
        { error: 'Необходимо ввести ссылки или загрузить файл' },
        { status: 400 }
      );
    }

    // 1️⃣ Создаём Excel, если пришли ссылки
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

    // 2️⃣ Если был загружен файл — просто используем его
    if (file && file.size > 0) {
      inputBuffer = Buffer.from(await file.arrayBuffer());
      filename = file.name;
    }

    // 3️⃣ Заливаем на S3
    const key = `${UPLOAD_FOLDER}${Date.now()}_${filename}`;
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

    // 4️⃣ Отправляем запрос на Railway
    const res = await fetch(`${process.env.RAILWAY_API_URL}/parse`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ s3InputFileUrl, mode }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Ошибка Railway');

    return NextResponse.json(data);
  } catch (err) {
    console.error('Ошибка /api/parse:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
