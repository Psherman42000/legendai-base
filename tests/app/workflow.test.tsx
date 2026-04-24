import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { AppShell } from "@/components/app-shell";

const originalCreateObjectURL = URL.createObjectURL;

beforeAll(() => {
  URL.createObjectURL = vi.fn(() => "blob:mock");
});

afterAll(() => {
  URL.createObjectURL = originalCreateObjectURL;
});

describe("workflow", () => {
  it("processes a chosen file and exposes a downloadable SRT", async () => {
    const processVideo = vi.fn().mockResolvedValue({
      audioFile: new File(["audio"], "demo.wav", { type: "audio/wav" }),
      transcriptChunks: [{ text: "Oi mundo.", startMs: 0, endMs: 1000 }],
      segments: [{ id: 1, text: "Oi mundo.", startMs: 0, endMs: 1000 }],
      srt: "1\n00:00:00,000 --> 00:00:01,000\nOi mundo.\n",
    });
    const burnVideo = vi.fn().mockResolvedValue(new File(["video"], "demo-legendado.mp4", { type: "video/mp4" }));

    render(<AppShell processVideoFn={processVideo} burnVideoFn={burnVideo} />);

    const input = screen.getByLabelText("Arquivo de video");
    const file = new File(["video"], "demo.mp4", { type: "video/mp4" });

    fireEvent.change(input, { target: { files: [file] } });
    fireEvent.click(screen.getByRole("button", { name: "Enviar video" }));

    expect(await screen.findByText("Oi mundo.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Baixar SRT" })).toHaveAttribute("download", "demo.srt");
    fireEvent.click(screen.getByRole("button", { name: "Baixar vídeo com legenda" }));
    expect(await screen.findByRole("link", { name: "Baixar vídeo legendado" })).toHaveAttribute(
      "download",
      "demo-legendado.mp4",
    );
    expect(processVideo).toHaveBeenCalledWith(file);
    expect(burnVideo).toHaveBeenCalledWith(file, "1\n00:00:00,000 --> 00:00:01,000\nOi mundo.\n");
  });
});
