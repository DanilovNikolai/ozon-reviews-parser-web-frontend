'use client';

import { useEffect } from 'react';

const STORAGE_KEY = 'ozon_links';

export function useLinksStorage(links, setLinks, jobStatus) {
  // === Инициализация при загрузке страницы ===
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const arr = JSON.parse(saved);
        if (Array.isArray(arr) && arr.length > 0) {
          setLinks(arr);
        }
      }
    } catch {}
  }, []);

  // === Автосохранение ссылок при каждом изменении ===
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(links));
    } catch {}
  }, [links]);

  // === Очистка после полного завершения процесса ===
  useEffect(() => {
    if (!jobStatus) {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [jobStatus]);
}
