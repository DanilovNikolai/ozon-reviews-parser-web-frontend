'use client';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { useAuth } from '@/app/context/AuthContext';
import { formatStatusRu, formatDuration, statusColorMap } from '@/utils/format';
import MainWrapper from '@/components/MainWrapper';
import { normalizeParserError } from '@/utils/normalizeError';

export default function HistoryPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedJobId, setExpandedJobId] = useState(null);
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    setJobs([]);
    setError(null);
    setExpandedJobId(null);
    setLoading(true);

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
  }, [user?.id]);

  function toggleJob(id) {
    setExpandedJobId((prev) => (prev === id ? null : id));
  }

  // ===== Заглушка =====
  if (!authLoading && !user) {
    return (
      <MainWrapper className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-3 max-w-sm w-full">
          <h2 className="text-lg font-semibold">Вы не авторизованы</h2>
          <p className="text-sm text-gray-600">
            История запусков доступна только авторизованным пользователям
          </p>
          <Link href="/" className="text-blue-600 font-medium">
            ← Вернуться на главную
          </Link>
        </div>
      </MainWrapper>
    );
  }

  if (authLoading || loading) {
    return (
      <MainWrapper className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Загрузка истории…</p>
      </MainWrapper>
    );
  }

  if (error) {
    return (
      <MainWrapper className="min-h-screen flex items-center justify-center text-red-600 px-4">
        {error}
      </MainWrapper>
    );
  }

  return (
    <MainWrapper>
      <div>
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

                    {job.error &&
                      (() => {
                        const err = normalizeParserError(job.error);
                        return (
                          <div
                            className={
                              err.severity === 'error' ? 'text-red-600' : 'text-yellow-700'
                            }
                          >
                            Ошибка: {err.message}
                          </div>
                        );
                      })()}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </MainWrapper>
  );
}
