import { loadFfmpeg } from "@/lib/media/load-ffmpeg";
import { readFileBytes } from "@/lib/media/read-file-bytes";
import { toArrayBuffer } from "@/lib/media/to-array-buffer";

type BurnVideoDeps = {
  loadFfmpeg?: typeof loadFfmpeg;
  readFileBytes?: typeof readFileBytes;
};

export async function burnVideoWithSubtitles(file: File, srt: string, deps: BurnVideoDeps = {}): Promise<File> {
  try {
    const ffmpeg = await (deps.loadFfmpeg ?? loadFfmpeg)();
    const readBytes = deps.readFileBytes ?? readFileBytes;
    const inputName = "input-media";
    const subtitleName = "subtitles.srt";
    const outputName = "legendado.mp4";

    await ffmpeg.writeFile(inputName, new Uint8Array(await readBytes(file)));
    await ffmpeg.writeFile(subtitleName, srt);

    await ffmpeg.exec([
      "-i",
      inputName,
      "-vf",
      `subtitles=${subtitleName}`,
      "-c:v",
      "libx264",
      "-c:a",
      "aac",
      "-movflags",
      "+faststart",
      outputName,
    ]);

    const data = await ffmpeg.readFile(outputName);
    const buffer = toArrayBuffer(data as Uint8Array | ArrayBuffer | string);
    return new File([buffer], outputName, { type: "video/mp4" });
  } catch (error) {
    throw new Error(`burnVideoWithSubtitles failed: ${error instanceof Error ? error.message : String(error)}`, {
      cause: error,
    });
  }
}
