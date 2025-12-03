export default function FormButton({ jobId, cancelParsing, loading, jobStatus }) {
  const status = jobStatus?.status;

  const isQueued = status === 'queued';
  const isActive = status === 'downloading' || status === 'parsing' || status === 'cancelling';

  const canStartNew =
    !jobId || status === 'completed' || status === 'cancelled' || status === 'error';

  return (
    <div className="flex justify-center">
      {isActive || isQueued ? (
        <button
          type="button"
          onClick={cancelParsing}
          disabled={status === 'cancelling'}
          className={`px-6 py-3 text-white rounded-lg font-semibold transition-colors duration-200 ${
            status === 'cancelling'
              ? 'bg-red-300 cursor-not-allowed'
              : 'bg-red-600 hover:bg-red-700 cursor-pointer'
          }`}
        >
          {status === 'cancelling' ? 'Отмена...' : '⏹ Остановить парсер'}
        </button>
      ) : (
        <button
          type="submit"
          disabled={loading || !canStartNew}
          className={`px-6 py-3 text-white rounded-lg font-semibold transition-colors duration-200 ${
            loading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 cursor-pointer'
          }`}
        >
          {loading ? 'Парсер работает...' : '🚀 Запустить парсер'}
        </button>
      )}
    </div>
  );
}
