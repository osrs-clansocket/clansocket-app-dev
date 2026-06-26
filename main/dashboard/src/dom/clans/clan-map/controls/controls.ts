import { div } from "../../../factory/layout-ops";
import { button, span } from "../../../factory/content-ops";
import { effect, type Signal } from "../../../factory/reactive/index.js";
import type { Instance } from "../../../factory/core";
import type { MapRegion } from "../../../../state/clans/stores/map-regions-store.js";
import type { PositionsState, PositionsPlane } from "../../../../state/clans/stores/positions-store.js";
import {
    gridButton,
    lastKnownButton,
    layersButton,
    modeButton,
    namesButton,
    resetButton,
    zoomButton,
    type ViewMode,
} from "./controls-buttons.js";
import { baseProps } from "../../../factory/index.js";
export type { ViewMode } from "./controls-buttons.js";
import {
    MAP_CHIP_ROW_CLASS,
    MAP_CONTROLS_CLASS,
    MAP_CONTROLS_ROW_CLASS,
    MAP_HOVER_READOUT_CLASS,
    MAP_PLANE_BTN_CLASS,
    MAP_PLANE_COUNT_CLASS,
    REGION_TILE_SPAN,
} from "../../../../shared/constants/clan/clan-map-constants.js";
import { IS_ACTIVE_CLASS, IS_VISIBLE_CLASS } from "../../../../shared/constants/state-modifier-constants.js";

export interface ControlsProps {
    mode$: Signal<ViewMode>;
    activePlane$: Signal<number>;
    gridVisible$: Signal<boolean>;
    namesVisible$: Signal<boolean>;
    lastKnownVisible$: Signal<boolean>;
    mergedLayersVisible$: Signal<boolean>;
    hoverRegion$: Signal<MapRegion | null>;
    positions$: { (): PositionsState };
    onZoomIn: () => void;
    onZoomOut: () => void;
    onResetView: () => void;
}

const PLANE_COUNT = 4;
const PLANES: readonly number[] = Array.from({ length: PLANE_COUNT }, (_, i) => i);

function planeButton(plane: number, activePlane$: Signal<number>): Instance<HTMLButtonElement> {
    const btn = button(
        {
            ariaLabel: `Plane ${plane}`,
            variant: "chip",
            
            classes: [MAP_PLANE_BTN_CLASS],
            onClick: () => activePlane$.set(plane),
            context: `select plane ${plane}`,
            meta: ["action"],
        },
        [span({ context: null, meta: null }, [String(plane)])],
    );
    btn.trackDispose(effect(() => btn.el.classList.toggle(IS_ACTIVE_CLASS, activePlane$() === plane)));
    return btn;
}

function planeLabel(activePlane$: Signal<number>, positions$: ControlsProps["positions$"]): Instance<HTMLElement> {
    const labelSpan = span(baseProps([MAP_PLANE_COUNT_CLASS]), [""]);
    labelSpan.trackDispose(
        effect(() => {
            const plane = activePlane$();
            const state = positions$();
            const count = countOnPlane(state, plane);
            const planeInfo = state.planes.find((p: PositionsPlane) => p.plane === plane);
            const regionCount = planeInfo?.region_count ?? 0;
            labelSpan.setText(`${count} blip${count === 1 ? "" : "s"} · ${regionCount} regions`);
        }),
    );
    return labelSpan;
}

function countOnPlane(state: PositionsState, plane: number): number {
    let count = 0;
    for (const row of state.byHash.values()) {
        if (row.location_plane === plane) count++;
    }
    return count;
}

function hoverReadout(hoverRegion$: Signal<MapRegion | null>): Instance<HTMLElement> {
    const labelSpan = span(baseProps([MAP_HOVER_READOUT_CLASS]), [""]);
    labelSpan.trackDispose(
        effect(() => {
            const r = hoverRegion$();
            if (r === null) {
                labelSpan.setText("");
                labelSpan.el.classList.remove(IS_VISIBLE_CLASS);
                return;
            }
            labelSpan.setText(
                `region ${r.region_id} · world X ${r.base_x}-${r.base_x + REGION_TILE_SPAN} · Y ${r.base_y}-${r.base_y + REGION_TILE_SPAN}`,
            );
            labelSpan.el.classList.add(IS_VISIBLE_CLASS);
        }),
    );
    return labelSpan;
}

function buildModeChips(props: ControlsProps): Instance<HTMLElement> {
    return div(baseProps([MAP_CHIP_ROW_CLASS]), [
        layersButton(props.mergedLayersVisible$),
        modeButton(props.mode$),
        gridButton(props.gridVisible$),
        namesButton(props.namesVisible$),
        lastKnownButton(props.lastKnownVisible$),
    ]);
}

export function clanMapControls(props: ControlsProps): Instance<HTMLElement> {
    const planeChips = div(
        { classes: [MAP_CHIP_ROW_CLASS], context: null, meta: null },
        PLANES.map((p) => planeButton(p, props.activePlane$)),
    );
    const zoomChips = div(baseProps([MAP_CHIP_ROW_CLASS]), [
        zoomButton("−", props.onZoomOut, "zoom out"),
        zoomButton("+", props.onZoomIn, "zoom in"),
        resetButton(props.onResetView),
    ]);
    const topRow = div(baseProps([MAP_CONTROLS_ROW_CLASS]), [
        planeChips,
        buildModeChips(props),
        zoomChips,
        planeLabel(props.activePlane$, props.positions$),
    ]);
    return div(baseProps([MAP_CONTROLS_CLASS]), [topRow, hoverReadout(props.hoverRegion$)]);
}
