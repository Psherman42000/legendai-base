import type { TranscriptChunk } from "@/lib/subtitles/types";
import { loadTranscriber } from "@/lib/media/load-transcriber";

type TranscriptionResult = {
  text?: string;
  chunks?: Array<{
    text: string;
    timestamp?: [number, number];
  }>;
};

export async function transcribeAudio(file: File): Promise<TranscriptChunk[]> {
  const transcriber = await loadTranscriber();
  const audioUrl = URL.createObjectURL(file);

  try {
    const result = (await transcriber(audioUrl, {
      return_timestamps: true,
    })) as TranscriptionResult;

    return (result.chunks ?? [])
      .map((chunk) => {
        const [start, end] = chunk.timestamp ?? [0, 0];
        return {
          text: chunk.text.trim(),
          startMs: Math.round(start * 1000),
          endMs: Math.round(end * 1000),
        };
      })
      .filter((chunk) => chunk.text.length > 0);
  } finally {
    URL.revokeObjectURL(audioUrl);
  }
}
