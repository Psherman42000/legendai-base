import { describe, expect, it } from "vitest";
import { buildSrt } from "@/lib/subtitles/srt";

describe("buildSrt", () => {
  it("converts subtitle segments to standard SRT text", () => {
    const srt = buildSrt([
      {
        id: 1,
        startMs: 1000,
        endMs: 2500,
        text: "Oi mundo.",
      },
    ]);

    expect(srt).toBe("1\n00:00:01,000 --> 00:00:02,500\nOi mundo.\n");
  });
});
