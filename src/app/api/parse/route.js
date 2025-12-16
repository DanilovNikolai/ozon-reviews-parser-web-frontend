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
        {
          success: false,
          error: 'Необходимо ввести ссылки или загрузить файл',
          jobId: null,
        },
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

    // --- Отправляем запрос на backend — только старт задачи ---
    const cookie = req.headers.get('cookie') || '';

    const backendRes = await fetch(`${process.env.SERVER_API_URL}/parse`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', cookie },
      body: JSON.stringify({ s3InputFileUrl, mode }),
    });

    let data;
    try {
      data = await backendRes.json();
    } catch (e) {
      console.error('Ошибка парсинга JSON от backend /parse:', e);
      return NextResponse.json(
        {
          success: false,
          error: 'Ошибка запуска задачи на бэкенде',
          jobId: null,
        },
        { status: 500 }
      );
    }

    if (!data?.success || !data?.jobId) {
      return NextResponse.json(
        {
          success: false,
          error: data?.error || 'Не удалось создать задачу',
          jobId: null,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        error: null,
        jobId: data.jobId,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error('Ошибка /api/parse:', err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || 'Неизвестная ошибка /api/parse',
        jobId: null,
      },
      { status: 500 }
    );
  }
}
