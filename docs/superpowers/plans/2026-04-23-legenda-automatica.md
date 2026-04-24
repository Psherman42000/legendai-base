# Legenda Automatica MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a free, browser-first video-to-SRT MVP on Vercel Hobby that accepts common video formats, converts them locally with `ffmpeg.wasm`, transcribes locally with `Transformers.js`, and lets the user download subtitles.

**Architecture:** A single Next.js app handles the UI and all processing in the browser. The upload flow reads the selected file locally, uses `ffmpeg.wasm` to normalize/extract audio, runs Whisper through `Transformers.js`, converts transcript segments into `SRT`, and exposes a simple preview plus download action. No backend worker, no paid transcription API, and no external storage are used in the MVP.

**Tech Stack:** Next.js, React, TypeScript, `ffmpeg.wasm`, `Transformers.js`, Vitest, Playwright or browser-based verification.

---

### Task 1: Bootstrap the app shell and base styling

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `next.config.ts`
- Create: `app/layout.tsx`
- Create: `app/page.tsx`
- Create: `app/globals.css`
- Create: `public/`

- [ ] **Step 1: Create the failing smoke test**

```ts
import { describe, expect, it } from "vitest";
describe("app shell", () => {
  it("exports a page component", async () => {
    const page = await import("../app/page");
    expect(page.default).toBeDefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --run`
Expected: fail because project is not bootstrapped yet.

- [ ] **Step 3: Write minimal implementation**

```tsx
export default function HomePage() {
  return <main>Legenda Automatica</main>;
}
```

- [ ] **Step 4: Run the tests and app**

Run: `npm test -- --run`
Run: `npm run dev`
Expected: app starts and test passes.

- [ ] **Step 5: Commit**

```bash
git add package.json tsconfig.json next.config.ts app/layout.tsx app/page.tsx app/globals.css public/
git commit -m "feat: bootstrap legend app shell"
```

### Task 2: Build subtitle utility library

**Files:**
- Create: `lib/subtitles/time.ts`
- Create: `lib/subtitles/segment.ts`
- Create: `lib/subtitles/srt.ts`
- Create: `lib/subtitles/types.ts`
- Create: `tests/lib/subtitles/time.test.ts`
- Create: `tests/lib/subtitles/segment.test.ts`
- Create: `tests/lib/subtitles/srt.test.ts`

- [ ] **Step 1: Write failing unit tests**

```ts
import { describe, expect, it } from "vitest";
import { formatSrtTime } from "@/lib/subtitles/time";

describe("formatSrtTime", () => {
  it("formats milliseconds as SRT timestamps", () => {
    expect(formatSrtTime(3723045)).toBe("01:02:03,045");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- --run tests/lib/subtitles/time.test.ts`
Expected: fail because helper does not exist yet.

- [ ] **Step 3: Implement the helpers**

```ts
export function formatSrtTime(ms: number): string {
  const safeMs = Math.max(0, Math.floor(ms));
  const hours = Math.floor(safeMs / 3_600_000);
  const minutes = Math.floor((safeMs % 3_600_000) / 60_000);
  const seconds = Math.floor((safeMs % 60_000) / 1000);
  const milliseconds = safeMs % 1000;
  return [
    String(hours).padStart(2, "0"),
    String(minutes).padStart(2, "0"),
    String(seconds).padStart(2, "0"),
  ].join(":") + `,${String(milliseconds).padStart(3, "0")}`;
}
```

- [ ] **Step 4: Run tests again**

Run: `npm test -- --run`
Expected: all subtitle utility tests pass.

- [ ] **Step 5: Commit**

```bash
git add lib/subtitles tests/lib/subtitles
git commit -m "feat: add subtitle utilities"
```

### Task 3: Implement browser media pipeline helpers

**Files:**
- Create: `lib/media/accepted-formats.ts`
- Create: `lib/media/load-ffmpeg.ts`
- Create: `lib/media/extract-audio.ts`
- Create: `lib/media/normalize-video.ts`
- Create: `lib/media/load-transcriber.ts`
- Create: `lib/media/transcribe-audio.ts`

- [ ] **Step 1: Write a failing integration-style test for format acceptance**

```ts
import { describe, expect, it } from "vitest";
import { acceptedVideoExtensions } from "@/lib/media/accepted-formats";

describe("acceptedVideoExtensions", () => {
  it("includes the common video formats from the spec", () => {
    expect(acceptedVideoExtensions).toEqual(["mp4", "m4v", "mov", "mkv", "webm", "avi"]);
  });
});
```

- [ ] **Step 2: Run tests to verify failure**

Run: `npm test -- --run tests/lib/media/accepted-formats.test.ts`
Expected: fail until constant exists.

- [ ] **Step 3: Implement the helpers**

```ts
export const acceptedVideoExtensions = ["mp4", "m4v", "mov", "mkv", "webm", "avi"] as const;
```

- [ ] **Step 4: Add browser-only guards around `ffmpeg.wasm` and `Transformers.js`**

```ts
export function assertBrowser() {
  if (typeof window === "undefined") {
    throw new Error("Media pipeline can only run in the browser.");
  }
}
```

- [ ] **Step 5: Verify the helpers compile**

Run: `npm test -- --run`
Expected: media helpers and tests pass.

- [ ] **Step 6: Commit**

```bash
git add lib/media
git commit -m "feat: add browser media pipeline helpers"
```

### Task 4: Build the main upload and processing UI

