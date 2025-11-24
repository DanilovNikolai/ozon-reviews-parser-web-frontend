'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';

const POLLING_INTERVAL = 5000;

// СТАТУСЫ ПРОЦЕССА
function formatStatusRu(status) {
  const map = {
    queued: 'в очереди',
    downloading: 'загрузка файла',
    parsing: 'сбор данных',
    completed: 'успешно завершено',
    error: 'ошибка',
    cancelled: 'отменено',
  };
  return map[status] ?? status ?? '—';
}

// ВРЕМЯ В МИН/СЕК
function formatDuration(secondsRaw) {
  const seconds = Math.max(0, Math.floor(secondsRaw || 0));
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m === 0 ? `${s} сек` : `${m} мин ${s.toString().padStart(2, '0')} сек`;
}

// ЦВЕТА ДЛЯ СТАТУСОВ
const statusColorMap = {
  queued: 'text-gray-600',
  downloading: 'text-blue-600',
  parsing: 'text-blue-600',
  completed: 'text-green-600',
  error: 'text-red-600',
  cancelled: 'text-yellow-600',
};

export default function HomePage() {
  const [inputLink, setInputLink] = useState('');
  const [links, setLinks] = useState([]);
  const [file, setFile] = useState(null);
  const [mode, setMode] = useState('3');

  const [loading, setLoading] = useState(false);
  const [resp, setResp] = useState(null);

  const [showStatus, setShowStatus] = useState(true);

  const [jobId, setJobId] = useState(null);
  const [jobStatus, setJobStatus] = useState(null);
  const [nowTs, setNowTs] = useState(Date.now());
  const [cancelling, setCancelling] = useState(false);

  const ozonRegex = /^https:\/\/www\.ozon\.ru\/product\/[\w-]+/i;

  // ВОССТАНОВЛЕНИЕ ЗАДАЧИ
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const savedJobId = window.localStorage.getItem('ozonParserJobId');
    if (savedJobId) {
      setJobId(savedJobId);
      setLoading(true);
      toast('🔄 Восстанавливаем статус предыдущего парсинга...');
    }
  }, []);

  // ТАЙМЕР
  useEffect(() => {
    if (!jobId) return;
    const id = setInterval(() => setNowTs(Date.now()), 1000);
    return () => clearInterval(id);
  }, [jobId]);

  // ПОЛЛИНГ СТАТУСА
  useEffect(() => {
    if (!jobId) return;

    let stop = false;

    async function poll() {
      try {
        const res = await axios.get('/api/status', { params: { jobId } });
        if (stop) return;

        const data = res.data;
        if (!data.success) return;

        setJobStatus(data);

        const { status, s3OutputUrl, error } = data;

        if (status === 'completed') {
          finishProcess({ success: true, s3OutputUrl });
        } else if (status === 'error') {
          finishProcess({ success: false, error, s3OutputUrl });
        } else if (status === 'cancelled') {
          finishProcess({ cancelled: true, s3OutputUrl: null });
        }
      } catch (err) {
        console.error('Ошибка статуса:', err);
      }
    }

    poll();
    const id = setInterval(poll, POLLING_INTERVAL);

    return () => {
      stop = true;
      clearInterval(id);
    };
  }, [jobId]);

  // ЗАВЕРШЕНИЕ ПРОЦЕССА
  function finishProcess(info) {
    setLoading(false);
    setResp(info);

    if (info.cancelled) toast('⏹ Парсинг отменён');
    else if (info.success) toast.success('Парсинг успешно завершён!');
    else toast.error('Парсинг завершён с ошибкой');

    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('ozonParserJobId');
    }
    setJobId(null);
  }

  // ЗАПУСК ПАРСИНГА
  async function onSubmit(e) {
    e.preventDefault();
    setResp(null);

    if (jobId) {
      toast('Процесс уже запущен. Сначала остановите его.');
      return;
    }

    try {
      const form = new FormData();
      form.append('mode', mode);
      form.append('linksText', links.join('\n'));
      if (file) form.append('file', file);

      setLoading(true);

      const res = await axios.post('/api/parse', form);

      if (!res.data.success || !res.data.jobId)
        throw new Error(res.data.error || 'Ошибка запуска парсинга');

      setJobId(res.data.jobId);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('ozonParserJobId', res.data.jobId);
      }
      toast('🚀 Парсер запущен!');
    } catch (err) {
      setLoading(false);
      toast.error('Ошибка запуска');
      setResp({ success: false, error: err.message });
    }
  }

  // ОТМЕНА ПАРСИНГА
  async function handleCancel() {
    if (!jobId) return;

    try {
      setCancelling(true);
      await axios.post('/api/status', { jobId, action: 'cancel' });
      toast('⏹ Запросили остановку...');
    } catch (e) {
      toast.error('Не удалось отправить отмену');
    } finally {
      setCancelling(false);
    }
  }

  // ДОБАВЛЕНИЕ ССЫЛОК
  function handleAddLink() {
    const trimmed = inputLink.trim();
    if (!trimmed) return;

    if (!ozonRegex.test(trimmed)) {
      toast.error('Некорректная ссылка');
      setInputLink('');
      return;
    }

    if (links.includes(trimmed)) {
      toast('⚠ Такая ссылка уже есть');
      setInputLink('');
      return;
    }

    setLinks([...links, trimmed]);
    setInputLink('');
    toast.success('Добавлено');
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddLink();
    }
  }

  function clearLinks() {
    setLinks([]);
    toast('🧹 Ссылки очищены');
  }

  function clearFile() {
    setFile(null);
    if (typeof document !== 'undefined') {
      const el = document.getElementById('fileInput');
      if (el) el.value = '';
    }
    toast('🗑 Файл очищен');
  }

  function removeLink(link) {
    setLinks(links.filter((x) => x !== link));
  }

  // ВЫЧИСЛЕНИЕ ПРОГРЕССА
  const isActive = jobStatus && ['queued', 'downloading', 'parsing'].includes(jobStatus.status);
  const isBusy = loading || !!jobId;

  let elapsedSeconds = 0;
  if (jobStatus) {
    const start = jobStatus.createdAt;
    const end = isActive ? nowTs : jobStatus.updatedAt;
    elapsedSeconds = (end - start) / 1000;
  }

  const timeLabel = isActive ? 'Время работы:' : 'Завершено за:';
  const totalReviewsCount = jobStatus?.totalReviewsCount || 0;
  const collectedReviews = jobStatus?.collectedReviews || 0;
  const progressReviewsText =
    totalReviewsCount > 0
      ? `${collectedReviews} / ${totalReviewsCount}`
      : collectedReviews > 0
      ? `${collectedReviews}`
      : '—';

  const urlsProgressText =
    jobStatus?.totalUrls > 0 ? `${jobStatus.processedUrls}/${jobStatus.totalUrls}` : '—';

  const shortProcessLabel = jobStatus?.id
    ? jobStatus.id.split('_')[0]
    : jobId
    ? jobId.split('_')[0]
    : '—';

  return (
    <main className="min-h-screen flex flex-col items-center py-12 bg-gray-50 relative">
      <Toaster position="top-right" toastOptions={{ duration: 2500 }} />

      <div className="w-full max-w-2xl bg-white shadow-md rounded-xl p-8">
        <h1 className="text-3xl font-bold mb-4 text-blue-600 text-center">
          🧩 Ozon Reviews Parser
        </h1>

        {/*         ФОРМА            */}
        <form onSubmit={onSubmit} className="space-y-6">
          {/* Добавление ссылок */}
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
                {links.map((link, i) => (
                  <span
                    key={i}
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
              <option value="1">полный проход / сбор всех отзывов</option>
              <option value="2">полный проход / сбор отзывов только с текстом</option>
              <option value="3">
                быстрый проход / сбор отзывов только с текстом (рекомендуется)
              </option>
            </select>
          </div>

          {/* Кнопка запуска / отмены */}
          <div className="flex justify-center">
            {jobId ? (
              <button
                type="button"
                onClick={handleCancel}
                disabled={cancelling}
                className={`px-6 py-3 text-white rounded-lg font-semibold transition-colors duration-200 ${
                  cancelling
                    ? 'bg-red-300 cursor-not-allowed'
                    : 'bg-red-600 hover:bg-red-700 cursor-pointer'
                }`}
              >
                {cancelling ? 'Отмена...' : '⏹ Остановить парсер'}
              </button>
            ) : (
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
            )}
          </div>
        </form>

        {/*     ИНФОРМАЦИЯ О ПРОЦЕССЕ */}
        <section className="mt-8">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-700">Информация</h3>

            <button
              type="button"
              onClick={() => setShowStatus(!showStatus)}
              className="text-xs text-blue-600 underline"
            >
              {showStatus ? 'Скрыть' : 'Показать'}
            </button>
          </div>

          {showStatus && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-xs text-gray-700 space-y-1">
              <div>
                Процесс: <b>{shortProcessLabel}</b>
              </div>

              {jobStatus && (
                <div>
                  Статус:{' '}
                  <b className={statusColorMap[jobStatus.status]}>
                    {formatStatusRu(jobStatus.status)}
                  </b>
                </div>
              )}

              <div>Товаров завершено: {urlsProgressText}</div>

              <div>
                В обработке:{' '}
                {jobStatus?.currentUrl ? (
                  <span className="break-all text-gray-800">{jobStatus.currentUrl}</span>
                ) : (
                  '—'
                )}
              </div>

              <div>
                Текущая страница: {jobStatus?.currentPage > 0 ? jobStatus.currentPage : '—'}
              </div>

              <div>Отзывов собрано: {progressReviewsText}</div>

              {jobStatus && (
                <div className="mt-1 text-gray-600">
                  {timeLabel} <b>{formatDuration(elapsedSeconds)}</b>
                </div>
              )}
            </div>
          )}
        </section>

        {/*        РЕЗУЛЬТАТ          */}
        <section className="mt-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Результат</h3>

          {!resp ? (
            <div className="bg-gray-100 p-4 rounded-lg text-gray-600 text-sm">
              — Результаты появятся здесь —
            </div>
          ) : resp.cancelled ? (
            /* ОТМЕНА */
            <div className="bg-yellow-50 border border-yellow-300 text-yellow-800 p-4 rounded-lg text-sm text-center">
              <p className="mb-2 font-medium">⚠ Парсинг отменён пользователем</p>
              {resp.s3OutputUrl && (
                <a
                  href={resp.s3OutputUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block text-blue-600 hover:text-blue-800 font-semibold underline break-all"
                >
                  Скачать Excel-файл (частичные данные)
                </a>
              )}
            </div>
          ) : resp.error ? (
            /* ОШИБКА */
            <div className="bg-red-50 border border-red-300 text-red-800 p-4 rounded-lg whitespace-pre-wrap text-sm">
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
            /* УСПЕХ */
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
