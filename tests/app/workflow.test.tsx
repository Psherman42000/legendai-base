import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AppShell } from "@/components/app-shell";

describe("workflow", () => {
  it("processes a chosen file and exposes a downloadable SRT", async () => {
    const processVideo = vi.fn().mockResolvedValue({
      audioFile: new File(["audio"], "demo.wav", { type: "audio/wav" }),
      transcriptChunks: [{ text: "Oi mundo.", startMs: 0, endMs: 1000 }],
      segments: [{ id: 1, text: "Oi mundo.", startMs: 0, endMs: 1000 }],
      srt: "1\n00:00:00,000 --> 00:00:01,000\nOi mundo.\n",
    });

    render(<AppShell processVideoFn={processVideo} />);

    const input = screen.getByLabelText("Arquivo de video");
    const file = new File(["video"], "demo.mp4", { type: "video/mp4" });

    fireEvent.change(input, { target: { files: [file] } });
    fireEvent.click(screen.getByRole("button", { name: "Enviar video" }));

    expect(await screen.findByText("Oi mundo.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Baixar SRT" })).toHaveAttribute("download", "demo.srt");
    expect(processVideo).toHaveBeenCalledWith(file);
  });
});
