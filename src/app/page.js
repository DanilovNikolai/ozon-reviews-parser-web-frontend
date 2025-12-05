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

import { readClipboard } from '../utils/readClipboard';
import ClipboardPopup from '@/components/ClipboardPopup';

export default function HomePage() {
  const [links, setLinks] = useState([]);
  const [file, setFile] = useState(null);
  const [mode, setMode] = useState('3');
  const [clipboardUrl, setClipboardUrl] = useState(null);
  const inputRef = useRef(null);

  const { loading, resp, jobId, jobStatus, jobTimer, jobCancelling, startParsing, cancelParsing } =
    useParserState();

  // === После рендера проверяем буфер ===
  async function checkClipboard() {
    const url = await readClipboard();
    if (!url) return;

    // Не показываем popup, если такая ссылка уже есть
    if (links.includes(url)) return;

    setClipboardUrl(url);
  }

  // === Первый запуск ===
  useEffect(() => {
    checkClipboard();
  }, []);

  // === Проверка буффера ссылок при возвращении на вкладку ===
  useEffect(() => {
    const handler = () => {
      if (document.visibilityState === 'visible') {
        if (!jobStatus && inputRef.current) {
          inputRef.current.focus();
        }
        checkClipboard();
      }
    };

    document.addEventListener('visibilitychange', handler);
    window.addEventListener('focus', handler);

    return () => {
      document.removeEventListener('visibilitychange', handler);
      window.removeEventListener('focus', handler);
    };
  }, [links, jobStatus]);

  // === Добавление ссылки из буфера ===
  function acceptClipboardLink() {
    setLinks((prev) => [...prev, clipboardUrl]);
    setClipboardUrl(null);
  }

  function declineClipboardLink() {
    setClipboardUrl(null);
  }

  const handleSubmitForm = (e) => {
    e.preventDefault();
    startParsing(mode, links, file);
  };

  return (
    <main className="min-h-screen flex flex-col items-center py-12 bg-gray-50 relative">
      <Toaster position="top-right" toastOptions={{ duration: 2500 }} />

      {/* POPUP */}
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
