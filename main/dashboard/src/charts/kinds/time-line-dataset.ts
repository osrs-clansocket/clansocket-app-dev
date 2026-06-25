import { DISABLED } from "./flags";
import type { TimeLineData } from "../types-series.js";

const BORDER_WIDTH_FULL = 2;
const BORDER_WIDTH_MIN = 1.5;
const POINT_RADIUS_FULL = 2;
const POINT_HOVER_RADIUS = 4;
const TENSION = 0.25;
const FILL_TINT = "14";

export function buildDataset(s: TimeLineData["series"][number], color: string, minimal: boolean) {
    return {
        label: s.label ?? "",
        data: s.points.map((p) => ({ x: p.t as number, y: p.v })),
        borderColor: color,
        backgroundColor: color,
        borderWidth: minimal ? BORDER_WIDTH_MIN : BORDER_WIDTH_FULL,
        pointRadius: minimal ? 0 : POINT_RADIUS_FULL,
        pointHoverRadius: minimal ? 0 : POINT_HOVER_RADIUS,
        tension: TENSION,
        fill: minimal ? { target: "origin" as const, above: `${color}${FILL_TINT}` } : DISABLED,
    };
}
