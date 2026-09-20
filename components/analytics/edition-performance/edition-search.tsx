"use client";

import { useRouter } from "next/navigation";
import {
  useEffect,
  useEffectEvent,
  useId,
  useState,
  useTransition,
  type KeyboardEvent,
} from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  EDITION_SEARCH_DEBOUNCE_MS,
  EDITION_SEARCH_ENDPOINT,
  EDITION_SEARCH_INPUT_ID,
  MIN_EDITION_SEARCH_LENGTH,
  editionPerformanceHref,
} from "@/lib/edition-performance/constants";
import { editionSuggestionDetail } from "@/lib/edition-performance/format";
import type { EditionSearchItem } from "@/lib/edition-performance/types";
import { isEditionSearchResult } from "@/lib/edition-performance/validate";

type SearchStatus = "idle" | "loading" | "ready" | "error";

const NO_ITEMS: EditionSearchItem[] = [];

class EditionSearchError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "EditionSearchError";
  }
}

async function requestSuggestions(
  search: string,
  signal: AbortSignal,
): Promise<EditionSearchItem[]> {
  const response = await fetch(
    `${EDITION_SEARCH_ENDPOINT}?search=${encodeURIComponent(search)}`,
    { signal, headers: { Accept: "application/json" } },
  );
  const body: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      typeof (body as { message?: unknown } | null)?.message === "string"
        ? (body as { message: string }).message
        : "Edition search failed.";
    throw new EditionSearchError(message, response.status);
  }
  if (!isEditionSearchResult(body)) {
    throw new EditionSearchError("Edition search response was malformed.", 502);
  }
  return body.data;
}

export function EditionSearch() {
  const router = useRouter();
  const listboxId = `${useId()}-editions`;
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<{
    key: string;
    items: EditionSearchItem[];
  } | null>(null);
  const [failure, setFailure] = useState<{
    key: string;
    message: string;
  } | null>(null);
  const [highlight, setHighlight] = useState({ key: "", index: -1 });
  const [isOpen, setIsOpen] = useState(false);
  const [retryToken, setRetryToken] = useState(0);
  const [isNavigating, startNavigation] = useTransition();

  const search = query.trim();
  const isSearchable = search.length >= MIN_EDITION_SEARCH_LENGTH;
  // Suggestions are keyed by the query that produced them, so a late response
  // for an earlier query can never be rendered or selected.
  const searchKey = `${retryToken}:${search}`;

  const items = result?.key === searchKey ? result.items : NO_ITEMS;
  const errorMessage = failure?.key === searchKey ? failure.message : null;
  const activeIndex = highlight.key === searchKey ? highlight.index : -1;
  const status: SearchStatus = !isSearchable
    ? "idle"
    : errorMessage
      ? "error"
      : result?.key === searchKey
        ? "ready"
        : "loading";

  const handleExpiredSession = useEffectEvent(() => {
    // Re-run the server component so the existing login redirect takes over.
    router.refresh();
  });

  useEffect(() => {
    if (!isSearchable) {
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(() => {
      requestSuggestions(search, controller.signal).then(
        (suggestions) => {
          if (!controller.signal.aborted) {
            setResult({ key: searchKey, items: suggestions });
          }
        },
        (error: unknown) => {
          if (controller.signal.aborted) {
            return;
          }
          if (error instanceof EditionSearchError && error.status === 401) {
            handleExpiredSession();
          }
          setFailure({
            key: searchKey,
            message:
              error instanceof Error ? error.message : "Edition search failed.",
          });
        },
      );
    }, EDITION_SEARCH_DEBOUNCE_MS);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [search, searchKey, isSearchable]);

  function selectEdition(item: EditionSearchItem) {
    setIsOpen(false);
    setQuery("");
    startNavigation(() => {
      router.push(editionPerformanceHref(item.id));
    });
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setIsOpen(true);
      if (items.length > 0) {
        setHighlight({
          key: searchKey,
          index: (activeIndex + 1) % items.length,
        });
      }
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setIsOpen(true);
      if (items.length > 0) {
        setHighlight({
          key: searchKey,
          index: activeIndex <= 0 ? items.length - 1 : activeIndex - 1,
        });
      }
      return;
    }
    if (event.key === "Enter") {
      const active = isOpen ? items[activeIndex] : undefined;
      if (active) {
        event.preventDefault();
        selectEdition(active);
      }
      return;
    }
    if (event.key === "Escape") {
      event.preventDefault();
      setIsOpen(false);
      setHighlight({ key: searchKey, index: -1 });
    }
  }

  const showList = isOpen && isSearchable;
  const liveMessage =
    status === "ready" && items.length > 0
      ? `${items.length} matching edition${items.length === 1 ? "" : "s"}.`
      : "";

  return (
    <section aria-label="Edition search" className="max-w-2xl">
      <div
        className="relative"
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) {
            setIsOpen(false);
          }
        }}
      >
        <Input
          id={EDITION_SEARCH_INPUT_ID}
          label="Search book edition"
          type="text"
          autoComplete="off"
          spellCheck={false}
          placeholder="Search by book title, edition title, or ISBN"
          value={query}
          role="combobox"
          aria-expanded={showList && items.length > 0}
          aria-controls={listboxId}
          aria-autocomplete="list"
          aria-activedescendant={
            showList && activeIndex >= 0
              ? `${listboxId}-option-${activeIndex}`
              : undefined
          }
          onChange={(event) => {
            setQuery(event.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
        />

        {showList ? (
          <div className="absolute inset-x-0 top-full z-20 mt-1 max-h-80 overflow-y-auto rounded-md border border-border bg-card shadow-lg">
            {status === "loading" ? (
              <p
                role="status"
                className="px-3 py-3 text-sm text-muted-foreground"
              >
                Searching editions…
              </p>
            ) : null}

            {status === "error" ? (
              <div role="alert" className="flex flex-col gap-2 px-3 py-3">
                <p className="text-sm text-destructive">
                  {errorMessage ?? "Edition search failed."}
                </p>
                <button
                  type="button"
                  className="self-start text-xs font-medium text-primary underline underline-offset-2"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => setRetryToken((token) => token + 1)}
                >
                  Try again
                </button>
              </div>
            ) : null}

            {status === "ready" && items.length === 0 ? (
              <p
                role="status"
                className="px-3 py-3 text-sm text-muted-foreground"
              >
                No matching editions
              </p>
            ) : null}

            {items.length > 0 ? (
              <ul
                id={listboxId}
                role="listbox"
                aria-label="Edition suggestions"
                className="py-1"
              >
                {items.map((item, index) => (
                  <li
                    key={item.id}
                    id={`${listboxId}-option-${index}`}
                    role="option"
                    aria-selected={index === activeIndex}
                    className={`cursor-pointer px-3 py-2 ${
                      index === activeIndex ? "bg-muted" : "bg-transparent"
                    }`}
                    onMouseDown={(event) => event.preventDefault()}
                    onMouseEnter={() => setHighlight({ key: searchKey, index })}
                    onClick={() => selectEdition(item)}
                  >
                    <span className="flex items-center gap-2">
                      <span className="truncate text-sm font-medium text-foreground">
                        {item.book.title}
                      </span>
                      {item.isActive ? null : (
                        <Badge variant="muted">Inactive</Badge>
                      )}
                    </span>
                    <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                      {editionSuggestionDetail(item)}
                    </span>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        ) : null}
      </div>

      <p aria-live="polite" role="status" className="sr-only">
        {liveMessage}
      </p>
      {isNavigating ? (
        <p className="mt-2 text-xs text-muted-foreground">
          Loading edition report…
        </p>
      ) : null}
    </section>
  );
}
