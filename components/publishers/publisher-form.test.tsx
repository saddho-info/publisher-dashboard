import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { PublisherForm } from "@/components/publishers/publisher-form";
import type { FormState, PublisherDetail } from "@/lib/publishers/types";

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>,
}));

const publisher: PublisherDetail = {
  id: "pub_1",
  name: "Northwind Press",
  slug: "northwind-press",
  email: "ops@northwind.example",
  phone: "+1-555-0100",
  address: "1 Harbor Way",
  isActive: true,
  createdAt: "2026-01-01",
  updatedAt: "2026-01-01",
  _count: { users: 2 },
};

describe("PublisherForm", () => {
  it("renders create fields with active checked by default", () => {
    const action = vi.fn(async (): Promise<FormState> => ({}));
    render(
      <PublisherForm
        action={action}
        cancelHref="/publishers"
        submitLabel="Create publisher"
      />,
    );

    expect(screen.getByLabelText(/Publisher name/)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Slug/)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Email/)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Phone/)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Address/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Active publisher/)).toBeChecked();
    expect(
      screen.getByRole("button", { name: "Create publisher" }),
    ).toBeInTheDocument();
  });

  it("prefills edit values and submits active state from the checkbox", async () => {
    const user = userEvent.setup();
    const action = vi.fn(async (_state: FormState, formData: FormData) => {
      expect(formData.get("name")).toBe("Northwind Press");
      expect(formData.get("isActive")).toBeNull();
      return {};
    });

    render(
      <PublisherForm
        action={action}
        publisher={publisher}
        cancelHref="/publishers/pub_1"
        submitLabel="Save changes"
      />,
    );

    expect(screen.getByLabelText(/Publisher name/)).toHaveValue(
      "Northwind Press",
    );
    expect(screen.getByLabelText(/^Slug/)).toHaveValue("northwind-press");
    expect(screen.getByLabelText(/Active publisher/)).toBeChecked();

    await user.click(screen.getByLabelText(/Active publisher/));
    expect(screen.getByLabelText(/Active publisher/)).not.toBeChecked();

    await user.click(screen.getByRole("button", { name: "Save changes" }));
    expect(action).toHaveBeenCalled();
  });
});
