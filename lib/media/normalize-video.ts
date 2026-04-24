import { loadFfmpeg } from "@/lib/media/load-ffmpeg";

export async function normalizeVideo(file: File): Promise<File> {
  const ffmpeg = await loadFfmpeg();
  const inputName = file.name;
  const outputName = `${file.name.replace(/\.[^.]+$/, "") || "video"}.mp4`;

  await ffmpeg.writeFile(inputName, new Uint8Array(await file.arrayBuffer()));
  await ffmpeg.exec(["-i", inputName, "-c:v", "libx264", "-c:a", "aac", "-movflags", "+faststart", outputName]);

  const data = await ffmpeg.readFile(outputName);
  const bytes = data instanceof Uint8Array ? data : new Uint8Array(data as unknown as ArrayBuffer);
  const buffer = await new Blob([bytes as unknown as BlobPart]).arrayBuffer();
  return new File([buffer], outputName, { type: "video/mp4" });
}
