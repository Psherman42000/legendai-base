import { loadFfmpeg } from "@/lib/media/load-ffmpeg";
import { readFileBytes } from "@/lib/media/read-file-bytes";
import { toArrayBuffer } from "@/lib/media/to-array-buffer";

export async function normalizeVideo(file: File): Promise<File> {
  try {
    const ffmpeg = await loadFfmpeg();
    const inputName = "input-media";
    const outputName = "normalized-video.mp4";

    await ffmpeg.writeFile(inputName, new Uint8Array(await readFileBytes(file)));
    await ffmpeg.exec(["-i", inputName, "-c:v", "libx264", "-c:a", "aac", "-movflags", "+faststart", outputName]);

    const data = await ffmpeg.readFile(outputName);
    const buffer = toArrayBuffer(data as Uint8Array | ArrayBuffer | string);
    return new File([buffer], outputName, { type: "video/mp4" });
  } catch (error) {
    throw new Error(`normalizeVideo failed: ${error instanceof Error ? error.message : String(error)}`, { cause: error });
  }
}
