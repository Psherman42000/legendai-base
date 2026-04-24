import { loadFfmpeg } from "@/lib/media/load-ffmpeg";

export async function extractAudio(file: File): Promise<File> {
  const ffmpeg = await loadFfmpeg();
  const inputName = file.name;
  const outputName = `${file.name.replace(/\.[^.]+$/, "") || "audio"}.wav`;

  await ffmpeg.writeFile(inputName, new Uint8Array(await file.arrayBuffer()));
  await ffmpeg.exec(["-i", inputName, "-vn", "-ac", "1", "-ar", "16000", "-c:a", "pcm_s16le", outputName]);

  const data = await ffmpeg.readFile(outputName);
  const bytes = data instanceof Uint8Array ? data : new Uint8Array(data as unknown as ArrayBuffer);
  const buffer = await new Blob([bytes as unknown as BlobPart]).arrayBuffer();
  return new File([buffer], outputName, { type: "audio/wav" });
}
