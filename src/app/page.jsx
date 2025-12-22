'use client';

import { useState, useRef } from 'react';
import { useLinksStorage } from '@/hooks/useLinksStorage';
import { useClipboard } from '@/hooks/useClipboard';
import { useParserState } from '@/hooks/useParserState';

import ClipboardPopup from '@/components/ClipboardPopup';
import FileInput from '@/components/FileInput';
import LinksInput from '@/components/LinksInput';
import ModeSelect from '@/components/ModeSelect';
import FormButton from '@/components/ui/FormButton';
import ProcessInfo from '@/components/ProcessInfo';
import ResultInfo from '@/components/ResultInfo';
import MainWrapper from '@/components/MainWrapper';

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
    <MainWrapper>
      <ClipboardPopup
        url={clipboardUrl}
        onAccept={acceptClipboardLink}
        onDecline={declineClipboardLink}
      />

      <div>
        <form onSubmit={handleSubmitForm} className="space-y-6 sm:space-y-10">
          <LinksInput links={links} setLinks={setLinks} loading={loading} inputRef={inputRef} />

          <FileInput file={file} setFile={setFile} loading={loading} />

          <ModeSelect mode={mode} setMode={setMode} loading={loading} />

          <div className="mt-8">
            <FormButton
              jobId={jobId}
              jobCancelling={jobCancelling}
              cancelParsing={cancelParsing}
              loading={loading}
              jobStatus={jobStatus}
            />
          </div>
        </form>

        <ProcessInfo jobId={jobId} jobStatus={jobStatus} jobTimer={jobTimer} />

        <ResultInfo resp={resp} />
      </div>
    </MainWrapper>
  );
}
