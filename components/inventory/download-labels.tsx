"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";

type LabelFormat = "a4" | "thermal";
type LabelStatus = "IN_STOCK_PUBLISHER" | "all";

export function DownloadLabels({ editionId }: { editionId: string }) {
  const [format, setFormat] = useState<LabelFormat>("a4");
  const [status, setStatus] =
    useState<LabelStatus>("IN_STOCK_PUBLISHER");
  const [limit, setLimit] = useState("100");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();

  async function download() {
    setLoading(true);
    setError(undefined);

    try {
      const query = new URLSearchParams({ format, status, limit });
      const response = await fetch(
        `/api/labels/${encodeURIComponent(editionId)}?${query}`,
      );
      if (!response.ok) {
        const body = (await response.json().catch(() => ({}))) as {
          message?: string;
        };
        throw new Error(body.message ?? "Could not generate labels.");
      }

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const disposition = response.headers.get("content-disposition") ?? "";
      const filename =
        disposition.match(/filename="?([^";]+)"?/i)?.[1] ??
        `labels-${format}.pdf`;
      const anchor = document.createElement("a");
      anchor.href = objectUrl;
      anchor.download = filename;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(objectUrl);
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Could not generate labels.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-3 border-t pt-4">
      <div>
        <h3 className="text-sm font-medium">Download QR labels</h3>
        <p className="text-xs text-muted-foreground">
          Export publisher-stock copies as print-ready label sheets.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <Select
          label="Layout"
          value={format}
          onChange={(event) => setFormat(event.target.value as LabelFormat)}
          options={[
            { value: "a4", label: "A4 sheet (24/page)" },
            { value: "thermal", label: "Thermal roll (50 × 25 mm)" },
          ]}
        />
        <Select
          label="Copies"
          value={status}
          onChange={(event) => setStatus(event.target.value as LabelStatus)}
          options={[
            { value: "IN_STOCK_PUBLISHER", label: "Publisher stock" },
            { value: "all", label: "All copies" },
          ]}
        />
        <Select
          label="Maximum labels"
          value={limit}
          onChange={(event) => setLimit(event.target.value)}
          options={[
            { value: "24", label: "24" },
            { value: "100", label: "100" },
            { value: "250", label: "250" },
            { value: "500", label: "500" },
          ]}
        />
      </div>
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
      <Button
        type="button"
        variant="secondary"
        loading={loading}
        onClick={download}
        className="self-start"
      >
        Download labels
      </Button>
    </div>
  );
}
