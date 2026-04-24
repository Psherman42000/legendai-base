import { describe, expect, it } from "vitest";

describe("home page", () => {
  it("exports a page component", async () => {
    const page = await import("../../app/page");
    expect(page.default).toBeDefined();
  });
});
