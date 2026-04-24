import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import HomePage from "@/app/page";

describe("workspace", () => {
  it("shows a real file input for video uploads", () => {
    render(<HomePage />);

    expect(screen.getByLabelText("Arquivo de video")).toBeInTheDocument();
    expect(screen.getByText("Carregue um video para comecar")).toBeInTheDocument();
  });
});
