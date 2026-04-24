import type { SubtitleSegment } from "@/lib/subtitles/types";
import { formatSrtTime } from "@/lib/subtitles/time";

export function buildSrt(segments: SubtitleSegment[]): string {
  return segments
    .map((segment) => {
      return [
        String(segment.id),
        `${formatSrtTime(segment.startMs)} --> ${formatSrtTime(segment.endMs)}`,
        segment.text,
        "",
      ].join("\n");
    })
    .join("");
}
