import toast from 'react-hot-toast';
import ClearButton from './ui/ClearButton';
import Input from './ui/Input';

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
      <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="fileInput">
        Или загрузить файл (.xlsx)
      </label>

      <div className="flex flex-col sm:flex-row gap-2">
        <Input
          id="fileInput"
          type="file"
          accept=".txt,.xlsx"
          disabled={loading}
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />

        {file && (
          <ClearButton type="button" onClick={clearFile} className="bg-gray-50 text-nowrap">
            🗑 Очистить
          </ClearButton>
        )}
      </div>
    </div>
  );
}
