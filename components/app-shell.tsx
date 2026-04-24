"use client";

import React, { useState } from "react";
import { acceptedVideoExtensions } from "@/lib/media/accepted-formats";

type JobStatus = "idle" | "loading-model" | "processing" | "done" | "error";

const statusOrder: Array<{ key: JobStatus; label: string }> = [
  { key: "idle", label: "Aguardando" },
  { key: "loading-model", label: "Carregando modelo" },
  { key: "processing", label: "Processando" },
  { key: "done", label: "Pronto" },
  { key: "error", label: "Erro" },
];

export function AppShell() {
  const [status, setStatus] = useState<JobStatus>("idle");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    setSelectedFile(file);
    setStatus(file ? "idle" : "idle");
  }

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
            <button type="button" className="primary-button">
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
            {selectedFile ? (
              <>
                <li>
                  <time>00:00:01,240</time>
                  <p>Arquivo selecionado: {selectedFile.name}</p>
                </li>
                {statusOrder.map((item, index) => (
                  <li key={item.key}>
                    <time>{String(index + 1).padStart(2, "0")} stage</time>
                    <p>{item.label}</p>
                  </li>
                ))}
              </>
            ) : (
              <li>
                <time>00:00:00,000</time>
                <p>Carregue um video para comecar</p>
              </li>
            )}
          </ol>
        </article>
      </section>
    </main>
  );
}
