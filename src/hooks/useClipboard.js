'use client';

import { useEffect, useState } from 'react';

export function useClipboard(links, setLinks, jobStatus, inputRef) {
  const [clipboardUrl, setClipboardUrl] = useState(null);

  // ----- Добавление ссылки -----
  function acceptClipboardLink() {
    setLinks((prev) => (prev.includes(clipboardUrl) ? prev : [...prev, clipboardUrl]));
    setClipboardUrl(null);

    // Возвращаем фокус
    if (inputRef?.current) {
      setTimeout(() => inputRef.current.focus(), 50);
    }
  }

  // ----- Отклонение ссылки -----
  function declineClipboardLink() {
    setClipboardUrl(null);

    if (inputRef?.current) {
      setTimeout(() => inputRef.current.focus(), 50);
    }
  }

  // ----- Основной обработчик -----
  useEffect(() => {
    async function checkClipboard() {
      if (typeof navigator === 'undefined') return;
      if (!navigator.clipboard?.readText) return;

      try {
        const text = await navigator.clipboard.readText();
        if (!text) return;

        const trimmed = text.trim();

        // --- Проверка: ссылка Ozon ---
        if (!trimmed.startsWith('https://www.ozon.ru/product/')) return;

        // --- Не показывать popup, если ссылка уже есть ---
        if (links.includes(trimmed)) {
          // Если popup открыт, но ссылка уже есть — закрываем
          if (clipboardUrl === trimmed) {
            setClipboardUrl(null);
          }
          return;
        }

        // --- Если ссылка новая — показываем popup ---
        setClipboardUrl(trimmed);
      } catch {}
    }

    // При загрузке страницы
    checkClipboard();

    // При возвращении на вкладку
    function handleVisible() {
      if (document.visibilityState === 'visible') {
        if (!jobStatus && inputRef.current) inputRef.current.focus();
        checkClipboard();
      }
    }

    // При фокусе окна
    function handleFocus() {
      if (!jobStatus && inputRef.current) inputRef.current.focus();
      checkClipboard();
    }

    document.addEventListener('visibilitychange', handleVisible);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisible);
      window.removeEventListener('focus', handleFocus);
    };
  }, [links, jobStatus, inputRef, clipboardUrl]);

  return {
    clipboardUrl,
    acceptClipboardLink,
    declineClipboardLink,
  };
}
