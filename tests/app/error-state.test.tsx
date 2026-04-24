import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AppShell } from "@/components/app-shell";

describe("error state", () => {
  it("shows a clear error banner when processing fails", async () => {
    const processVideo = vi.fn().mockRejectedValue(new Error("boom"));

    render(<AppShell processVideoFn={processVideo} />);

    const input = screen.getByLabelText("Arquivo de video");
    const file = new File(["video"], "broken.mov", { type: "video/quicktime" });

    fireEvent.change(input, { target: { files: [file] } });
    fireEvent.click(screen.getByRole("button", { name: "Enviar video" }));

    expect(await screen.findByText("Nao foi possivel processar o video. Tente outro arquivo.")).toBeInTheDocument();
  });
});
