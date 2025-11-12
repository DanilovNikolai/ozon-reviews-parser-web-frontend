'use client';

import { useState } from 'react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';

export default function HomePage() {
  const [inputLink, setInputLink] = useState('');
  const [links, setLinks] = useState([]);
  const [file, setFile] = useState(null);
  const [mode, setMode] = useState('1');
  const [loading, setLoading] = useState(false);
  const [resp, setResp] = useState(null);

  const ozonRegex = /^https:\/\/www\.ozon\.ru\/product\/[\w-]+/i;

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setResp(null);

    try {
      const form = new FormData();
      form.append('mode', mode);
      form.append('linksText', links.join('\n'));
      if (file) form.append('file', file);

      const res = await axios.post('/api/parse', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setResp(res.data);
    } catch (err) {
      console.error(err);
      setResp({
        error: err.response?.data?.error || 'Ошибка при запросе к серверу',
      });
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddLink();
    }
  }

  function handleAddLink() {
    const trimmed = inputLink.trim();
    if (!trimmed) return;

    if (!ozonRegex.test(trimmed)) {
      toast.error('Некорректная ссылка!');
      setInputLink('');
      return;
    }

    if (links.includes(trimmed)) {
      toast('⚠️ Такая ссылка уже есть!');
      setInputLink('');
      return;
    }

    setLinks([...links, trimmed]);
    toast.success('Ссылка добавлена!');
    setInputLink('');
  }

  function clearLinks() {
    setLinks([]);
    toast('🧹 Ссылки очищены.');
  }

  function clearFile() {
    setFile(null);
    document.getElementById('fileInput').value = '';
    toast('🗑 Файл очищен.');
  }

  function removeLink(linkToRemove) {
    setLinks(links.filter((l) => l !== linkToRemove));
  }

  return (
    <main className="min-h-screen flex flex-col items-center py-12 bg-gray-50 relative">
      <Toaster position="top-right" toastOptions={{ duration: 2500 }} />

      <div className="w-full max-w-2xl bg-white shadow-md rounded-xl p-8">
        <h1 className="text-3xl font-bold mb-4 text-blue-600 text-center">
          🧩 Ozon Reviews Parser
        </h1>

        <form onSubmit={onSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Добавить ссылку</label>
            <div className="flex gap-2">
              <input
                value={inputLink}
                onChange={(e) => setInputLink(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={handleAddLink}
                type="text"
                className="flex-grow border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                placeholder="https://www.ozon.ru/product/..."
              />

              <button
                type="button"
                onClick={clearLinks}
                disabled={!links.length}
                className={`px-3 py-2 text-sm rounded-lg border transition ${
                  links.length
                    ? 'bg-gray-100 hover:bg-gray-200 border-gray-300 cursor-pointer'
                    : 'bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed'
                }`}
              >
                🧹 Очистить
              </button>
            </div>

            {links.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2 bg-gray-50 border border-gray-200 rounded-md p-3">
                {links.map((link, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center text-xs font-medium bg-green-100 text-green-800 px-3 py-1 rounded-full border border-green-300"
                  >
                    ✅ {link}
                    <button
                      type="button"
                      onClick={() => removeLink(link)}
                      className="ml-2 text-red-500 hover:text-red-700 cursor-pointer"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* 🔹 Файл */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Или загрузить файл (.xlsx)
            </label>
            <div className="flex gap-2 items-center">
              <input
                id="fileInput"
                type="file"
                accept=".txt,.xlsx"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="flex-grow text-gray-700 border border-gray-300 rounded-lg p-2 bg-gray-50 cursor-pointer file:mr-3 file:py-1 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {file && (
                <button
                  type="button"
                  onClick={clearFile}
                  className="px-3 py-3 text-sm bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition cursor-pointer"
                >
                  🗑 Очистить
                </button>
              )}
            </div>
          </div>

          {/* 🔹 Режим */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Режим парсинга</label>
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

          {/* 🔹 Кнопка запуска */}
          <div className="flex justify-center">
            <button
              type="submit"
              disabled={loading}
              className={`px-6 py-3 text-white rounded-lg font-semibold transition-colors duration-200 ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 cursor-pointer'
              }`}
            >
              {loading ? 'Запуск...' : '🚀 Запустить парсер'}
            </button>
          </div>
        </form>

        {/* 🔹 Результат */}
        <section className="mt-8">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Результат</h3>
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
