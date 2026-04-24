import { describe, expect, it, vi } from "vitest";
import { burnVideoWithSubtitles } from "@/lib/media/burn-video";

describe("burnVideoWithSubtitles", () => {
  it("writes the srt and renders a subtitled mp4", async () => {
    const writeFile = vi.fn().mockResolvedValue(undefined);
    const exec = vi.fn().mockResolvedValue(0);
    const readFile = vi.fn().mockResolvedValue(new Uint8Array([1, 2, 3]));

    const output = await burnVideoWithSubtitles({} as File, "1\n00:00:00,000 --> 00:00:01,000\nOi mundo.\n", {
      readFileBytes: async () => new ArrayBuffer(3),
      loadFfmpeg: async () =>
        ({
          writeFile,
          exec,
          readFile,
        }) as never,
    });

    expect(writeFile).toHaveBeenCalledWith("subtitles.srt", expect.stringContaining("Oi mundo."));
    expect(exec).toHaveBeenCalledWith(
      expect.arrayContaining(["-vf", "subtitles=subtitles.srt", "-c:v", "libx264", "-c:a", "aac"]),
    );
    expect(output).toBeInstanceOf(File);
    expect(output.type).toBe("video/mp4");
  });
});
