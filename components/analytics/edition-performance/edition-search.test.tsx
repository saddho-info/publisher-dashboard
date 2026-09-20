import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { EditionSearch } from "@/components/analytics/edition-performance/edition-search";
import { EDITION_SEARCH_DEBOUNCE_MS } from "@/lib/edition-performance/constants";
import type { EditionSearchItem } from "@/lib/edition-performance/types";

const push = vi.fn();
const refresh = vi.fn();
const router = { push, refresh };

vi.mock("next/navigation", () => ({
  useRouter: () => router,
}));

const hardcover: EditionSearchItem = {
  id: "ed_hardcover",
  bookId: "book_silent",
  title: null,
  format: "HARDCOVER",
  isbn: "9781234567890",
  isbn10: null,
  listPriceCents: 1500,
  currency: "USD",
  coverImageUrl: null,
  isActive: true,
  book: {
    id: "book_silent",
    title: "The Silent Archive",
    authors: "Author Name",
    publisherId: "pub_northwind",
    slug: "the-silent-archive",
    publisher: {
      id: "pub_northwind",
      name: "Northwind Press",
      slug: "northwind-press",
    },
  },
};

const paperback: EditionSearchItem = {
  ...hardcover,
  id: "ed_paperback",
  title: "Deluxe paperback",
  format: "PAPERBACK",
  isbn: "9780987654321",
  isActive: false,
};

const meta = { page: 1, limit: 10, total: 2, totalPages: 1 };

function jsonResponse(body: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as Response;
}

function sleep(ms: number) {
  return act(
    () => new Promise<void>((resolve) => setTimeout(resolve, ms)),
  ) as Promise<void>;
}

const fetchMock = vi.fn<typeof fetch>();

function setup() {
  const user = userEvent.setup();
  render(<EditionSearch />);
  return { user, input: screen.getByLabelText("Search book edition") };
}

beforeEach(() => {
  push.mockReset();
  refresh.mockReset();
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("EditionSearch", () => {
  it("does not search for fewer than two characters", async () => {
    const { user, input } = setup();

    await user.type(input, "s");
    await sleep(EDITION_SEARCH_DEBOUNCE_MS * 3);

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("debounces the search into a single request", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ data: [hardcover], meta }));
    const { user, input } = setup();

    await user.type(input, "silent");
    expect(fetchMock).not.toHaveBeenCalled();
    expect(screen.getByText("Searching editions…")).toBeVisible();

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/editions/search?search=silent",
      expect.anything(),
    );

    await sleep(EDITION_SEARCH_DEBOUNCE_MS * 2);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("lists every edition as its own suggestion with title, format, and ISBN", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({ data: [hardcover, paperback], meta }),
    );
    const { user, input } = setup();

    await user.type(input, "silent");
    const options = await screen.findAllByRole("option");
    expect(options).toHaveLength(2);

    expect(within(options[0]).getByText("The Silent Archive")).toBeVisible();
    expect(
      within(options[0]).getByText(
        "Hardcover · ISBN 9781234567890 · Author Name",
      ),
    ).toBeVisible();

    expect(within(options[1]).getByText("The Silent Archive")).toBeVisible();
    expect(
      within(options[1]).getByText(
        "Deluxe paperback · Paperback · ISBN 9780987654321 · Author Name",
      ),
    ).toBeVisible();
    expect(within(options[1]).getByText("Inactive")).toBeVisible();
  });

  it("selects the edition id, not the book id, and puts it in the URL", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({ data: [hardcover, paperback], meta }),
    );
    const { user, input } = setup();

    await user.type(input, "silent");
    const options = await screen.findAllByRole("option");
    await user.click(options[0]);

    expect(push).toHaveBeenCalledWith(
      "/analytics/edition-performance?editionId=ed_hardcover",
    );
    expect(push).not.toHaveBeenCalledWith(
      expect.stringContaining("book_silent"),
    );
    expect(screen.queryAllByRole("option")).toHaveLength(0);
  });

  it("supports arrow key navigation and Enter to select", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({ data: [hardcover, paperback], meta }),
    );
    const { user, input } = setup();

    await user.type(input, "silent");
    await screen.findAllByRole("option");

    await user.keyboard("{ArrowDown}{ArrowDown}");
    expect(screen.getAllByRole("option")[1]).toHaveAttribute(
      "aria-selected",
      "true",
    );

    await user.keyboard("{Enter}");
    expect(push).toHaveBeenCalledWith(
      "/analytics/edition-performance?editionId=ed_paperback",
    );
  });

  it("closes the suggestion list on Escape", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ data: [hardcover], meta }));
    const { user, input } = setup();

    await user.type(input, "silent");
    expect(await screen.findAllByRole("option")).toHaveLength(1);

    await user.keyboard("{Escape}");
    expect(screen.queryAllByRole("option")).toHaveLength(0);
  });

  it("ignores a stale in-flight response when the query changes", async () => {
    let resolveStale: ((value: Response) => void) | undefined;
    fetchMock
      .mockReturnValueOnce(
        new Promise<Response>((resolve) => {
          resolveStale = resolve;
        }),
      )
      .mockResolvedValueOnce(jsonResponse({ data: [paperback], meta }));

    const { user, input } = setup();
    await user.type(input, "sil");
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));

    await user.type(input, "ent");
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));

    await act(async () => {
      resolveStale?.(jsonResponse({ data: [hardcover], meta }));
    });

    const options = await screen.findAllByRole("option");
    expect(options).toHaveLength(1);
    expect(within(options[0]).getByText(/Deluxe paperback/)).toBeVisible();
  });

  it("shows an empty state when nothing matches", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({ data: [], meta: { ...meta, total: 0, totalPages: 0 } }),
    );
    const { user, input } = setup();

    await user.type(input, "zzzz");

    expect(await screen.findByText("No matching editions")).toBeVisible();
    expect(screen.queryAllByRole("option")).toHaveLength(0);
  });

  it("shows a retryable error when the search API fails", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({ message: "Edition search is unavailable right now." }, 502),
    );
    const { user, input } = setup();

    await user.type(input, "silent");
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Edition search is unavailable right now.",
    );

    fetchMock.mockResolvedValue(jsonResponse({ data: [hardcover], meta }));
    await user.click(screen.getByRole("button", { name: "Try again" }));

    expect(await screen.findAllByRole("option")).toHaveLength(1);
  });

  it("refreshes through the login flow when the session has expired", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ message: "Unauthorized" }, 401));
    const { user, input } = setup();

    await user.type(input, "silent");

    await waitFor(() => expect(refresh).toHaveBeenCalledTimes(1));
  });
});
