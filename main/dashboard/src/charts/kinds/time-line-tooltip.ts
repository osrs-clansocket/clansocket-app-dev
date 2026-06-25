import type { TooltipItem } from "chart.js";
import { formatNumber } from "../formatters/number-formatter.js";
import type { LineKind } from "./time-line-kind.js";

export function tooltipTitle(items: TooltipItem<LineKind>[]): string {
    const x = items[0]?.parsed?.x;
    return typeof x === "number" ? new Date(x).toLocaleString() : "";
}

export function tooltipLabel(item: TooltipItem<LineKind>): string {
    const label = item.dataset.label ? `${item.dataset.label}: ` : "";
    const y = item.parsed.y;
    return `${label}${y == null ? "—" : formatNumber(y)}`;
}
