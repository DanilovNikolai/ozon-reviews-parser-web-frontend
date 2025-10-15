'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

export default function HomePage() {
  const [linksText, setLinksText] = useState('');
  const [file, setFile] = useState(null);
  const [mode, setMode] = useState('1');
  const [loading, setLoading] = useState(false);
  const [resp, setResp] = useState(null);
  const [parsedLinks, setParsedLinks] = useState([]);

  // 🔍 при изменении текста пересчитываем список ссылок
  useEffect(() => {
    const links = linksText
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean)
      .map((link) => ({
        text: link,
        valid: /^https:\/\/www\.ozon\.ru\/product\/[\w-]+/i.test(link),
      }));
    setParsedLinks(links);
  }, [linksText]);

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setResp(null);

    try {
      const form = new FormData();
      form.append('mode', mode);
      form.append('linksText', linksText);
      if (file) form.append('file', file);

      const res = await axios.post('/api/parse', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setResp(res.data);
    } catch (err) {
      console.error(err);
      const message =
        err.response?.data?.error ||
        err.message ||
        'Неизвестная ошибка при отправке запроса';
      setResp({ error: message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center py-12 bg-gray-50">
      <div className="w-full max-w-2xl bg-white shadow-md rounded-xl p-8">
        <h1 className="text-3xl font-bold mb-4 text-blue-600 text-center">
          🧩 Ozon Reviews Parser — Demo
        </h1>

        <form onSubmit={onSubmit} className="space-y-6">
          {/* 🔹 Текстовое поле */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Список ссылок (по одной в строке)
            </label>
            <textarea
              value={linksText}
              onChange={(e) => setLinksText(e.target.value)}
              rows={8}
              className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              placeholder="https://www.ozon.ru/product/..."
            />

            {/* 🔹 Список бейджей */}
            {parsedLinks.some((l) => l.valid) && (
              <div className="mt-3 flex flex-wrap gap-2 bg-gray-50 border border-gray-200 rounded-md p-3">
                {parsedLinks
                  .filter((l) => l.valid)
                  .map((link, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center text-xs font-medium bg-green-100 text-green-800 px-3 py-1 rounded-full border border-green-300"
                    >
                      ✅ {link.text}
                    </span>
                  ))}
              </div>
            )}
          </div>

          {/* Загрузка файла */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Или загрузить файл (.txt или .xlsx)
            </label>
            <input
              type="file"
              accept=".txt,.xlsx"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full text-gray-700 border border-gray-300 rounded-lg p-2 bg-gray-50 cursor-pointer file:mr-3 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>

          {/* Режим */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Режим парсинга
            </label>
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value)}
              className="border border-gray-300 rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="1">1 — все отзывы</option>
              <option value="2">2 — только с текстом</option>
              <option value="3">3 — остановка при первом пустом</option>
            </select>
          </div>

          {/* Кнопка */}
          <div className="flex justify-center">
            <button
              type="submit"
              disabled={loading}
              className={`px-6 py-3 text-white rounded-lg font-semibold transition-colors duration-200 ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {loading ? 'Запуск...' : '🚀 Запустить парсер'}
            </button>
          </div>
        </form>

        {/* Результаты */}
        <section className="mt-8">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            Результат
          </h3>
          {resp ? (
            resp.error ? (
              <div className="bg-red-50 border border-red-300 text-red-800 p-4 rounded-lg whitespace-pre-wrap">
                <strong className="block mb-1">Ошибка:</strong>
                {resp.error}
              </div>
            ) : (
              <pre className="bg-green-50 border border-green-300 text-green-800 p-4 rounded-lg text-sm overflow-auto max-h-80">
                {JSON.stringify(resp, null, 2)}
              </pre>
            )
          ) : (
            <div className="bg-gray-100 p-4 rounded-lg text-gray-600 text-sm">
              — Результаты появятся здесь —
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
