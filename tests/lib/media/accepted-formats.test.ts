import { describe, expect, it } from "vitest";
import { acceptedVideoExtensions, isAcceptedVideoFile } from "@/lib/media/accepted-formats";

describe("accepted video formats", () => {
  it("lists the common video extensions from the spec", () => {
    expect(acceptedVideoExtensions).toEqual(["mp4", "m4v", "mov", "mkv", "webm", "avi"]);
  });

  it("accepts files with uppercase extensions", () => {
    expect(isAcceptedVideoFile(new File(["x"], "Demo.MOV"))).toBe(true);
  });
});
