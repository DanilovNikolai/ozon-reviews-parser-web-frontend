'use client';

import { useState } from 'react';
import axios from 'axios';

export default function HomePage() {
  const [linksText, setLinksText] = useState('');
  const [file, setFile] = useState(null);
  const [mode, setMode] = useState('1');
  const [loading, setLoading] = useState(false);
  const [resp, setResp] = useState(null);

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
      setResp({ error: err.message || 'Ошибка' });
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
        <p className="text-gray-600 mb-6 text-center">
          Вставь ссылки или загрузи файл. Выбери режим и нажми «Запустить».
        </p>

        <form onSubmit={onSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Список ссылок (по одной в строке)
            </label>
            <textarea
              value={linksText}
              onChange={(e) => setLinksText(e.target.value)}
              rows={8}
              className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://www.ozon.ru/product/..."
            />
          </div>

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

        <section className="mt-8">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Результат</h3>
          <pre className="bg-gray-100 p-4 rounded-lg text-sm text-gray-800 overflow-auto max-h-80">
            {resp ? JSON.stringify(resp, null, 2) : '—'}
          </pre>
        </section>
      </div>
    </main>
  );
}
