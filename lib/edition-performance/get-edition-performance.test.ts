import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  redirect: vi.fn(() => {
    throw new Error("NEXT_REDIRECT");
  }),
}));

vi.mock("@/lib/api/server", () => {
  class ApiError extends Error {
    constructor(
      message: string,
      readonly status: number,
    ) {
      super(message);
      this.name = "ApiError";
    }
  }
  return {
    ApiError,
    apiServerFetch: vi.fn(),
    readApiError: vi.fn(async () => "Upstream request failed."),
  };
});

const { ApiError, apiServerFetch } = await import("@/lib/api/server");
const { getEditionLibraryPerformance, searchEditions } = await import(
  "@/lib/edition-performance/get-edition-performance"
);

const fetchMock = vi.mocked(apiServerFetch);

function jsonResponse(body: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as Response;
}

const report = {
  book: {
    id: "book_silent",
    title: "The Silent Archive",
    authors: "Author Name",
    publisherId: "pub_northwind",
  },
  edition: {
    id: "ed_hardcover",
    bookId: "book_silent",
    title: null,
    format: "HARDCOVER",
    isbn: "9781234567890",
    isbn10: null,
    listPriceCents: 1500,
    currency: "USD",
  },
  summary: {
    libraryCount: 1,
    totalDistributed: 12,
    inStock: 7,
    inTransit: 1,
    sold: 4,
    revenueByCurrency: [{ currency: "USD", totalCents: 6000 }],
  },
  libraries: [
    {
      library: {
        id: "lib_riverside",
        name: "Riverside Public Library",
        slug: "riverside-public-library",
      },
      totalDistributed: 12,
      inStock: 7,
      inTransit: 1,
      sold: 4,
      revenueByCurrency: [{ currency: "USD", totalCents: 6000 }],
    },
  ],
};

const searchItem = {
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

beforeEach(() => {
  fetchMock.mockReset();
});

describe("getEditionLibraryPerformance", () => {
  it("loads the report for the requested edition", async () => {
    fetchMock.mockResolvedValue(jsonResponse(report));

    const result = await getEditionLibraryPerformance("ed_hardcover");

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/editions/ed_hardcover/library-performance",
    );
    expect(result.edition.id).toBe("ed_hardcover");
    expect(result.libraries).toHaveLength(1);
  });

  it("rejects a response for a different edition", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({ ...report, edition: { ...report.edition, id: "ed_other" } }),
    );

    await expect(
      getEditionLibraryPerformance("ed_hardcover"),
    ).rejects.toMatchObject({
      status: 502,
      message: expect.stringContaining("did not match"),
    });
  });

  it("requires an edition id", async () => {
    await expect(getEditionLibraryPerformance("  ")).rejects.toBeInstanceOf(
      ApiError,
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("maps 404 and 403 to scoped errors", async () => {
    fetchMock.mockResolvedValue(jsonResponse({}, 404));
    await expect(
      getEditionLibraryPerformance("ed_missing"),
    ).rejects.toMatchObject({ status: 404, message: "Edition not found." });

    fetchMock.mockResolvedValue(jsonResponse({}, 403));
    await expect(
      getEditionLibraryPerformance("ed_hardcover"),
    ).rejects.toMatchObject({ status: 403 });
  });

  it("rejects a malformed report instead of rendering zeros", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({ ...report, libraries: "not-an-array" }),
    );
    await expect(
      getEditionLibraryPerformance("ed_hardcover"),
    ).rejects.toMatchObject({ status: 502 });

    fetchMock.mockResolvedValue(
      jsonResponse({ book: report.book, edition: report.edition, libraries: [] }),
    );
    await expect(
      getEditionLibraryPerformance("ed_hardcover"),
    ).rejects.toMatchObject({ status: 502 });
  });
});

describe("searchEditions", () => {
  it("does not call the backend for fewer than two characters", async () => {
    await expect(searchEditions("a")).rejects.toMatchObject({ status: 400 });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("requests a single page of editions", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({
        data: [searchItem],
        meta: { page: 1, limit: 10, total: 1, totalPages: 1 },
      }),
    );

    const result = await searchEditions("silent");

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/editions?search=silent&page=1&limit=10",
    );
    expect(result.data).toHaveLength(1);
  });

  it("rejects a malformed search response", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ data: { id: "nope" } }));
    await expect(searchEditions("silent")).rejects.toMatchObject({
      status: 502,
    });
  });
});
