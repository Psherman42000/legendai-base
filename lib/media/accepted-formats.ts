export const acceptedVideoExtensions = ["mp4", "m4v", "mov", "mkv", "webm", "avi"] as const;

export function getVideoExtension(fileName: string): string {
  const parts = fileName.split(".");
  return (parts.at(-1) ?? "").toLowerCase();
}

export function isAcceptedVideoFile(file: File): boolean {
  return acceptedVideoExtensions.includes(getVideoExtension(file.name) as (typeof acceptedVideoExtensions)[number]);
}
