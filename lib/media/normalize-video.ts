import { loadFfmpeg } from "@/lib/media/load-ffmpeg";

export async function normalizeVideo(file: File): Promise<File> {
  try {
    const ffmpeg = await loadFfmpeg();
    const inputName = "input-media";
    const outputName = "normalized-video.mp4";

    await ffmpeg.writeFile(inputName, new Uint8Array(await file.arrayBuffer()));
    await ffmpeg.exec(["-i", inputName, "-c:v", "libx264", "-c:a", "aac", "-movflags", "+faststart", outputName]);

    const data = await ffmpeg.readFile(outputName);
    const bytes = data instanceof Uint8Array ? data : new Uint8Array(data as unknown as ArrayBuffer);
    const buffer = await new Blob([bytes as unknown as BlobPart]).arrayBuffer();
    return new File([buffer], outputName, { type: "video/mp4" });
  } catch (error) {
    throw new Error(`normalizeVideo failed: ${error instanceof Error ? error.message : String(error)}`, { cause: error });
  }
}
