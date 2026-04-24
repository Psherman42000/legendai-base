import { loadFfmpeg } from "@/lib/media/load-ffmpeg";
import { readFileBytes } from "@/lib/media/read-file-bytes";
import { toArrayBuffer } from "@/lib/media/to-array-buffer";

export async function extractAudio(file: File): Promise<File> {
  try {
    const ffmpeg = await loadFfmpeg();
    const inputName = "input-media";
    const outputName = "output-audio.wav";

    await ffmpeg.writeFile(inputName, new Uint8Array(await readFileBytes(file)));
    await ffmpeg.exec(["-i", inputName, "-vn", "-ac", "1", "-ar", "16000", "-c:a", "pcm_s16le", outputName]);

    const data = await ffmpeg.readFile(outputName);
    const buffer = toArrayBuffer(data as Uint8Array | ArrayBuffer | string);
    return new File([buffer], outputName, { type: "audio/wav" });
  } catch (error) {
    throw new Error(`extractAudio failed: ${error instanceof Error ? error.message : String(error)}`, { cause: error });
  }
}
