// СТАТУСЫ ПРОЦЕССА
export function formatStatusRu(status) {
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
export function formatDuration(secondsRaw) {
  const seconds = Math.max(0, Math.floor(secondsRaw || 0));
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m === 0 ? `${s} сек` : `${m} мин ${s.toString().padStart(2, '0')} сек`;
}

// ЦВЕТА ДЛЯ СТАТУСОВ
export const statusColorMap = {
  queued: 'text-gray-600',
  downloading: 'text-blue-600',
  parsing: 'text-blue-600',
  completed: 'text-green-600',
  error: 'text-red-600',
  cancelled: 'text-yellow-600',
};
