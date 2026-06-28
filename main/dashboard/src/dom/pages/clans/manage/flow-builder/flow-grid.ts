import { div, effect, baseProps, gridCell, wireWheel, type Instance } from "../../../../factory";
import { buildFlowCard } from "./flow-card.js";
import { flowMetaSignal } from "../../../../../state/flow-builder/flow-store.js";

const GRID_CLASS = "clans-manage__flow-builder-grid";

function gridDimensions(placements: ReturnType<typeof flowMetaSignal>["placements"]): {
    rows: number;
    columns: number;
} {
    let rows = 1;
    let columns = 1;
    for (const placement of placements) {
        if (placement.row + 1 > rows) rows = placement.row + 1;
        if (placement.col + 1 > columns) columns = placement.col + 1;
    }
    return { rows, columns };
}

function isVerticallyScrollable(node: Element): boolean {
    if (!(node instanceof HTMLElement)) return false;
    const style = window.getComputedStyle(node);
    if (style.overflowY !== "auto" && style.overflowY !== "scroll") return false;
    return node.scrollHeight > node.clientHeight;
}

function hasInnerScrollableAncestor(target: EventTarget | null, host: HTMLElement): boolean {
    let node: Element | null = target instanceof Element ? target : null;
    while (node !== null && node !== host) {
        if (isVerticallyScrollable(node)) return true;
        node = node.parentElement;
    }
    return false;
}

function attachWheelHorizontal(el: HTMLElement): void {
    wireWheel(el, {
        handler: (e) => {
            if (e.ctrlKey) return;
            if (hasInnerScrollableAncestor(e.target, el)) return;
            e.preventDefault();
            el.scrollLeft += e.deltaY + e.deltaX;
        },
        passive: false,
    });
}

export function buildFlowGrid(clanId: string): Instance<HTMLElement> {
    const host = div(baseProps([GRID_CLASS]));
    attachWheelHorizontal(host.el);
    host.trackDispose(effect(() => {
        const placements = flowMetaSignal().placements;
        const dims = gridDimensions(placements);
        host.el.style.gridTemplateColumns = `repeat(${dims.columns}, 26rem)`;
        host.el.style.gridTemplateRows = `repeat(${dims.rows}, max-content)`;
        const cells = placements.map((placement) =>
            gridCell({ row: placement.row, col: placement.col }, [buildFlowCard(placement, clanId)]),
        );
        host.setChildren(...cells);
    }));
    return host;
}
