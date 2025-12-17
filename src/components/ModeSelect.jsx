export default function ModeSelect({ mode, setMode, loading }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Режим парсинга</label>

      <div className="relative">
        <select
          value={mode}
          onChange={(e) => setMode(e.target.value)}
          disabled={loading}
          className="
            w-full
            appearance-none
            border border-gray-300
            rounded-lg
            bg-gray-50
            px-3 py-2 pr-9

            text-sm sm:text-base
            leading-snug
            text-gray-800

            cursor-pointer
            focus:outline-none
            focus:ring-1 focus:ring-blue-600/40
            hover:border-gray-400

            disabled:bg-gray-100
            disabled:text-gray-500
            disabled:cursor-not-allowed
          "
        >
          <option value="1">1 — полный проход / сбор всех отзывов</option>
          <option value="2">2 — сбор отзывов только с текстом</option>
          <option value="3">3 — быстрый проход (рекомендуется)</option>
        </select>

        {/* стрелка */}
        <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
          <svg className="h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
