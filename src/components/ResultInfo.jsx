export default function ResultInfo({ resp }) {
  return (
    <section className="mt-6">
      <h3 className="text-lg font-semibold text-gray-700 mb-2">Результат</h3>

      {/* НЕТ РЕЗУЛЬТАТА */}
      {!resp ? (
        <div className="bg-gray-50 p-4 rounded-lg text-gray-600 text-sm border border-gray-300">
          — Результаты появятся здесь —
        </div>
      ) : resp.cancelled ? (
        /* ОТМЕНА */
        <div className="bg-yellow-50 border border-yellow-300 text-yellow-800 p-4 rounded-lg text-sm text-center">
          <p className="mb-2 font-medium">⚠ Парсинг отменён пользователем</p>

          {resp.finishedAt && (
            <p className="text-xs text-gray-500 mb-2">
              Завершено: {new Date(resp.finishedAt).toLocaleString()}
            </p>
          )}

          {resp.s3OutputUrl && (
            <a
              href={resp.s3OutputUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-blue-600 hover:text-blue-800 font-semibold underline break-all"
            >
              Скачать Excel-файл (неполный)
            </a>
          )}
        </div>
      ) : resp.error ? (
        /* ОШИБКА */
        <div className="bg-red-50 border border-red-300 text-red-800 p-4 rounded-lg whitespace-pre-wrap text-sm">
          <strong className="block mb-1">Ошибка:</strong>
          {resp.error}

          {resp.finishedAt && (
            <p className="text-xs text-gray-500 mt-2">
              Завершено: {new Date(resp.finishedAt).toLocaleString()}
            </p>
          )}

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
      ) : resp.success ? (
        /* УСПЕХ */
        <div className="bg-green-50 border border-green-300 text-green-800 p-4 rounded-lg text-sm text-center">
          <p className="mb-2 font-medium">✅ Парсинг успешно завершён!</p>

          {resp.finishedAt && (
            <p className="text-xs text-gray-500 mb-2">
              Завершено: {new Date(resp.finishedAt).toLocaleString()}
            </p>
          )}

          {resp.s3OutputUrl ? (
            <a
              href={resp.s3OutputUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-blue-600 hover:text-blue-800 font-semibold underline break-all"
            >
              Скачать Excel-файл
            </a>
          ) : (
            <p className="text-yellow-700 text-sm mt-2">Ссылка на файл отсутствует.</p>
          )}
        </div>
      ) : (
        /* НЕОЖИДАННЫЙ СЛУЧАЙ */
        <div className="bg-yellow-50 border border-yellow-300 text-yellow-800 p-4 rounded-lg text-sm">
          Ответ получен, но ссылка не найдена.
        </div>
      )}
    </section>
  );
}
