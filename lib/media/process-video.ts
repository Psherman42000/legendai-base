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
  } catch (extractError) {
    try {
      const normalizedFile = await normalizeVideo(file);
      audioFile = await extractAudio(normalizedFile);
    } catch (normalizeError) {
      const extractMessage = extractError instanceof Error ? extractError.message : String(extractError);
      const normalizeMessage = normalizeError instanceof Error ? normalizeError.message : String(normalizeError);
      throw new Error(
        `Nao foi possivel extrair audio do video. Primeiro erro: ${extractMessage}. Fallback erro: ${normalizeMessage}`,
      );
    }
  }

  let transcriptChunks: TranscriptChunk[];

  try {
    transcriptChunks = await transcribeAudio(audioFile);
  } catch (transcribeError) {
    throw new Error("Nao foi possivel transcrever o audio.", { cause: transcribeError });
  }

  const segments = segmentTranscript(transcriptChunks);

  return {
    audioFile,
    transcriptChunks,
    segments,
    srt: buildSrt(segments),
  };
}
