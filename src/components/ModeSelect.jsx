export default function ModeSelect({ mode, setMode, loading }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Режим парсинга</label>
      <select
        value={mode}
        onChange={(e) => setMode(e.target.value)}
        disabled={loading}
        className="border border-gray-300 rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
      >
        <option value="1">полный проход / сбор всех отзывов</option>
        <option value="2">полный проход / сбор отзывов только с текстом</option>
        <option value="3">быстрый проход / сбор отзывов только с текстом (рекомендуется)</option>
      </select>
    </div>
  );
}
