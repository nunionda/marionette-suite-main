import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PipelineStepBadge } from "../PipelineStepBadge";

describe("PipelineStepBadge", () => {
  it("renders Korean label for each status", () => {
    const { rerender } = render(<PipelineStepBadge status="not_started" />);
    expect(screen.getByText("대기")).toBeInTheDocument();
    rerender(<PipelineStepBadge status="in_progress" />);
    expect(screen.getByText("진행")).toBeInTheDocument();
    rerender(<PipelineStepBadge status="review" />);
    expect(screen.getByText("검토")).toBeInTheDocument();
    rerender(<PipelineStepBadge status="locked" />);
    expect(screen.getByText("확정")).toBeInTheDocument();
  });
});
