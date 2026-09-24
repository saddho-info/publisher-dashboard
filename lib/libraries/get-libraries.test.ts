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

const { apiServerFetch } = await import("@/lib/api/server");
const { getLibraryEditionPerformance, getLibraryPublisherPerformance } =
  await import("@/lib/libraries/get-libraries");

const fetchMock = vi.mocked(apiServerFetch);

function jsonResponse(body: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as Response;
}

const performance = {
  library: {
    id: "lib_riverside",
    name: "Riverside Public Library",
    slug: "riverside-public-library",
  },
  summary: {
    totalDistributed: 20,
    inStock: 11,
    inTransit: 2,
    sold: 7,
    revenueByCurrency: [
      { currency: "USD", totalCents: 10500 },
      { currency: "EUR", totalCents: 4500 },
    ],
  },
};

beforeEach(() => {
  fetchMock.mockReset();
});

describe("getLibraryPublisherPerformance", () => {
  it("loads publisher-scoped performance for the requested library", async () => {
    fetchMock.mockResolvedValue(jsonResponse(performance));

    const result = await getLibraryPublisherPerformance("lib_riverside");

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/libraries/lib_riverside/publisher-performance",
    );
    expect(result).toEqual(performance);
  });

  it("encodes the library id and rejects an empty id", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({
        ...performance,
        library: { ...performance.library, id: "library/one" },
      }),
    );

    await getLibraryPublisherPerformance(" library/one ");
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/libraries/library%2Fone/publisher-performance",
    );

    await expect(getLibraryPublisherPerformance("  ")).rejects.toMatchObject({
      status: 400,
    });
  });

  it("preserves forbidden and not-found errors", async () => {
    fetchMock.mockResolvedValue(jsonResponse({}, 403));
    await expect(
      getLibraryPublisherPerformance("lib_riverside"),
    ).rejects.toMatchObject({ status: 403 });

    fetchMock.mockResolvedValue(jsonResponse({}, 404));
    await expect(
      getLibraryPublisherPerformance("lib_missing"),
    ).rejects.toMatchObject({ status: 404, message: "Library not found." });
  });

  it("rejects malformed or mismatched reports", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({
        ...performance,
        summary: { ...performance.summary, sold: "7" },
      }),
    );
    await expect(
      getLibraryPublisherPerformance("lib_riverside"),
    ).rejects.toMatchObject({ status: 502 });

    fetchMock.mockResolvedValue(
      jsonResponse({
        ...performance,
        library: { ...performance.library, id: "lib_other" },
      }),
    );
    await expect(
      getLibraryPublisherPerformance("lib_riverside"),
    ).rejects.toMatchObject({
      status: 502,
      message: expect.stringContaining("did not match"),
    });
  });
});

const editionPerformance = {
  library: performance.library,
  summary: performance.summary,
  editions: [
    {
      book: {
        id: "book_silent",
        title: "The Silent Archive",
        authors: "Author Name",
        publisherId: "pub_1",
      },
      edition: {
        id: "ed_hardcover",
        bookId: "book_silent",
        title: null,
        format: "HARDCOVER",
        isbn: "9781234567890",
        isbn10: null,
        listPriceCents: 2000,
        currency: "USD",
      },
      totalDistributed: 12,
      inStock: 7,
      inTransit: 1,
      sold: 4,
      revenueByCurrency: [{ currency: "USD", totalCents: 6000 }],
    },
  ],
};

const emptyPage = { data: [], meta: { page: 1, limit: 100, total: 0, totalPages: 0 } };

function mockEditionPerformanceFallback(routes: Record<string, unknown>) {
  fetchMock.mockImplementation(async (path: string) => {
    if (path.includes("/edition-performance")) {
      return jsonResponse({}, 404);
    }
    for (const [fragment, body] of Object.entries(routes)) {
      if (path.startsWith(fragment)) {
        return jsonResponse(body);
      }
    }
    return jsonResponse({}, 500);
  });
}

