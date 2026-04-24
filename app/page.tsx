const acceptedFormats = ["mp4", "m4v", "mov", "mkv", "webm", "avi"];

export default function HomePage() {
  return (
    <main className="page-shell">
      <section className="hero-card">
        <div className="eyebrow">Legenda Automatica</div>
        <h1>Video para legenda, direto no navegador.</h1>
        <p>
          Aceita formatos comuns, converte localmente, transcreve sem custo e gera `SRT`.
        </p>

        <div className="format-row" aria-label="Formatos aceitos">
          {acceptedFormats.map((format) => (
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
            <span className="status-pill">Pronto</span>
          </div>
          <div className="dropzone">
            <strong>Arraste e solte seu video aqui</strong>
            <p>Ou clique para selecionar um arquivo.</p>
            <button type="button" className="primary-button">
              Enviar video
            </button>
          </div>
        </article>

        <article className="panel panel-preview">
          <div className="panel-header">
            <span>Preview</span>
            <span className="muted">SRT</span>
          </div>
          <ol className="subtitle-list">
            <li>
              <time>00:00:01,240</time>
              <p>Carregando modelo local.</p>
            </li>
            <li>
              <time>00:00:03,100</time>
              <p>Convertendo video e extraindo audio.</p>
            </li>
            <li>
              <time>00:00:05,020</time>
              <p>Gerando legendas sincronizadas.</p>
            </li>
          </ol>
        </article>
      </section>
    </main>
  );
}
