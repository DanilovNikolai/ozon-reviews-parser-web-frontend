import { useState } from 'react';
import toast from 'react-hot-toast';

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
      <label className="block text-sm font-medium text-gray-700 mb-1">Добавить ссылку</label>
      <div className="flex gap-2">
        <input
          ref={inputRef}
          value={inputLink}
          onChange={(e) => setInputLink(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleAddLink}
          type="text"
          className="flex-grow border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
          placeholder="https://www.ozon.ru/product/..."
        />

        <button
          type="button"
          onClick={clearLinks}
          disabled={!links.length || loading}
          className={`px-3 py-2 text-sm rounded-lg border transition ${
            links.length && !loading
              ? 'bg-gray-100 hover:bg-gray-200 border-gray-300 cursor-pointer'
              : 'bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed'
          }`}
        >
          🧹 Очистить
        </button>
      </div>

      {links.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2 bg-gray-50 border border-gray-200 rounded-md p-3">
          {links.map((link, i) => (
            <span
              key={i}
              className="inline-flex items-center text-xs font-medium bg-green-100 text-green-800 px-3 py-1 rounded-full border border-green-300"
            >
              ✅ {link}
              <button
                type="button"
                onClick={() => removeLink(link)}
                className="ml-2 text-red-500 hover:text-red-700 cursor-pointer"
              >
                ✕
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
