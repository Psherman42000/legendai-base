export async function readFileBytes(file: Blob): Promise<ArrayBuffer> {
  if ("arrayBuffer" in file && typeof file.arrayBuffer === "function") {
    return file.arrayBuffer();
  }

  return new Response(file).arrayBuffer();
}
