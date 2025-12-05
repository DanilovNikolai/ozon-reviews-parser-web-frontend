'use client';

import { useEffect, useState } from 'react';

export default function ClipboardPopup({ url, onAccept, onDecline }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!url) {
      setVisible(false);
      return;
    }

    setVisible(true);

    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(() => {
        onDecline();
      }, 300);
    }, 5000);

    return () => clearTimeout(timer);
  }, [url, onDecline]);

  if (!url) return null;

  const handleClose = (cb) => {
    setVisible(false);
    setTimeout(cb, 250);
  };

  return (
    <div
      className={`
        fixed bottom-6 right-6 z-50 w-72
        bg-white shadow-lg border border-gray-300 rounded-lg p-4
        transform transition-all duration-300 ease-in-out
        ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}
      `}
    >
      <p className="text-sm text-gray-800 mb-3">
        Найдена ссылка в буфере обмена:
        <br />
        <span className="text-blue-600 break-all">{url}</span>
        <br />
        Добавить?
      </p>

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={() => handleClose(onDecline)}
          className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md border"
        >
          Нет
        </button>

        <button
          type="button"
          onClick={() => handleClose(onAccept)}
          className="px-3 py-1 text-sm bg-blue-600 text-white hover:bg-blue-700 rounded-md"
        >
          Добавить
        </button>
      </div>
    </div>
  );
}
