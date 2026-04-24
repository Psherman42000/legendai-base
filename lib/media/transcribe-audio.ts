import type { TranscriptChunk } from "@/lib/subtitles/types";
import { loadTranscriber } from "@/lib/media/load-transcriber";
import { readFileBytes } from "@/lib/media/read-file-bytes";

type TranscriptionResult = {
  text?: string;
  chunks?: Array<{
    text: string;
    timestamp?: [number, number];
  }>;
};

export async function transcribeAudio(file: File): Promise<TranscriptChunk[]> {
  const transcriber = await loadTranscriber();
  const audioContext = new AudioContext();

  try {
    const audioBuffer = await audioContext.decodeAudioData(await readFileBytes(file));
    const channelData = audioBuffer.numberOfChannels === 1
      ? audioBuffer.getChannelData(0)
      : mixToMono(audioBuffer);

    const result = (await transcriber(channelData, {
      return_timestamps: true,
      chunk_length_s: 30,
      stride_length_s: 5,
      language: "portuguese",
      task: "transcribe",
    })) as TranscriptionResult;

    return (result.chunks ?? [])
      .map((chunk) => {
        const [start, end] = chunk.timestamp ?? [0, 0];
        return {
          text: chunk.text.trim(),
          startMs: Math.round(start * 1000),
          endMs: Math.round(end * 1000),
        };
      })
      .filter((chunk) => chunk.text.length > 0);
  } finally {
    await audioContext.close();
  }
}

function mixToMono(audioBuffer: AudioBuffer): Float32Array {
  const length = audioBuffer.length;
  const mono = new Float32Array(length);

  for (let channel = 0; channel < audioBuffer.numberOfChannels; channel += 1) {
    const data = audioBuffer.getChannelData(channel);
    for (let i = 0; i < length; i += 1) {
      mono[i] += data[i] / audioBuffer.numberOfChannels;
    }
  }

  return mono;
}
