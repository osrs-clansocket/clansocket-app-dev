import { effect, type ReadSignal, type Signal } from "../../../factory/reactive/index.js";
import { scheduleOp } from "../../../factory/scheduler/index.js";
import type { Instance } from "../../../factory/core";
import type { PositionsState } from "../../../../state/clans/stores/positions-store.js";
import type { AtlasBox } from "../../../../shared/types/view-types.js";
import { MINIMAP_H, MINIMAP_W, SCALE_X, SCALE_Y } from "./minimap-dimensions.js";
import {
    ALERT_ALPHA_MAX,
    ALERT_ALPHA_MIN,
    PULSE_CYCLE_MS,
    paintMinimapPulses,
    type MinimapPaintCtx,
} from "./minimap-pulse.js";

const BLIP_LINE_WIDTH = 0.5;
const VIEWBOX_STROKE = "#c9a84c";
const VIEWBOX_LINE_W = 1.5;
const BLIP_FILL = "#ff5252";
const BLIP_STROKE = "#0b0e13";
const BLIP_RADIUS = 2;
const TWO_PI = Math.PI * 2;

interface PaintMinimapOpts {
    ctx: CanvasRenderingContext2D;
    viewport: AtlasBox;
    positions: PositionsState;
    plane: number;
    alertedHashes: ReadonlySet<string>;
}

function paintMinimapBlips(p: MinimapPaintCtx, alertAlpha: number): void {
    const { ctx, positions, plane, alertedHashes, meta } = p;
    ctx.fillStyle = BLIP_FILL;
    ctx.strokeStyle = BLIP_STROKE;
    ctx.lineWidth = BLIP_LINE_WIDTH;
    for (const row of positions.byHash.values()) {
        if (row.location_plane !== plane) continue;
        const ix = (row.location_x - meta.origin_world_x) * meta.pixels_per_tile;
        const iy = (meta.top_world_y - row.location_y) * meta.pixels_per_tile;
        const isAlerted = alertedHashes.has(row.account_hash);
        if (isAlerted) ctx.globalAlpha = alertAlpha;
        ctx.beginPath();
        ctx.arc(ix * SCALE_X, iy * SCALE_Y, BLIP_RADIUS, 0, TWO_PI);
        ctx.fill();
        ctx.stroke();
        if (isAlerted) ctx.globalAlpha = 1;
    }
}

function paintMinimap({ ctx, viewport, positions, plane, alertedHashes }: PaintMinimapOpts): void {
    ctx.clearRect(0, 0, MINIMAP_W, MINIMAP_H);
    ctx.strokeStyle = VIEWBOX_STROKE;
    ctx.lineWidth = VIEWBOX_LINE_W;
    ctx.strokeRect(viewport.x * SCALE_X, viewport.y * SCALE_Y, viewport.w * SCALE_X, viewport.h * SCALE_Y);
    const meta = positions.mapMeta;
    if (meta === null) return;
    const nowMs = alertedHashes.size > 0 ? performance.now() : 0;
    const paintCtx: MinimapPaintCtx = { ctx, positions, plane, alertedHashes, meta };
    paintMinimapPulses(paintCtx, nowMs);
    const PULSE_PHASE_BIAS = 0.5;
    const PULSE_PHASE_AMP = 0.5;
    const phase = (nowMs % PULSE_CYCLE_MS) / PULSE_CYCLE_MS;
    const alertAlpha =
        ALERT_ALPHA_MIN +
        (ALERT_ALPHA_MAX - ALERT_ALPHA_MIN) * (PULSE_PHASE_BIAS + PULSE_PHASE_AMP * Math.cos(phase * Math.PI * 2));
    paintMinimapBlips(paintCtx, alertAlpha);
}

export interface PaintLoopProps {
    positions$: ReadSignal<PositionsState>;
    viewport$: Signal<AtlasBox>;
    activePlane$: Signal<number>;
    alertedHashes$: ReadSignal<ReadonlySet<string>>;
    paintTick$: ReadSignal<number>;
}

function makeMinimapPainter(
    props: PaintLoopProps,
    ctx: CanvasRenderingContext2D | null,
    scheduledRef: { v: boolean },
): () => void {
    return () => {
        scheduledRef.v = false;
        if (ctx === null) return;
        paintMinimap({
            ctx,
            viewport: props.viewport$(),
            positions: props.positions$(),
            plane: props.activePlane$(),
            alertedHashes: props.alertedHashes$(),
        });
    };
}

export function wirePaintLoop(props: PaintLoopProps, overlay: Instance<HTMLCanvasElement>): void {
    const ctx = overlay.el.getContext("2d");
    const scheduledRef = { v: false };
    const doPaint = makeMinimapPainter(props, ctx, scheduledRef);
    const schedulePaint = (): void => {
        if (scheduledRef.v) return;
        scheduledRef.v = true;
        scheduleOp(doPaint, "animation");
    };
    overlay.trackDispose(
        effect(() => {
            props.viewport$();
            props.positions$();
            props.activePlane$();
            props.alertedHashes$();
            props.paintTick$();
            schedulePaint();
        }),
    );
}
