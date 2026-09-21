import { describe, expect, it } from "vitest";
import {
  canManageLibraryPortalAccess,
  formatLibraryPortalRole,
  isLibraryPortalRole,
} from "@/lib/users/types";

describe("library portal user helpers", () => {
  it("allows only SUPER_ADMIN to manage portal access", () => {
    expect(canManageLibraryPortalAccess("SUPER_ADMIN")).toBe(true);
    expect(canManageLibraryPortalAccess("PUBLISHER_ADMIN")).toBe(false);
    expect(canManageLibraryPortalAccess("PUBLISHER_STAFF")).toBe(false);
    expect(canManageLibraryPortalAccess("LIBRARY_ADMIN")).toBe(false);
  });

  it("recognizes library portal roles", () => {
    expect(isLibraryPortalRole("LIBRARY_ADMIN")).toBe(true);
    expect(isLibraryPortalRole("LIBRARY_STAFF")).toBe(true);
    expect(isLibraryPortalRole("PUBLISHER_ADMIN")).toBe(false);
  });

  it("formats library portal roles for display", () => {
    expect(formatLibraryPortalRole("LIBRARY_ADMIN")).toBe("Library admin");
    expect(formatLibraryPortalRole("LIBRARY_STAFF")).toBe("Library staff");
  });
});
