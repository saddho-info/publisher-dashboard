import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { Button } from "@/components/ui/button";

describe("Button", () => {
  it("renders children and handles clicks", async () => {
    const user = userEvent.setup();
    let clicked = false;
    render(
      <Button onClick={() => {
        clicked = true;
      }}
      >
        Save distribution
      </Button>,
    );

    await user.click(screen.getByRole("button", { name: "Save distribution" }));
    expect(clicked).toBe(true);
  });

  it("disables while loading", () => {
    render(<Button loading>Saving</Button>);
    const button = screen.getByRole("button", { name: "Saving" });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "true");
  });
});
