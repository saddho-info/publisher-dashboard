import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { LibraryPortalUserForm } from "@/components/libraries/library-portal-user-form";
import type { FormState, LibraryUser } from "@/lib/users/types";

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>,
}));

const account: LibraryUser = {
  id: "user_la",
  email: "admin@riverside.example",
  firstName: "River",
  lastName: "Admin",
  role: "LIBRARY_ADMIN",
  isActive: true,
  publisherId: null,
  libraryId: "lib_1",
  createdAt: "2026-01-01",
  updatedAt: "2026-01-01",
};

describe("LibraryPortalUserForm", () => {
  it("renders create fields with library admin as default role", () => {
    const action = vi.fn(async (): Promise<FormState> => ({}));
    render(
      <LibraryPortalUserForm
        action={action}
        cancelHref="/libraries/lib_1"
        submitLabel="Create portal account"
      />,
    );

    expect(screen.getByLabelText(/First name/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Last name/)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Email/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Temporary password/)).toBeRequired();
    expect(screen.getByLabelText(/^Role/)).toHaveValue("LIBRARY_ADMIN");
    expect(screen.getByLabelText(/Active portal account/)).toBeChecked();
  });

  it("prefills edit values and allows optional password", async () => {
    const user = userEvent.setup();
    const action = vi.fn(async (_state: FormState, formData: FormData) => {
      expect(formData.get("firstName")).toBe("River");
      expect(formData.get("email")).toBe("admin@riverside.example");
      expect(formData.get("role")).toBe("LIBRARY_ADMIN");
      expect(formData.get("password")).toBe("");
      expect(formData.get("isActive")).toBeNull();
      return {};
    });

    render(
      <LibraryPortalUserForm
        action={action}
        user={account}
        cancelHref="/libraries/lib_1"
        submitLabel="Save changes"
      />,
    );

    expect(screen.getByLabelText(/First name/)).toHaveValue("River");
    expect(screen.getByLabelText(/New temporary password/)).not.toBeRequired();
    expect(screen.getByLabelText(/Active portal account/)).toBeChecked();

    await user.click(screen.getByLabelText(/Active portal account/));
    await user.click(screen.getByRole("button", { name: "Save changes" }));
    expect(action).toHaveBeenCalled();
  });
});
