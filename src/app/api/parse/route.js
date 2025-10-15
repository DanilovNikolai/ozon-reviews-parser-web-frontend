import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import path from 'path';

// Настройки Yandex S3
const s3Client = new S3Client({
  region: 'ru-central1',
  credentials: {
    accessKeyId: process.env.YANDEX_ACCESS_KEY,
    secretAccessKey: process.env.YANDEX_SECRET_KEY,
  },
  endpoint: process.env.YANDEX_ENDPOINT,
});

const BUCKET = process.env.YANDEX_BUCKET;
const UPLOAD_FOLDER = 'uploaded_files/';

export async function POST(req) {
  try {
    const formData = await req.formData();

    const mode = formData.get('mode');
    const linksText = (formData.get('linksText') || '').trim();
    const file = formData.get('file');

    // 💡 Проверка наличия данных
    if (!linksText && !file) {
      return NextResponse.json(
        { error: 'Необходимо ввести ссылки или загрузить файл.' },
        { status: 400 }
      );
    }

    // 💡 Разделяем и чистим ссылки
    const links = linksText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    // 💡 Проверяем формат ссылок
    const validLinks = links.filter((l) =>
      /^https:\/\/www\.ozon\.ru\/product\/[\w-]+/i.test(l)
    );

    // Если есть хотя бы одна неправильная ссылка
    if (links.length > 0 && validLinks.length !== links.length) {
      const invalidLinks = links.filter(
        (l) => !/^https:\/\/www\.ozon\.ru\/product\/[\w-]+/i.test(l)
      );

      return NextResponse.json(
        {
          error: `Некоторые ссылки имеют неправильный формат:\n${invalidLinks.join(
            '\n'
          )}`,
        },
        { status: 400 }
      );
    }

    let buffer;
    let filename;

    if (file && typeof file === 'object' && file.size > 0) {
      // 📁 Загруженный файл
      buffer = Buffer.from(await file.arrayBuffer());
      filename = `${UPLOAD_FOLDER}${Date.now()}_${file.name}`;
    } else if (validLinks.length > 0) {
      // 🧾 Генерация Excel из корректных ссылок
      const ws = XLSX.utils.aoa_to_sheet(validLinks.map((l) => [l]));
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

      buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
      filename = `${UPLOAD_FOLDER}${Date.now()}_generated_links.xlsx`;
    }

    // ☁️ Загрузка в Yandex Cloud S3
    await s3Client.send(
      new PutObjectCommand({
        Bucket: BUCKET,
        Key: filename,
        Body: buffer,
        ContentType:
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })
    );

    console.log(`✅ Файл успешно загружен в S3: ${filename}`);

    return NextResponse.json({
      success: true,
      message: 'Файл успешно загружен в Yandex Cloud S3',
      filename,
      mode,
      linksCount: validLinks.length,
    });
  } catch (err) {
    console.error('Ошибка при обработке API:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
