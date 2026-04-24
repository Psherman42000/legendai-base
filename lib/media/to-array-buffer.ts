export function toArrayBuffer(data: Uint8Array | ArrayBuffer | string): ArrayBuffer {
  if (data instanceof ArrayBuffer) {
    return data;
  }

  if (data instanceof Uint8Array) {
    return Uint8Array.from(data).buffer;
  }

  return new TextEncoder().encode(data).buffer;
}
