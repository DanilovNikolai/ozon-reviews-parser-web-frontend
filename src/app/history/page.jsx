'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { useAuthState } from '@/hooks/useAuthState';

export default function HistoryPage() {
  const { user, loading: authLoading } = useAuthState();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  // ====== Заглушка для неавторизованных ======
  if (!authLoading && !user) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-6 rounded-xl shadow text-center space-y-3">
          <h2 className="text-lg font-semibold">Вы не авторизованы</h2>
          <p className="text-sm text-gray-600">
            История запусков доступна только авторизованным пользователям
          </p>
          <Link href="/" className="inline-block text-blue-600 underline font-medium">
            ← Вернуться на главную
          </Link>
        </div>
      </main>
    );
  }

  // ====== Загрузка ======
  if (authLoading || loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Загрузка истории...</p>
      </main>
    );
  }

  // ====== Ошибка ======
  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center text-red-600">{error}</main>
    );
  }

  // ====== Основной UI ======
  return (
    <main className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-5xl mx-auto bg-white rounded-xl shadow p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">История запусков</h1>

        {jobs.length === 0 ? (
          <p className="text-gray-600 text-sm">У вас пока нет запусков парсинга</p>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => (
              <div key={job.id} className="border border-gray-200 rounded-lg p-4 text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="font-semibold">Запуск #{job.id}</span>
                  <span className="text-gray-500">{job.createdAtHuman}</span>
                </div>

                <div>Режим: {job.mode}</div>
                <div>Статус: {job.status}</div>

                <div>
                  Ссылок: {job.totalUrls}, отзывов: {job.collectedReviews}
                </div>

                {job.durationSeconds !== null && (
                  <div>Время обработки: {job.durationSeconds} сек</div>
                )}

                {job.outputFileUrl && (
                  <a
                    href={job.outputFileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline font-medium break-all"
                  >
                    Скачать результат
                  </a>
                )}

                {job.error && <div className="text-red-600">Ошибка: {job.error}</div>}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
