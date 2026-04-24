import { buildSrt } from "@/lib/subtitles/srt";
import { segmentTranscript } from "@/lib/subtitles/segment";
import type { SubtitleSegment, TranscriptChunk } from "@/lib/subtitles/types";
import { extractAudio as defaultExtractAudio } from "@/lib/media/extract-audio";
import { normalizeVideo as defaultNormalizeVideo } from "@/lib/media/normalize-video";
import { transcribeAudio as defaultTranscribeAudio } from "@/lib/media/transcribe-audio";

type ProcessVideoDeps = {
  extractAudio?: (file: File) => Promise<File>;
  normalizeVideo?: (file: File) => Promise<File>;
  transcribeAudio?: (file: File) => Promise<TranscriptChunk[]>;
};

type ProcessedVideo = {
  audioFile: File;
  transcriptChunks: TranscriptChunk[];
  segments: SubtitleSegment[];
  srt: string;
};

export async function processVideo(file: File, deps: ProcessVideoDeps = {}): Promise<ProcessedVideo> {
  const extractAudio = deps.extractAudio ?? defaultExtractAudio;
  const normalizeVideo = deps.normalizeVideo ?? defaultNormalizeVideo;
  const transcribeAudio = deps.transcribeAudio ?? defaultTranscribeAudio;

  let audioFile: File;

  try {
    audioFile = await extractAudio(file);
  } catch {
    const normalizedFile = await normalizeVideo(file);
    audioFile = await extractAudio(normalizedFile);
  }

  const transcriptChunks = await transcribeAudio(audioFile);
  const segments = segmentTranscript(transcriptChunks);

  return {
    audioFile,
    transcriptChunks,
    segments,
    srt: buildSrt(segments),
  };
}
