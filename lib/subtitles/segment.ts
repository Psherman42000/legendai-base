import type { SubtitleSegment, TranscriptChunk } from "@/lib/subtitles/types";

const sentencePattern = /[^.!?]+[.!?]?/g;

export function segmentTranscript(chunks: TranscriptChunk[]): SubtitleSegment[] {
  const segments: SubtitleSegment[] = [];
  let nextId = 1;

  for (const chunk of chunks) {
    const sentences = chunk.text
      .match(sentencePattern)
      ?.map((sentence) => sentence.trim())
      .filter(Boolean) ?? [chunk.text.trim()].filter(Boolean);

    if (sentences.length === 0) {
      continue;
    }

    const duration = Math.max(0, chunk.endMs - chunk.startMs);
    const step = sentences.length > 0 ? duration / sentences.length : duration;

    sentences.forEach((sentence, index) => {
      const startMs = Math.round(chunk.startMs + step * index);
      const endMs = index === sentences.length - 1 ? chunk.endMs : Math.round(chunk.startMs + step * (index + 1));

      segments.push({
        id: nextId,
        startMs,
        endMs,
        text: sentence,
      });
      nextId += 1;
    });
  }

  return segments;
}
