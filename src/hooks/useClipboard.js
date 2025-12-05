'use client';

import { useEffect, useState, useRef } from 'react';

export function useClipboard(links, setLinks, jobStatus, inputRef) {
  const [clipboardUrl, setClipboardUrl] = useState(null);

  // Храним предыдущий текст буфера
  const lastClipboardText = useRef('');
  // Храним ссылку, для которой popup уже показывался после последнего копирования
  const lastPopupShownFor = useRef('');

  function acceptClipboardLink() {
    setLinks((prev) => (prev.includes(clipboardUrl) ? prev : [...prev, clipboardUrl]));
    lastPopupShownFor.current = clipboardUrl;
    setClipboardUrl(null);

    if (inputRef?.current) {
      setTimeout(() => inputRef.current.focus(), 50);
    }
  }

  function declineClipboardLink() {
    lastPopupShownFor.current = clipboardUrl;
    setClipboardUrl(null);

    if (inputRef?.current) {
      setTimeout(() => inputRef.current.focus(), 50);
    }
  }

  useEffect(() => {
    async function checkClipboard() {
      if (typeof navigator === 'undefined') return;
      if (!navigator.clipboard?.readText) return;

      try {
        const text = await navigator.clipboard.readText();
        if (!text) return;

        const trimmed = text.trim();
        if (!trimmed.startsWith('https://www.ozon.ru/product/')) return;

        // 1. Это новая попытка копирования?
        if (trimmed === lastClipboardText.current) {
          return;
        }

        // Обновили значение — пользователь что-то скопировал заново
        lastClipboardText.current = trimmed;

        // 2. Если ссылка уже в списке — popup не нужен
        if (links.includes(trimmed)) return;

        // 3. Если popup уже показывался для этой ссылки после последнего копирования
        if (lastPopupShownFor.current === trimmed) return;

        // 4. Показываем popup
        setClipboardUrl(trimmed);
      } catch {}
    }

    // Проверяем буфер при фокусе/возврате на вкладку
    function handleVisible() {
      if (document.visibilityState === 'visible') {
        if (!jobStatus && inputRef.current) inputRef.current.focus();
        checkClipboard();
      }
    }

    function handleFocus() {
      if (!jobStatus && inputRef.current) inputRef.current.focus();
      checkClipboard();
    }

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisible);

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisible);
    };
  }, [links, jobStatus, inputRef]);

  return {
    clipboardUrl,
    acceptClipboardLink,
    declineClipboardLink,
  };
}
