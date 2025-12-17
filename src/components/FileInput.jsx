import toast from 'react-hot-toast';

export default function FileInput({ file, setFile, loading }) {
  function clearFile() {
    setFile(null);
    if (typeof document !== 'undefined') {
      const el = document.getElementById('fileInput');
      if (el) el.value = '';
    }
    toast('🗑 Файл очищен');
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Или загрузить файл (.xlsx)
      </label>

      <div className="flex gap-2 items-center">
        <input
          id="fileInput"
          type="file"
          accept=".txt,.xlsx"
          disabled={loading}
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="flex-grow text-gray-700 border border-gray-300 rounded-lg p-2 bg-gray-50 cursor-pointer file:mr-3 file:py-1 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-60"
        />

        {file && (
          <button
            type="button"
            onClick={clearFile}
            className="px-3 py-3 text-sm bg-gray-50 border border-gray-300 rounded-lg hover:bg-gray-200 transition cursor-pointer"
          >
            🗑 Очистить
          </button>
        )}
      </div>
    </div>
  );
}
