export async function loadFfmpeg() {
  if (typeof window === "undefined") {
    throw new Error("ffmpeg.wasm can only load in the browser.");
  }

  const { FFmpeg } = await import("@ffmpeg/ffmpeg");

  const ffmpeg = new FFmpeg();
  const coreURL = new URL("/ffmpeg/ffmpeg-core.js", window.location.origin).toString();
  const wasmURL = new URL("/ffmpeg/ffmpeg-core.wasm", window.location.origin).toString();

  await ffmpeg.load({
    coreURL,
    wasmURL,
  });

  return ffmpeg;
}
