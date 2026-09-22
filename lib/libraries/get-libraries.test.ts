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
const { getLibraryPublisherPerformance } = await import(
  "@/lib/libraries/get-libraries"
);

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
