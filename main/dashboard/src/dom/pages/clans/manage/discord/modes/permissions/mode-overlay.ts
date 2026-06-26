import { svg as svgEl } from "../../../../../../factory/content-ops/graphics/svg.js";
import type { Instance } from "../../../../../../factory";
import { OVERLAY_CLASS, WIRE_CLASS } from "./mode-constants.js";
import type { OverlayApi } from "./mode-constants.js";
import { svgLine } from "./mode-drag-state.js";

type SvgInstance = ReturnType<typeof svgEl>;

function addWireLine(svgOverlay: SvgInstance, src: { x: number; y: number }, tgt: { x: number; y: number }): void {
    svgOverlay.addChild(
        svgLine({
            classes: [WIRE_CLASS],
            x1: src.x.toString(),
            y1: src.y.toString(),
            x2: tgt.x.toString(),
            y2: tgt.y.toString(),
        }),
    );
}

function paintWires(svgOverlay: SvgInstance, rowsHost: Instance, source: HTMLElement, targets: HTMLElement[]): void {
    svgOverlay.clear();
    svgOverlay.el.style.width = `${rowsHost.el.scrollWidth}px`;
    svgOverlay.el.style.height = `${rowsHost.el.scrollHeight}px`;
    const hostRect = rowsHost.el.getBoundingClientRect();
    const sl = rowsHost.el.scrollLeft;
    const st = rowsHost.el.scrollTop;
    const centerOf = (el: Element): { x: number; y: number } => {
        const r = el.getBoundingClientRect();
        return { x: r.left + r.width / 2 - hostRect.left + sl, y: r.top + r.height / 2 - hostRect.top + st };
    };
    const src = centerOf(source);
    for (const t of targets) {
        if (t === source) continue;
        addWireLine(svgOverlay, src, centerOf(t));
    }
}

interface OverlayApiDeps {
    svgOverlay: SvgInstance;
    getSrc: () => HTMLElement | null;
    setSrc: (s: HTMLElement | null) => void;
    setTargets: (t: HTMLElement[]) => void;
    draw: () => void;
}

function buildOverlayApi(deps: OverlayApiDeps): OverlayApi {
    return {
        apply: (s, ts) => {
            deps.setSrc(s);
            deps.setTargets(ts);
            deps.draw();
        },
        clear: () => {
            deps.setSrc(null);
            deps.setTargets([]);
            deps.svgOverlay.clear();
        },
        redrawIfActive: () => {
            if (deps.getSrc() !== null) deps.draw();
        },
    };
}

export function createWireOverlay(rowsHost: Instance): OverlayApi {
    const svgOverlay = svgEl({ classes: [OVERLAY_CLASS] });
    rowsHost.addChild(svgOverlay.el);
    let source: HTMLElement | null = null;
    let targets: HTMLElement[] = [];
    const draw = (): void => {
        if (source === null || targets.length === 0) svgOverlay.clear();
        else paintWires(svgOverlay, rowsHost, source, targets);
    };
    rowsHost.el.addEventListener("scroll", () => {
        if (source !== null) draw();
    });
    return buildOverlayApi({
        svgOverlay,
        draw,
        getSrc: () => source,
        setSrc: (s) => {
            source = s;
        },
        setTargets: (t) => {
            targets = t;
        },
    });
}
