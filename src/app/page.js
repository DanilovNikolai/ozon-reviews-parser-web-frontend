'use client';

import { useState, useRef, useEffect } from 'react';
import { useParserState } from '@/hooks/useParserState';
import { Toaster } from 'react-hot-toast';

import FileInput from '@/components/FileInput';
import LinksInput from '@/components/LinksInput';
import ModeSelect from '@/components/ModeSelect';
import FormButton from '@/components/FormButton';
import ProcessInfo from '@/components/ProcessInfo';
import ResultInfo from '@/components/ResultInfo';
import ClipboardPopup from '@/components/ClipboardPopup';

export default function HomePage() {
  const [links, setLinks] = useState([]);
  const [file, setFile] = useState(null);
  const [mode, setMode] = useState('3');

  const inputRef = useRef(null);
  const [clipboardUrl, setClipboardUrl] = useState(null);

  const { loading, resp, jobId, jobStatus, jobTimer, jobCancelling, startParsing, cancelParsing } =
    useParserState();

  const handleSubmitForm = (e) => {
    e.preventDefault();
    startParsing(mode, links, file);
  };

  // автофокус, когда нет активной задачи
  useEffect(() => {
    if (!jobStatus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [jobStatus]);

  // проверка буфера обмена
  useEffect(() => {
    async function checkClipboard() {
      if (typeof navigator === 'undefined') return;
      if (!navigator.clipboard?.readText) return;

      try {
        const text = await navigator.clipboard.readText();
        if (!text) return;

        const trimmed = text.trim();
        if (!trimmed.startsWith('https://www.ozon.ru/product/')) return;

        // если такая ссылка уже есть — не показываем попап
        if (links.includes(trimmed)) return;

        setClipboardUrl(trimmed);
      } catch {
        // молча игнорируем — браузер мог не дать доступ
      }
    }

    // при первом рендере
    checkClipboard();

    // при возврате на вкладку / окно
    function handleVisible() {
      if (document.visibilityState === 'visible') {
        if (!jobStatus && inputRef.current) {
          inputRef.current.focus();
        }
        checkClipboard();
      }
    }

    function handleWindowFocus() {
      if (!jobStatus && inputRef.current) {
        inputRef.current.focus();
      }
      checkClipboard();
    }

    document.addEventListener('visibilitychange', handleVisible);
    window.addEventListener('focus', handleWindowFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisible);
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, [links, jobStatus]);

  // принять ссылку из буфера
  function acceptClipboardLink() {
    setLinks((prev) => {
      if (prev.includes(clipboardUrl)) return prev;
      return [...prev, clipboardUrl];
    });
    setClipboardUrl(null);
  }

  function declineClipboardLink() {
    setClipboardUrl(null);
  }

  return (
    <main className="min-h-screen flex flex-col items-center py-12 bg-gray-50 relative">
      <Toaster position="top-right" toastOptions={{ duration: 2500 }} />

      <ClipboardPopup
        url={clipboardUrl}
        onAccept={acceptClipboardLink}
        onDecline={declineClipboardLink}
      />

      <div className="w-full max-w-2xl bg-white shadow-md rounded-xl p-8">
        <h1 className="text-3xl font-bold mb-4 text-blue-600 text-center">
          🧩 Ozon Reviews Parser
        </h1>

        <form onSubmit={handleSubmitForm} className="space-y-6">
          <LinksInput links={links} setLinks={setLinks} loading={loading} inputRef={inputRef} />

          <FileInput file={file} setFile={setFile} loading={loading} />
          <ModeSelect mode={mode} setMode={setMode} loading={loading} />

          <FormButton
            jobId={jobId}
            jobCancelling={jobCancelling}
            cancelParsing={cancelParsing}
            loading={loading}
            jobStatus={jobStatus}
          />
        </form>

        <ProcessInfo jobId={jobId} jobStatus={jobStatus} jobTimer={jobTimer} />
        <ResultInfo resp={resp} />
      </div>
    </main>
  );
}
