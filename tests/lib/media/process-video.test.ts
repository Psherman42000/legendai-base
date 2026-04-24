import { describe, expect, it, vi } from "vitest";
import { processVideo } from "@/lib/media/process-video";

describe("processVideo", () => {
  it("falls back to normalization when direct audio extraction fails", async () => {
    const file = new File(["video"], "demo.mov", { type: "video/quicktime" });

    const extractAudio = vi
      .fn()
      .mockRejectedValueOnce(new Error("direct extraction failed"))
      .mockResolvedValueOnce(new File(["audio"], "demo.wav", { type: "audio/wav" }));
    const normalizeVideo = vi
      .fn()
      .mockResolvedValue(new File(["normalized"], "demo.mp4", { type: "video/mp4" }));
    const transcribeAudio = vi.fn().mockResolvedValue([
      { text: "Oi mundo.", startMs: 0, endMs: 1500 },
    ]);

    const result = await processVideo(file, {
      extractAudio,
      normalizeVideo,
      transcribeAudio,
    });

    expect(normalizeVideo).toHaveBeenCalledTimes(1);
    expect(extractAudio).toHaveBeenCalledTimes(2);
    expect(result.srt).toBe("1\n00:00:00,000 --> 00:00:01,500\nOi mundo.\n");
  });
});