describe("getLibraryEditionPerformance", () => {
  it("loads publisher-scoped editions for the requested library", async () => {
    fetchMock.mockResolvedValue(jsonResponse(editionPerformance));

    const result = await getLibraryEditionPerformance("lib_riverside");

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/libraries/lib_riverside/edition-performance",
    );
    expect(result).toEqual(editionPerformance);
  });

  it("rejects malformed or mismatched reports", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({
        ...editionPerformance,
        editions: [{ ...editionPerformance.editions[0], sold: "4" }],
      }),
    );
    await expect(
      getLibraryEditionPerformance("lib_riverside"),
    ).rejects.toMatchObject({ status: 502 });

    fetchMock.mockResolvedValue(
      jsonResponse({
        ...editionPerformance,
        library: { ...editionPerformance.library, id: "lib_other" },
      }),
    );
    await expect(
      getLibraryEditionPerformance("lib_riverside"),
    ).rejects.toMatchObject({
      status: 502,
      message: expect.stringContaining("did not match"),
    });
  });

  it("preserves forbidden errors", async () => {
    fetchMock.mockResolvedValue(jsonResponse({}, 403));
    await expect(
      getLibraryEditionPerformance("lib_riverside"),
    ).rejects.toMatchObject({ status: 403 });
  });

  it("composes the ledger from copies, sales, and distributions when the dedicated route is missing", async () => {
    mockEditionPerformanceFallback({
      "/api/v1/libraries/lib_riverside": performance.library,
      "/api/v1/copies": {
        data: [
          {
            status: "IN_STOCK_LIBRARY",
            edition: {
              id: "ed_hardcover",
              isbn: "9781234567890",
              format: "HARDCOVER",
              title: null,
              listPriceCents: 2000,
              currency: "USD",
              book: {
                id: "book_silent",
                title: "The Silent Archive",
                authors: "Author Name",
                publisherId: "pub_1",
              },
            },
          },
          {
            status: "DISTRIBUTED",
            edition: {
              id: "ed_hardcover",
              isbn: "9781234567890",
              format: "HARDCOVER",
              title: null,
              book: {
                id: "book_silent",
                title: "The Silent Archive",
                authors: "Author Name",
                publisherId: "pub_1",
              },
            },
          },
        ],
        meta: { page: 1, limit: 100, total: 2, totalPages: 1 },
      },
      "/api/v1/sales": {
        data: [
          {
            currency: "USD",
            items: [
              {
                quantity: 2,
                unitPriceCents: 1500,
                edition: {
                  id: "ed_hardcover",
                  isbn: "9781234567890",
                  format: "HARDCOVER",
                  title: null,
                  book: {
                    id: "book_silent",
                    title: "The Silent Archive",
                    authors: "Author Name",
                    publisherId: "pub_1",
                  },
                },
              },
            ],
          },
        ],
        meta: { page: 1, limit: 100, total: 1, totalPages: 1 },
      },
      "/api/v1/distributions": {
        data: [
          {
            status: "DISPATCHED",
            items: [
              {
                quantity: 12,
                editionId: "ed_hardcover",
                edition: {
                  id: "ed_hardcover",
                  isbn: "9781234567890",
                  format: "HARDCOVER",
                  title: null,
                  book: {
                    id: "book_silent",
                    title: "The Silent Archive",
                    authors: "Author Name",
                  },
                },
              },
            ],
          },
          {
            status: "CANCELLED",
            items: [
              {
                quantity: 99,
                edition: { id: "ed_hardcover", isbn: "9781234567890" },
              },
            ],
          },
        ],
        meta: { page: 1, limit: 100, total: 2, totalPages: 1 },
      },
    });

    const result = await getLibraryEditionPerformance("lib_riverside");

    expect(result.library).toEqual(performance.library);
    expect(result.editions).toEqual([
      {
        book: {
          id: "book_silent",
          title: "The Silent Archive",
          authors: "Author Name",
          publisherId: "pub_1",
        },
        edition: {
          id: "ed_hardcover",
          bookId: "book_silent",
          title: null,
          format: "HARDCOVER",
          isbn: "9781234567890",
          isbn10: null,
          listPriceCents: 2000,
          currency: "USD",
        },
        totalDistributed: 12,
        inStock: 1,
        inTransit: 1,
        sold: 2,
        revenueByCurrency: [{ currency: "USD", totalCents: 3000 }],
      },
    ]);
    expect(result.summary).toEqual({
      totalDistributed: 12,
      inStock: 1,
      inTransit: 1,
      sold: 2,
      revenueByCurrency: [{ currency: "USD", totalCents: 3000 }],
    });
  });

  it("returns an empty editions list when the dedicated route is missing and the library has no copies", async () => {
    mockEditionPerformanceFallback({
      "/api/v1/libraries/lib_riverside": performance.library,
      "/api/v1/copies": emptyPage,
      "/api/v1/sales": emptyPage,
      "/api/v1/distributions": emptyPage,
    });

    await expect(
      getLibraryEditionPerformance("lib_riverside"),
    ).resolves.toEqual({
      library: performance.library,
      summary: {
        totalDistributed: 0,
        inStock: 0,
        inTransit: 0,
        sold: 0,
        revenueByCurrency: [],
      },
      editions: [],
    });
  });
});
