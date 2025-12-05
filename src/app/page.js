'use client';

import { useState, useRef } from 'react';
import { useParserState } from '@/hooks/useParserState';
import { useLinksStorage } from '@/hooks/useLinksStorage';
import { useClipboard } from '@/hooks/useClipboard';
import { Toaster } from 'react-hot-toast';

import ClipboardPopup from '@/components/ClipboardPopup';
import FileInput from '@/components/FileInput';
import LinksInput from '@/components/LinksInput';
import ModeSelect from '@/components/ModeSelect';
import FormButton from '@/components/FormButton';
import ProcessInfo from '@/components/ProcessInfo';
import ResultInfo from '@/components/ResultInfo';

export default function HomePage() {
  const [links, setLinks] = useState([]);
  const [file, setFile] = useState(null);
  const [mode, setMode] = useState('3');
  const inputRef = useRef(null);

  // --- Хук управления состояниями процесса ---
  const { loading, resp, jobId, jobStatus, jobTimer, jobCancelling, startParsing, cancelParsing } =
    useParserState();

  // --- Хук локального хранения ссылок ---
  useLinksStorage(links, setLinks, jobStatus);

  // --- Хук работы с буффером ссылок ---
  const { clipboardUrl, acceptClipboardLink, declineClipboardLink } = useClipboard(
    links,
    setLinks,
    jobStatus,
    inputRef
  );

  function handleSubmitForm(e) {
    e.preventDefault();
    startParsing(mode, links, file);
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
