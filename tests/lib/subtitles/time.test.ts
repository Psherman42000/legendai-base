import { describe, expect, it } from "vitest";
import { formatSrtTime } from "@/lib/subtitles/time";

describe("formatSrtTime", () => {
  it("formats milliseconds as an SRT timestamp", () => {
    expect(formatSrtTime(3_723_045)).toBe("01:02:03,045");
  });
});
