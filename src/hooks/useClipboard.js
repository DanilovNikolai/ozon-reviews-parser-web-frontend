'use client';

import { useEffect, useState } from 'react';

export function useClipboard(links, setLinks, jobStatus, inputRef) {
  const [clipboardUrl, setClipboardUrl] = useState(null);

  // ----- Добавление ссылки -----
  function acceptClipboardLink() {
    setLinks((prev) => (prev.includes(clipboardUrl) ? prev : [...prev, clipboardUrl]));
    setClipboardUrl(null);
  }

  // ----- Отклонение ссылки -----
  function declineClipboardLink() {
    setClipboardUrl(null);
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
        if (!trimmed.startsWith('https://www.ozon.ru/product/')) return;

        if (links.includes(trimmed)) return;

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
  }, [links, jobStatus, inputRef]);

  return {
    clipboardUrl,
    acceptClipboardLink,
    declineClipboardLink,
  };
}
