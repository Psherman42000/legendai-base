let transcriberPromise:
  | Promise<Awaited<ReturnType<typeof createTranscriber>>>
  | undefined;

async function createTranscriber() {
  if (typeof window === "undefined") {
    throw new Error("Transcription can only load in the browser.");
  }

  const { pipeline, env } = await import("@xenova/transformers");
  env.allowLocalModels = false;

  return pipeline("automatic-speech-recognition", "Xenova/whisper-tiny", {
    progress_callback: () => undefined,
  });
}

export async function loadTranscriber() {
  transcriberPromise ??= createTranscriber();
  return transcriberPromise;
}
