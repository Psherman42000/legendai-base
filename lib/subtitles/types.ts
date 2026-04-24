export type TranscriptChunk = {
  text: string;
  startMs: number;
  endMs: number;
};

export type SubtitleSegment = {
  id: number;
  startMs: number;
  endMs: number;
  text: string;
};
