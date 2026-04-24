import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { transcribeAudio } from "@/lib/media/transcribe-audio";

const mocks = vi.hoisted(() => ({
  loadTranscriber: vi.fn(),
  readFileBytes: vi.fn(),
}));

vi.mock("@/lib/media/load-transcriber", () => ({
  loadTranscriber: mocks.loadTranscriber,
}));

vi.mock("@/lib/media/read-file-bytes", () => ({
  readFileBytes: mocks.readFileBytes,
}));

describe("transcribeAudio", () => {
  const originalAudioContext = globalThis.AudioContext;

  beforeEach(() => {
    mocks.loadTranscriber.mockReset();
    mocks.readFileBytes.mockReset();
    class MockAudioContext {
      async decodeAudioData() {
        return {
          numberOfChannels: 1,
          getChannelData: () => new Float32Array([0.1, 0.2, 0.3]),
        };
      }

      async close() {
        return undefined;
      }
    }

    // @ts-expect-error test shim
    globalThis.AudioContext = MockAudioContext;
  });

  afterEach(() => {
    globalThis.AudioContext = originalAudioContext;
  });

  it("forces portuguese transcription settings", async () => {
    const transcriber = vi.fn().mockResolvedValue({
      chunks: [{ text: " Oi mundo.", timestamp: [0, 1] }],
    });
    mocks.loadTranscriber.mockResolvedValue(transcriber);
    mocks.readFileBytes.mockResolvedValue(new ArrayBuffer(3));

    const chunks = await transcribeAudio({} as File);

    expect(mocks.loadTranscriber).toHaveBeenCalledTimes(1);
    expect(transcriber).toHaveBeenCalledWith(
      expect.any(Float32Array),
      expect.objectContaining({
        return_timestamps: true,
        chunk_length_s: 30,
        stride_length_s: 5,
        language: "portuguese",
        task: "transcribe",
      }),
    );
    expect(chunks).toEqual([{ text: "Oi mundo.", startMs: 0, endMs: 1000 }]);
  });
});
