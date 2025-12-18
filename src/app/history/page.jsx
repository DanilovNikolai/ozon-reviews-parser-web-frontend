'use client';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { useAuthState } from '@/hooks/useAuthState';
import { formatStatusRu, formatDuration, statusColorMap } from '@/utils/format';

export default function HistoryPage() {
  const { user, loading: authLoading } = useAuthState();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedJobId, setExpandedJobId] = useState(null);

  useEffect(() => {
    if (!user) return;

    async function fetchHistory() {
      try {
        const res = await axios.get('/api/history');
        if (!res.data.success) {
          throw new Error(res.data.error || 'Ошибка загрузки истории');
        }
        setJobs(res.data.jobs);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchHistory();
  }, [user]);

  function toggleJob(id) {
    setExpandedJobId((prev) => (prev === id ? null : id));
  }

  // ===== Заглушка =====
  if (!authLoading && !user) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="bg-white p-6 rounded-xl shadow text-center space-y-3 max-w-sm w-full">
          <h2 className="text-lg font-semibold">Вы не авторизованы</h2>
          <p className="text-sm text-gray-600">
            История запусков доступна только авторизованным пользователям
          </p>
          <Link href="/" className="text-blue-600 font-medium">
            ← Вернуться на главную
          </Link>
        </div>
      </main>
    );
  }

  if (authLoading || loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Загрузка истории…</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center text-red-600 px-4">
        {error}
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 py-6 px-3 sm:px-6">
      <div className="max-w-5xl mx-auto bg-white rounded-xl shadow p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">История запусков</h1>

          <Link href="/" className="text-sm text-blue-600 hover:text-blue-800 w-fit">
            ← На главную
          </Link>
        </div>

        {jobs.length === 0 ? (
          <p className="text-gray-600 text-sm">У вас пока нет запусков парсинга</p>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="border border-gray-200 rounded-lg text-sm overflow-hidden"
              >
                {/* ===== СВЁРНУТАЯ ШАПКА ===== */}
                <button
                  onClick={() => toggleJob(job.id)}
                  className="w-full flex items-center justify-between p-3 sm:p-4 bg-gray-50 hover:bg-gray-100 transition cursor-pointer"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3 text-left">
                    <span className="font-semibold">Запуск #{job.id}</span>

                    <span
                      className={`text-xs font-medium ${statusColorMap[job.status.toLowerCase()]}`}
                    >
                      {formatStatusRu(job.status.toLowerCase())}
                    </span>

                    <span className="text-xs text-gray-500">
                      {job.createdAt
                        ? new Date(job.createdAt).toLocaleString('ru-RU', {
                            timeZone: 'Europe/Moscow',
                          })
                        : '—'}
                    </span>
                  </div>

                  <span className="text-gray-400 text-lg">
                    {expandedJobId === job.id ? '▲' : '▼'}
                  </span>
                </button>

                {/* ===== РАСКРЫТОЕ СОДЕРЖИМОЕ ===== */}
                {expandedJobId === job.id && (
                  <div className="p-3 sm:p-4 space-y-2 bg-white">
                    <div>Режим: {job.mode}</div>

                    <div>
                      Ссылок введено: {job.totalUrls}{' '}
                      {job.inputFileUrl && (
                        <a
                          href={job.inputFileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-2 text-blue-600 font-medium break-all"
                        >
                          (скачать)
                        </a>
                      )}
                    </div>

                    <div>Отзывов собрано: {job.collectedReviews}</div>

                    {job.durationSeconds !== null && (
                      <div>Время обработки: {formatDuration(job.durationSeconds)}</div>
                    )}

                    {job.outputFileUrl && (
                      <div>
                        <a
                          href={job.outputFileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 font-medium break-all"
                        >
                          Скачать результат (.xlsx)
                        </a>
                      </div>
                    )}

                    {job.error && <div className="text-red-600">Ошибка: {job.error}</div>}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
