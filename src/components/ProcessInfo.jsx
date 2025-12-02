import { useState } from 'react';
import { formatStatusRu, formatDuration, statusColorMap } from '../utils/format';

export default function ProcessInfo({ jobId, jobStatus, jobTimer }) {
  const [showStatus, setShowStatus] = useState(true);

  if (!jobStatus) return null;

  const isQueued = jobStatus.status === 'queued';
  const isActive = ['downloading', 'parsing'].includes(jobStatus.status);

  // ===== ВРЕМЯ =====
  let elapsedSeconds = 0;

  if (isQueued) {
    // Время ожидания: от createdAt до "сейчас"
    const start = jobStatus.createdAt;
    const end = jobTimer;
    elapsedSeconds = (end - start) / 1000;
  } else if (isActive) {
    // Время работы: от startedAt (или createdAt) до "сейчас"
    const start = jobStatus.startedAt || jobStatus.createdAt;
    const end = jobTimer;
    elapsedSeconds = (end - start) / 1000;
  } else {
    // Завершено: от startedAt (или createdAt) до updatedAt
    const start = jobStatus.startedAt || jobStatus.createdAt;
    const end = jobStatus.updatedAt;
    elapsedSeconds = (end - start) / 1000;
  }

  const timeLabel = isQueued ? 'Время ожидания:' : isActive ? 'Время работы:' : 'Завершено за:';

  // ===== ОЧЕРЕДЬ =====
  const queueText = isQueued ? `Перед вами: ${jobStatus.humanQueuePosition} задач` : null;

  const totalReviewsCount = jobStatus?.totalReviewsCount || 0;
  const collectedReviews = jobStatus?.collectedReviews || 0;

  const progressReviewsText =
    totalReviewsCount > 0
      ? `${collectedReviews} / ${totalReviewsCount}`
      : collectedReviews > 0
      ? `${collectedReviews}`
      : '—';

  const urlsProgressText =
    jobStatus?.totalUrls > 0 ? `${jobStatus.processedUrls} / ${jobStatus.totalUrls}` : '—';

  const shortProcessLabel = jobStatus.id
    ? jobStatus.id.split('_')[0]
    : jobId
    ? jobId.split('_')[0]
    : '—';

  return (
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
            Процесс id: <b>{shortProcessLabel}</b>
          </div>

          {/* Статус */}
          <div>
            Статус:{' '}
            <b className={statusColorMap[jobStatus.status]}>{formatStatusRu(jobStatus.status)}</b>
            {isQueued && <span className="ml-2 text-blue-600 font-semibold">({queueText})</span>}
          </div>

          {/* Доп. инфа — только если не queued */}
          {!isQueued && (
            <>
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
            </>
          )}

          {/* Время */}
          <div className="mt-1 text-gray-600">
            {timeLabel} <b>{formatDuration(elapsedSeconds)}</b>
          </div>
        </div>
      )}
    </section>
  );
}
