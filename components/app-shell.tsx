"use client";

import React, { useMemo, useState } from "react";
import { acceptedVideoExtensions } from "@/lib/media/accepted-formats";
import { processVideo as defaultProcessVideo } from "@/lib/media/process-video";
import { formatSrtTime } from "@/lib/subtitles/time";
import type { SubtitleSegment } from "@/lib/subtitles/types";

type JobStatus = "idle" | "loading-model" | "processing" | "done" | "error";
type ProcessVideoFn = typeof defaultProcessVideo;

const statusOrder: Array<{ key: JobStatus; label: string }> = [
  { key: "idle", label: "Aguardando" },
  { key: "loading-model", label: "Carregando modelo" },
  { key: "processing", label: "Processando" },
  { key: "done", label: "Pronto" },
  { key: "error", label: "Erro" },
];

type AppShellProps = {
  processVideoFn?: ProcessVideoFn;
};

export function AppShell({ processVideoFn = defaultProcessVideo }: AppShellProps) {
  const [status, setStatus] = useState<JobStatus>("idle");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [segments, setSegments] = useState<SubtitleSegment[]>([]);
  const [downloadHref, setDownloadHref] = useState<string | null>(null);
  const [downloadName, setDownloadName] = useState<string>("subtitle.srt");

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    setSelectedFile(file);
    setStatus("idle");
    setSegments([]);
    setDownloadHref(null);
    setDownloadName(file ? `${file.name.replace(/\.[^.]+$/, "") || "subtitle"}.srt` : "subtitle.srt");
  }

  async function handleProcessClick() {
    if (!selectedFile) {
      return;
    }

    setStatus("processing");

    try {
      const result = await processVideoFn(selectedFile);
      setSegments(result.segments);
      setDownloadName(`${selectedFile.name.replace(/\.[^.]+$/, "") || "subtitle"}.srt`);
      setDownloadHref(`data:application/x-subrip;charset=utf-8,${encodeURIComponent(result.srt)}`);
      setStatus("done");
    } catch {
      setStatus("error");
    }
  }

  const previewItems = useMemo(() => {
    if (segments.length > 0) {
      return segments;
    }

    return [
      {
        id: 0,
        startMs: 0,
        endMs: 0,
        text: selectedFile ? "Processando..." : "Carregue um video para comecar",
      },
    ];
  }, [segments, selectedFile]);

  return (
    <main className="page-shell">
      <section className="hero-card">
        <div className="eyebrow">Legenda Automatica</div>
        <h1>Video para legenda, direto no navegador.</h1>
        <p>Aceita formatos comuns, converte localmente, transcreve sem custo e gera `SRT`.</p>

        <div className="format-row" aria-label="Formatos aceitos">
          {acceptedVideoExtensions.map((format) => (
            <span key={format} className="format-chip">
              {format}
            </span>
          ))}
        </div>
      </section>

      <section className="workspace-grid" aria-label="Workspace">
        <article className="panel panel-upload">
          <div className="panel-header">
            <span>Upload</span>
            <span className="status-pill">{selectedFile ? "Arquivo pronto" : "Pronto"}</span>
          </div>

          <div className="dropzone">
            <strong>Arraste e solte seu video aqui</strong>
            <p>Ou clique para selecionar um arquivo.</p>
            <label className="file-picker" htmlFor="video-upload">
              <span>Arquivo de video</span>
              <input
                id="video-upload"
                type="file"
                accept={acceptedVideoExtensions.map((format) => `.${format}`).join(",")}
                onChange={handleFileChange}
              />
            </label>
            <button type="button" className="primary-button" onClick={handleProcessClick}>
              Enviar video
            </button>
            {selectedFile ? <p className="file-name">{selectedFile.name}</p> : null}
          </div>
        </article>

        <article className="panel panel-preview">
          <div className="panel-header">
            <span>Preview</span>
            <span className="muted">SRT</span>
          </div>

          <ol className="subtitle-list">
            {previewItems.map((item) => (
              <li key={item.id}>
                <time>{formatSrtTime(item.startMs)}</time>
                <p>{item.text}</p>
              </li>
            ))}
            {selectedFile ? (
              <li>
                <time>status</time>
                <p>Status atual: {statusOrder.find((entry) => entry.key === status)?.label ?? "Aguardando"}</p>
              </li>
            ) : null}
          </ol>
          {downloadHref ? (
            <a className="primary-button download-link" href={downloadHref} download={downloadName}>
              Baixar SRT
            </a>
          ) : null}
        </article>
      </section>
    </main>
  );
}
