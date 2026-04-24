import { describe, expect, it } from "vitest";
import { segmentTranscript } from "@/lib/subtitles/segment";

describe("segmentTranscript", () => {
  it("splits long transcript text into short subtitle segments", () => {
    const segments = segmentTranscript([
      {
        text: "Primeira frase longa. Segunda frase longa tambem.",
        startMs: 0,
        endMs: 5000,
      },
    ]);

    expect(segments).toHaveLength(2);
    expect(segments[0].text).toBe("Primeira frase longa.");
    expect(segments[1].text).toBe("Segunda frase longa tambem.");
  });
});
