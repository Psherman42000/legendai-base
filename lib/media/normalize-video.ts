import { loadFfmpeg } from "@/lib/media/load-ffmpeg";

export async function normalizeVideo(file: File): Promise<File> {
  const ffmpeg = await loadFfmpeg();
  const inputName = file.name;
  const outputName = `${file.name.replace(/\.[^.]+$/, "") || "video"}.mp4`;

  await ffmpeg.writeFile(inputName, await file.arrayBuffer());
  await ffmpeg.exec(["-i", inputName, "-c:v", "libx264", "-c:a", "aac", "-movflags", "+faststart", outputName]);

  const data = await ffmpeg.readFile(outputName);
  return new File([data as Uint8Array], outputName, { type: "video/mp4" });
}
