import { useState } from 'react';
import toast from 'react-hot-toast';
import ClearButton from './ui/ClearButton';
import Input from './ui/Input';

const ozonRegex = /^https:\/\/www\.ozon\.ru\/product\/[\w-]+/i;

export default function LinksInput({ links, setLinks, loading, inputRef }) {
  const [inputLink, setInputLink] = useState('');

  function handleAddLink() {
    const trimmed = inputLink.trim();
    if (!trimmed) return;

    if (!ozonRegex.test(trimmed)) {
      toast.error('Некорректная ссылка');
      setInputLink('');
      return;
    }

    if (links.includes(trimmed)) {
      toast('⚠ Такая ссылка уже есть');
      setInputLink('');
      return;
    }

    setLinks([...links, trimmed]);
    setInputLink('');
    toast.success('Добавлено');
  }

  function clearLinks() {
    setLinks([]);
    toast('🧹 Ссылки очищены');
  }

  function removeLink(link) {
    setLinks(links.filter((x) => x !== link));
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddLink();
    }
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="links">
        {links.length > 0 ? (
          <span>Добавлено ссылок: {links.length}</span>
        ) : (
          <span>Добавить ссылку</span>
        )}
      </label>

      <div className="flex flex-col sm:flex-row gap-2">
        <Input
          id="links"
          ref={inputRef}
          value={inputLink}
          onChange={(e) => setInputLink(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleAddLink}
          placeholder="https://www.ozon.ru/product/..."
          mono
        />

        <ClearButton type="button" onClick={clearLinks} disabled={!links.length || loading}>
          🧹 Очистить
        </ClearButton>
      </div>

      {links.length > 0 && (
        <div className="mt-3 max-h-40 overflow-y-auto rounded-lg p-2 space-y-2">
          {links.map((link, i) => (
            <div
              key={i}
              className="flex items-center justify-between gap-2 rounded-md bg-green-50 border border-green-200 px-3 py-1.5 text-xs"
            >
              <span className="truncate text-green-800 font-mono" title={link}>
                {link}
              </span>

              <button
                type="button"
                onClick={() => removeLink(link)}
                className="text-red-500 hover:text-red-700 cursor-pointer flex-shrink-0"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