**Files:**
- Create: `components/app-shell.tsx`
- Create: `components/video-dropzone.tsx`
- Create: `components/process-tracker.tsx`
- Create: `components/subtitle-preview.tsx`
- Create: `components/download-actions.tsx`
- Modify: `app/page.tsx`

- [ ] **Step 1: Write a failing UI test**

```tsx
import { render, screen } from "@testing-library/react";
import HomePage from "@/app/page";

it("shows the upload prompt and accepted formats", () => {
  render(<HomePage />);
  expect(screen.getByText(/Arraste e solte/i)).toBeInTheDocument();
  expect(screen.getByText("mp4")).toBeInTheDocument();
});
```

- [ ] **Step 2: Run the test to verify the page is still too simple**

Run: `npm test -- --run tests/app/page.test.tsx`
Expected: fail or not yet exist.

- [ ] **Step 3: Implement the shell and controls**

```tsx
export default function HomePage() {
  return (
    <main className="app-shell">
      <section className="hero">
        <h1>Legenda Automatica</h1>
        <p>Video para legendas. Automatico, privado, rapido.</p>
      </section>
      <section className="workspace">{/* dropzone + preview + tracker */}</section>
    </main>
  );
}
```

- [ ] **Step 4: Wire local state for selected file, status, result, and download link**

```tsx
type JobStatus = "idle" | "loading-model" | "processing" | "done" | "error";
```

- [ ] **Step 5: Run the app in browser and verify the first viewport**

Run: `npm run dev`
Verify:
- upload prompt visible
- accepted format chips visible
- preview panel visible
- status rail visible

- [ ] **Step 6: Commit**

```bash
git add components app/page.tsx
git commit -m "feat: build subtitle app interface"
```

### Task 5: Connect the full in-browser workflow

**Files:**
- Modify: `components/video-dropzone.tsx`
- Modify: `components/process-tracker.tsx`
- Modify: `components/subtitle-preview.tsx`
- Modify: `components/download-actions.tsx`
- Modify: `lib/media/load-ffmpeg.ts`
- Modify: `lib/media/extract-audio.ts`
- Modify: `lib/media/normalize-video.ts`
- Modify: `lib/media/load-transcriber.ts`
- Modify: `lib/media/transcribe-audio.ts`
- Modify: `lib/subtitles/segment.ts`
- Modify: `lib/subtitles/srt.ts`

- [ ] **Step 1: Implement file selection, drag and drop, and processing kick-off**

```tsx
function handleFile(file: File) {
  setStatus("loading-model");
  void processVideo(file);
}
```

- [ ] **Step 2: Implement the pipeline**

```ts
const audio = await extractAudio(file);
const transcription = await transcribeAudio(audio);
const segments = segmentTranscript(transcription);
const srt = buildSrt(segments);
```

- [ ] **Step 3: Support fallback conversion when direct extraction fails**

```ts
try {
  return await extractAudio(file);
} catch {
  const normalized = await normalizeVideo(file);
  return await extractAudio(normalized);
}
```

- [ ] **Step 4: Populate preview rows from generated segments**

```tsx
segments.map((segment) => (
  <li key={segment.id}>
    <time>{segment.startLabel}</time>
    <p>{segment.text}</p>
  </li>
));
```

- [ ] **Step 5: Produce downloadable SRT blob**

```ts
const blob = new Blob([srt], { type: "application/x-subrip" });
```

- [ ] **Step 6: Run the workflow in browser on a short sample video**

Verify:
- model loads
- file converts or extracts
- transcript appears
- SRT downloads

- [ ] **Step 7: Commit**

```bash
git add components lib
git commit -m "feat: wire browser subtitle workflow"
```

### Task 6: Polish responsive behavior and error states

**Files:**
- Modify: `app/globals.css`
- Modify: `components/app-shell.tsx`
- Modify: `components/process-tracker.tsx`
- Modify: `components/download-actions.tsx`

- [ ] **Step 1: Add loading, success, and error visual states**

```tsx
const stateLabel: Record<JobStatus, string> = {
  idle: "Aguardando",
  "loading-model": "Carregando modelo",
  processing: "Processando",
  done: "Pronto",
  error: "Erro",
};
```

- [ ] **Step 2: Make the layout collapse cleanly on mobile**

```css
@media (max-width: 900px) {
  .workspace {
    grid-template-columns: 1fr;
  }
}
```

- [ ] **Step 3: Verify desktop and mobile in browser**

Run: `npm run dev`
Verify:
- 1440px desktop
- 390px mobile
- no overflow
- no clipped buttons

- [ ] **Step 4: Commit**

```bash
git add app/globals.css components
git commit -m "feat: polish responsive states"
```

### Task 7: Verify and harden the build

**Files:**
- Modify: any file needed from above

- [ ] **Step 1: Run the full test suite**

Run: `npm test -- --run`
Expected: all tests pass.

- [ ] **Step 2: Run production build**

Run: `npm run build`
Expected: successful build with no client/server boundary errors.

- [ ] **Step 3: Run the app and verify the core workflow in browser**

Verify:
- upload common video format
- conversion fallback path
- transcription path
- SRT download path

- [ ] **Step 4: Commit final hardening**

```bash
git add .
git commit -m "chore: harden legend mvp"
```

## Coverage Check

- Upload common video formats: Task 4 and Task 5
- Automatic conversion: Task 3 and Task 5
- Browser-only free stack: Task 1, Task 3
- Transcription with timestamps: Task 3 and Task 5
- SRT generation: Task 2 and Task 5
- Preview: Task 4 and Task 5
- Download SRT: Task 4 and Task 5
- Responsive behavior: Task 6
- Build verification: Task 7

