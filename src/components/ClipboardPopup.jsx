export default function ClipboardPopup({ url, onAccept, onDecline }) {
  if (!url) return null;

  return (
    <div className="fixed bottom-6 right-6 bg-white shadow-lg border border-gray-300 rounded-lg p-4 z-50 w-72">
      <p className="text-sm text-gray-800 mb-3">
        Найдена ссылка в буфере обмена:
        <br />
        <span className="text-blue-600 break-all">{url}</span>
        <br />
        Добавить?
      </p>

      <div className="flex justify-end gap-2">
        <button
          onClick={onDecline}
          className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md border"
        >
          Нет
        </button>

        <button
          onClick={onAccept}
          className="px-3 py-1 text-sm bg-blue-600 text-white hover:bg-blue-700 rounded-md"
        >
          Добавить
        </button>
      </div>
    </div>
  );
}
