export default function FormButton({ jobId, jobCancelling, cancelParsing, loading }) {
  return (
    <div className="flex justify-center">
      {jobId ? (
        <button
          type="button"
          onClick={cancelParsing}
          disabled={jobCancelling}
          className={`px-6 py-3 text-white rounded-lg font-semibold transition-colors duration-200 ${
            jobCancelling
              ? 'bg-red-300 cursor-not-allowed'
              : 'bg-red-600 hover:bg-red-700 cursor-pointer'
          }`}
        >
          {jobCancelling ? 'Отмена...' : '⏹ Остановить парсер'}
        </button>
      ) : (
        <button
          type="submit"
          disabled={loading}
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
