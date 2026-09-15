const countFormatter = new Intl.NumberFormat("en-US");

const dateTimeFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
});

export function formatCount(value: number): string {
  return countFormatter.format(value);
}

export function formatPercent(value: number): string {
  return `${Math.round(value * 100)}%`;
}

export function formatDateTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return iso;
  }
  return dateTimeFormatter.format(date);
}

export function formatRelativeTime(iso: string, now = new Date()): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return iso;
  }

  const deltaSeconds = Math.round((date.getTime() - now.getTime()) / 1000);
  const abs = Math.abs(deltaSeconds);

  if (abs < 45) {
    return "just now";
  }

  const units: Array<[Intl.RelativeTimeFormatUnit, number]> = [
    ["year", 60 * 60 * 24 * 365],
    ["month", 60 * 60 * 24 * 30],
    ["week", 60 * 60 * 24 * 7],
    ["day", 60 * 60 * 24],
    ["hour", 60 * 60],
    ["minute", 60],
  ];

  const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  for (const [unit, seconds] of units) {
    if (abs >= seconds) {
      return formatter.format(Math.round(deltaSeconds / seconds), unit);
    }
  }

  return formatter.format(deltaSeconds, "second");
}

export function shareOf(value: number, total: number): number {
  if (total <= 0) {
    return 0;
  }
  return value / total;
}
