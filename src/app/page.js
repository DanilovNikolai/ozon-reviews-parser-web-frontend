'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';

const POLLING_INTERVAL = 25000;

export default function HomePage() {
  const [inputLink, setInputLink] = useState('');
  const [links, setLinks] = useState([]);
  const [file, setFile] = useState(null);
  const [mode, setMode] = useState('1');
  const [loading, setLoading] = useState(false);
  const [resp, setResp] = useState(null);

  const [jobId, setJobId] = useState(null);
  const [jobStatus, setJobStatus] = useState(null);

  const ozonRegex = /^https:\/\/www\.ozon\.ru\/product\/[\w-]+/i;

  // ==== Восстанавливаем незавершённую задачу из localStorage ====
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const savedJobId = window.localStorage.getItem('ozonParserJobId');
    if (savedJobId) {
      setJobId(savedJobId);
      setLoading(true);
      toast('🔄 Восстанавливаем статус предыдущего парсинга...');
    }
  }, []);

  // ==== ПОЛЛИНГ СТАТУСА ПО jobId ====
  useEffect(() => {
    if (!jobId) return;

    let cancelled = false;

    async function pollOnce() {
      try {
        const res = await axios.get('/api/status', {
          params: { jobId },
        });

        const data = res.data;
        if (cancelled) return;

        if (!data.success) {
          console.warn('Неуспешный статус задачи:', data);
          return;
        }

        setJobStatus(data);

        const { status, s3OutputUrl, error } = data;

        if (status === 'completed') {
          setLoading(false);
          setResp({
            success: true,
            error: null,
            s3OutputUrl: s3OutputUrl || null,
          });
          toast.success('✅ Парсинг успешно завершён!');
          if (typeof window !== 'undefined') {
            window.localStorage.removeItem('ozonParserJobId');
          }
          setJobId(null);
        } else if (status === 'error') {
          setLoading(false);
          setResp({
            success: false,
            error: error || 'Ошибка парсинга',
            s3OutputUrl: s3OutputUrl || null,
          });
          toast.error('❌ Парсинг завершён с ошибкой');
          if (typeof window !== 'undefined') {
            window.localStorage.removeItem('ozonParserJobId');
          }
          setJobId(null);
        } else if (status === 'cancelled') {
          setLoading(false);
          setResp({
            success: false,
            error: 'Парсинг был отменён',
            s3OutputUrl: null,
          });
          toast('⛔ Парсинг отменён');
          if (typeof window !== 'undefined') {
            window.localStorage.removeItem('ozonParserJobId');
          }
          setJobId(null);
        }
      } catch (err) {
        console.error('Ошибка при запросе статуса задачи:', err);
      }
    }

    // первый запрос сразу
    pollOnce();
    // далее poll каждые 10 сек
    const id = setInterval(pollOnce, POLLING_INTERVAL);

    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [jobId]);

  // ==== Отправка формы: создаёт ТОЛЬКО jobId ====
  async function onSubmit(e) {
    e.preventDefault();
    setResp(null);

    try {
      const form = new FormData();
      form.append('mode', mode);
      form.append('linksText', links.join('\n'));
      if (file) form.append('file', file);

      setLoading(true);

      const res = await axios.post('/api/parse', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const data = res.data;

      if (!data.success || !data.jobId) {
        setLoading(false);
        setResp({
          success: false,
          error: data.error || 'Не удалось создать задачу парсинга',
          s3OutputUrl: null,
        });
        toast.error('❌ Ошибка запуска парсинга');
        return;
      }

      // успешно получили jobId
      setJobId(data.jobId);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('ozonParserJobId', data.jobId);
      }
      toast.success('🚀 Парсер запущен! Можно даже обновить страницу.');

      // РЕЗУЛЬТАТ появится позже через poll по jobId
    } catch (err) {
      console.error(err);

      setLoading(false);
      setResp({
        success: false,
        error: err.response?.data?.error || 'Ошибка при запросе к серверу',
        s3OutputUrl: null,
      });

      toast.error('❌ Ошибка при запросе к серверу');
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
    if (typeof document !== 'undefined') {
      const el = document.getElementById('fileInput');
      if (el) el.value = '';
    }
    toast('🗑 Файл очищен.');
  }

  function removeLink(linkToRemove) {
    setLinks(links.filter((l) => l !== linkToRemove));
  }

  const isBusy = loading || !!jobId;

  return (
    <main className="min-h-screen flex flex-col items-center py-12 bg-gray-50 relative">
      <Toaster position="top-right" toastOptions={{ duration: 2500 }} />

      <div className="w-full max-w-2xl bg-white shadow-md rounded-xl p-8">
        <h1 className="text-3xl font-bold mb-4 text-blue-600 text-center">
          🧩 Ozon Reviews Parser
        </h1>

        <form onSubmit={onSubmit} className="space-y-6">
          {/* ссылки */}
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
                disabled={!links.length || isBusy}
                className={`px-3 py-2 text-sm rounded-lg border transition ${
                  links.length && !isBusy
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

          {/* Файл */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Или загрузить файл (.xlsx)
            </label>
            <div className="flex gap-2 items-center">
              <input
                id="fileInput"
                type="file"
                accept=".txt,.xlsx"
                disabled={isBusy}
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="flex-grow text-gray-700 border border-gray-300 rounded-lg p-2 bg-gray-50 cursor-pointer file:mr-3 file:py-1 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-60"
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

          {/* Режим */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Режим парсинга</label>
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value)}
              disabled={isBusy}
              className="border border-gray-300 rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
            >
              <option value="1">1 — все отзывы</option>
              <option value="2">2 — только с текстом</option>
              <option value="3">3 — остановка при первом пустом</option>
            </select>
          </div>

          <div className="flex justify-center">
            <button
              type="submit"
              disabled={isBusy}
              className={`px-6 py-3 text-white rounded-lg font-semibold transition-colors duration-200 ${
                isBusy
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 cursor-pointer'
              }`}
            >
              {isBusy ? 'Парсер работает...' : '🚀 Запустить парсер'}
            </button>
          </div>
        </form>

        {/* ----- РЕЗУЛЬТАТ + СТАТУС ----- */}
        <section className="mt-8">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Результат</h3>

          {jobId && (
            <div className="mb-3 text-xs text-gray-500">
              <div>
                Job ID: <span className="font-mono">{jobId}</span>
              </div>
              {jobStatus && (
                <div className="mt-1">
                  Статус: <strong>{jobStatus.status}</strong>
                  {typeof jobStatus.processedUrls === 'number' &&
                    typeof jobStatus.totalUrls === 'number' &&
                    jobStatus.totalUrls > 0 && (
                      <span className="ml-2">
                        ({jobStatus.processedUrls}/{jobStatus.totalUrls} товаров)
                      </span>
                    )}
                </div>
              )}
              {!jobStatus && <div className="mt-1">Запрашиваем статус...</div>}
            </div>
          )}

          {!resp ? (
            <div className="bg-gray-100 p-4 rounded-lg text-gray-600 text-sm">
              — Результаты появятся здесь —
            </div>
          ) : resp.error ? (
            <div className="bg-red-50 border border-red-300 text-red-800 p-4 rounded-lg whitespace-pre-wrap">
              <strong className="block mb-1">Ошибка:</strong>
              {resp.error}
              {resp.s3OutputUrl && (
                <a
                  href={resp.s3OutputUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block mt-3 text-blue-600 hover:text-blue-800 font-semibold underline break-all"
                >
                  Скачать Excel-файл (с ошибкой)
                </a>
              )}
            </div>
          ) : resp.success && resp.s3OutputUrl ? (
            <div className="bg-green-50 border border-green-300 text-green-800 p-4 rounded-lg text-sm text-center">
              <p className="mb-2 font-medium">✅ Парсинг успешно завершён!</p>
              <a
                href={resp.s3OutputUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block text-blue-600 hover:text-blue-800 font-semibold underline break-all"
              >
                Скачать Excel-файл
              </a>
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-300 text-yellow-800 p-4 rounded-lg text-sm">
              Ответ получен, но ссылка не найдена.
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
