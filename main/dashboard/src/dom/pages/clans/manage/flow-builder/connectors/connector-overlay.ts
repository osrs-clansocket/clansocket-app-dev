import { effect } from "../../../../../factory";
import { path, svg, type SvgInstance } from "../../../../../factory/content-ops/graphics/svg.js";
import { flowMetaSignal } from "../../../../../../state/flow-builder/flow-store.js";
import type { FlowEdge } from "../flow-card-types.js";
import { rowColor } from "./row-color.js";

const SVG_CLASS = "clans-manage__flow-builder-connectors";
const PATH_CLASS = "clans-manage__flow-builder-connector-path";

interface Anchor {
    readonly x: number;
    readonly y: number;
}

interface CardBox {
    readonly left: number;
    readonly right: number;
    readonly top: number;
    readonly bottom: number;
}

function readCardBoxes(scrollHost: HTMLElement): Map<string, CardBox> {
    const out = new Map<string, CardBox>();
    const hostRect = scrollHost.getBoundingClientRect();
    const sl = scrollHost.scrollLeft;
    const st = scrollHost.scrollTop;
    const cards = scrollHost.querySelectorAll<HTMLElement>(".clans-manage__flow-builder-card-slot[data-card-id]");
    for (const el of cards) {
        const id = el.getAttribute("data-card-id");
        if (!id) continue;
        const r = el.getBoundingClientRect();
        out.set(id, {
            left: r.left - hostRect.left + sl,
            right: r.right - hostRect.left + sl,
            top: r.top - hostRect.top + st,
            bottom: r.bottom - hostRect.top + st,
        });
    }
    return out;
}

function sourceAnchor(box: CardBox): Anchor {
    return { x: box.right, y: (box.top + box.bottom) / 2 };
}

function targetAnchor(box: CardBox): Anchor {
    return { x: box.left, y: (box.top + box.bottom) / 2 };
}

function pathFor(source: Anchor, target: Anchor): string {
    const dx = Math.max(40, Math.abs(target.x - source.x) / 2);
    const c1x = source.x + dx;
    const c2x = target.x - dx;
    return `M ${source.x} ${source.y} C ${c1x} ${source.y}, ${c2x} ${target.y}, ${target.x} ${target.y}`;
}

function buildEdgePath(edge: FlowEdge, boxes: Map<string, CardBox>, targetRow: number): SvgInstance<SVGPathElement> | null {
    const from = boxes.get(edge.from_node_id);
    const to = boxes.get(edge.to_node_id);
    if (!from || !to) return null;
    const d = pathFor(sourceAnchor(from), targetAnchor(to));
    return path({ classes: [PATH_CLASS], d, stroke: rowColor(targetRow) });
}

function targetRowFor(meta: ReturnType<typeof flowMetaSignal>, edge: FlowEdge): number {
    const target = meta.placements.find((p) => p.config.id === edge.to_node_id);
    return target ? target.row : 0;
}

export function buildConnectorOverlay(scrollHost: HTMLElement): SvgInstance<SVGSVGElement> {
    const overlay = svg({ classes: [SVG_CLASS] });
    const recompute = (): void => {
        overlay.clear();
        const w = Math.max(scrollHost.scrollWidth, scrollHost.clientWidth, 1);
        const h = Math.max(scrollHost.scrollHeight, scrollHost.clientHeight, 1);
        overlay.el.style.width = `${w}px`;
        overlay.el.style.height = `${h}px`;
        const meta = flowMetaSignal();
        const boxes = readCardBoxes(scrollHost);
        for (const edge of meta.edges) {
            const p = buildEdgePath(edge, boxes, targetRowFor(meta, edge));
            if (p) overlay.addChild(p);
        }
    };
    const scheduleRecompute = (): void => {
        requestAnimationFrame(recompute);
    };
    scheduleRecompute();
    effect(() => {
        void flowMetaSignal();
        scheduleRecompute();
    });
    const ro = new ResizeObserver(scheduleRecompute);
    ro.observe(scrollHost);
    scrollHost.addEventListener("scroll", scheduleRecompute);
    const mo = new MutationObserver(scheduleRecompute);
    mo.observe(scrollHost, { childList: true, subtree: true });
    return overlay;
}
