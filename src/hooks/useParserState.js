import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const POLLING_INTERVAL = 5000;

export function useParserState(userId) {
  const [loading, setLoading] = useState(false);
  const [resp, setResp] = useState(null);
  const [jobId, setJobId] = useState(null);
  const [jobStatus, setJobStatus] = useState(null);
  const [jobTimer, setJobTimer] = useState(Date.now());
  const [jobCancelling, setJobCancelling] = useState(false);

  function getJobStorageKey(userId) {
    return userId ? `ozonParserJobId:${userId}` : null;
  }

  // === ВОССТАНОВЛЕНИЕ РЕЗУЛЬТАТА ===
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!userId) {
      setJobId(null);
      setJobStatus(null);
      setResp(null);
      setLoading(false);
      setJobCancelling(false);
      return;
    }

    const savedJobId = window.localStorage.getItem(getJobStorageKey(userId));
    if (savedJobId) {
      setJobId(savedJobId);
      setLoading(true);
      toast('🔄 Восстанавливаем статус предыдущего парсинга...');
    } else {
      setJobId(null);
      setJobStatus(null);
    }
  }, [userId]);

  // === ТАЙМЕР ===
  useEffect(() => {
    if (!jobId) return;
    const id = setInterval(() => setJobTimer(Date.now()), 1000);
    return () => clearInterval(id);
  }, [jobId]);

  // === ЗАПУСК ПАРСИНГА ===
  async function startParsing(mode, links, file) {
    if (!links.length && !file) {
      toast('Добавьте хотя бы одну ссылку или файл');
      return;
    }

    if (jobId) {
      toast('Процесс уже запущен. Сначала остановите его.');
      return;
    }

    // === Очищаем предыдущий результат ===
    setResp(null);

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
        if (userId) {
          window.localStorage.setItem(getJobStorageKey(userId), res.data.jobId);
        }
      }

      toast('🚀 Парсер запущен!');
    } catch (err) {
      setLoading(false);
      toast.error('Ошибка запуска');
      setResp({
        success: false,
        error: err.response?.data?.error || err.message || 'Ошибка запуска парсинга',
      });
    }
  }

  // === ЗАВЕРШЕНИЕ ПРОЦЕССА ===
  const finishProcess = useCallback(
    (info) => {
      setLoading(false);
      setResp(info);

      if (info.cancelled) toast('⏹ Парсинг отменён');
      else if (info.success) toast.success('Парсинг успешно завершён!');
      else toast.error('Парсинг завершён с ошибкой');

      if (userId) {
        localStorage.removeItem(getJobStorageKey(userId));
      }

      setJobId(null);
    },
    [userId]
  );

  // === ОТМЕНА ПАРСИНГА ===
  async function cancelParsing() {
    if (!jobId) return;

    try {
      setJobCancelling(true);
      await axios.post('/api/status', { jobId, action: 'cancel' });
      toast('⏹ Запросили остановку...');
    } catch (e) {
      toast.error('Не удалось отправить отмену');
    } finally {
      setJobCancelling(false);
    }
  }

  // === ПОЛЛИНГ СТАТУСА ===
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

        const { status, s3OutputUrl } = data;

        if (status === 'completed') {
          finishProcess({ success: true, s3OutputUrl, finishedAt: data.updatedAt });
        } else if (status === 'error') {
          finishProcess({
            success: false,
            error:
              data.error ||
              jobStatus?.error ||
              'Waiting for selector `[data-widget="webListReviews"]` failed',
            s3OutputUrl,
            finishedAt: data.updatedAt,
          });
        } else if (status === 'cancelled') {
          finishProcess({ cancelled: true, s3OutputUrl, finishedAt: data.updatedAt });
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
  }, [jobId, finishProcess, jobStatus?.error]);

  return {
    loading,
    resp,
    jobId,
    jobStatus,
    jobTimer,
    jobCancelling,
    startParsing,
    cancelParsing,
  };
}
