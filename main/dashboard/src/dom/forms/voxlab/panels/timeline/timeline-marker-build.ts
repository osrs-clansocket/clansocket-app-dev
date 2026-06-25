import { button, type Instance } from "../../../../factory/index.js";
import { TIMELINE_PANEL_MARKER_CLASS } from "../../../../../shared/constants/voxlab/voxlab-classes-constants.js";
import { MS_PER_SECOND, PERCENT_SCALE, type TimelineSource } from "./timeline-component-types.js";
import { formatGroups, formatValue } from "./timeline-component-format.js";
import { onMarkerDown } from "./timeline-component-marker.js";

interface MarkerArgs {
    time: number;
    items: Array<{ property: string; value: unknown }>;
    durationMs: number;
    markerRailEl: HTMLElement;
    getSource: () => TimelineSource | null;
}

function buildMarker(args: MarkerArgs): Instance<HTMLButtonElement> {
    const { time, items, durationMs, markerRailEl, getSource } = args;
    const pct = (time / durationMs) * PERCENT_SCALE;
    const lines = [`${(time / MS_PER_SECOND).toFixed(2)}s`];
    for (const item of items) lines.push(`${item.property}: ${formatValue(item.value)}`);
    const marker = button({
        classes: [TIMELINE_PANEL_MARKER_CLASS],
        type: "button",
        style: `inset-inline-start: ${pct}%`,
        title: lines.join("\n"),
        ariaLabel: `Keyframe at ${(time / MS_PER_SECOND).toFixed(2)}s`,
        context: `voxlab timeline marker — drag to reposition the keyframe at ${(time / MS_PER_SECOND).toFixed(2)}s`,
        meta: ["action"],
    });
    marker.el.addEventListener("pointerdown", (downEvent: PointerEvent) => {
        onMarkerDown({ source: getSource(), originalTime: time, marker, markerRailEl, downEvent, durationMs });
    });
    return marker;
}

export function refreshMarkers(markerRail: Instance, getSource: () => TimelineSource | null): void {
    const source = getSource();
    if (!source) {
        markerRail.clear();
        return;
    }
    const timeline = source.getTimeline();
    if (!timeline || timeline.durationMs <= 0) {
        markerRail.clear();
        return;
    }
    const groups = formatGroups(timeline);
    const next: HTMLElement[] = [];
    for (const time of [...groups.keys()].sort((a, b) => a - b)) {
        const items = groups.get(time);
        if (!items) continue;
        next.push(
            buildMarker({ durationMs: timeline.durationMs, markerRailEl: markerRail.el, time, items, getSource }).el,
        );
    }
    markerRail.setChildren(...next);
}
