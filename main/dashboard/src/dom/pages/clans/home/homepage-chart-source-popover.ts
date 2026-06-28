import {
    BTN_VARIANT_OUTLINE,
    baseProps,
    button,
    div,
    type Instance,
    span,
    textProps,
} from "../../../factory";
import { CHART_PRESETS, defaultSizeFor, type ChartPreset } from "../../../../state/clans/homepage/chart-presets.js";
import type { EditorState } from "./homepage-editor-state.js";

const POPOVER_CLASS = "clans-home__chart-source";
const HEAD_CLASS = "clans-home__chart-source-head";
const LIST_CLASS = "clans-home__chart-source-list";
const ROW_CLASS = "clans-home__chart-source-row";
const ROW_ACTIVE_CLASS = "is-active";
const LABEL_CLASS = "clans-home__chart-source-label";
const DESC_CLASS = "clans-home__chart-source-desc";
const KIND_CLASS = "clans-home__chart-source-kind";

function applyPreset(state: EditorState, id: string, preset: ChartPreset): void {
    const comp = state.draft$().find((c) => c.componentId === id);
    if (comp === undefined) return;
    const size = preset.recommendedSize ?? defaultSizeFor(preset.kind);
    state.setPayload(id, { chartPresetId: preset.id });
    state.resizeComponent(id, comp.canvasX, comp.canvasY, size.w, size.h);
}

function buildRow(state: EditorState, id: string, preset: ChartPreset, currentId: string | undefined): Instance {
    const row = button({
        variant: BTN_VARIANT_OUTLINE,
        classes: [ROW_CLASS, ...(currentId === preset.id ? [ROW_ACTIVE_CLASS] : [])],
        ariaLabel: `Bind ${preset.label}`,
        context: `bind this chart to the ${preset.label} preset`,
        meta: ["action"],
        onClick: () => applyPreset(state, id, preset),
    });
    row.addChild(span(textProps([KIND_CLASS], preset.kind)));
    row.addChild(span(textProps([LABEL_CLASS], preset.label)));
    row.addChild(span(textProps([DESC_CLASS], preset.description)));
    return row;
}

export function buildChartSourcePopover(state: EditorState, id: string): Instance {
    const comp = state.draft$().find((c) => c.componentId === id);
    const currentId = comp?.payload.chartPresetId;
    const head = div(baseProps([HEAD_CLASS]), [span(textProps([], "Chart preset"))]);
    const list = div(baseProps([LIST_CLASS]));
    for (const preset of CHART_PRESETS) list.addChild(buildRow(state, id, preset, currentId));
    return div(baseProps([POPOVER_CLASS]), [head, list]);
}
