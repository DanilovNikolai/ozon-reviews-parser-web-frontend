'use client';

import { useEffect, useState } from 'react';

export default function ClipboardPopup({ url, onAccept, onDecline }) {
  const [visible, setVisible] = useState(!!url);

  // При появлении новой ссылки — показываем popup
  useEffect(() => {
    setVisible(!!url);

    if (!url) return;

    // Авто-скрытие через 5 секунд (с fade-out)
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onDecline(), 300);
    }, 5000);

    return () => clearTimeout(timer);
  }, [url]);

  if (!url || !visible) return null;

  return (
    <div
      className="
        fixed bottom-6 right-6 
        bg-white shadow-lg border border-gray-300 rounded-lg p-4 z-50 w-72
        transition-opacity duration-300 ease-in-out
        animate-fadeIn
      "
      style={{
        animation: 'fadeIn 0.3s ease-out',
      }}
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
          onClick={() => {
            setVisible(false);
            setTimeout(onDecline, 250);
          }}
          className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md border"
        >
          Нет
        </button>

        <button
          onClick={() => {
            setVisible(false);
            setTimeout(onAccept, 250);
          }}
          className="px-3 py-1 text-sm bg-blue-600 text-white hover:bg-blue-700 rounded-md"
        >
          Добавить
        </button>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
