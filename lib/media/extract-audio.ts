import { loadFfmpeg } from "@/lib/media/load-ffmpeg";

export async function extractAudio(file: File): Promise<File> {
  const ffmpeg = await loadFfmpeg();
  const inputName = file.name;
  const outputName = `${file.name.replace(/\.[^.]+$/, "") || "audio"}.wav`;

  await ffmpeg.writeFile(inputName, await file.arrayBuffer());
  await ffmpeg.exec(["-i", inputName, "-vn", "-ac", "1", "-ar", "16000", "-c:a", "pcm_s16le", outputName]);

  const data = await ffmpeg.readFile(outputName);
  return new File([data as Uint8Array], outputName, { type: "audio/wav" });
}
