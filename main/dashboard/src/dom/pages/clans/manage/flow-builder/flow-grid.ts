import { div, effect, baseProps, gridCell, type Instance } from "../../../../factory";
import { buildFlowCard } from "./flow-card.js";
import { flowMetaSignal } from "../../../../../state/flow-builder/flow-store.js";
import { buildConnectorOverlay } from "./connectors/connector-overlay.js";

const WRAP_CLASS = "clans-manage__flow-builder-grid-wrap";
const HSCROLL_CLASS = "clans-manage__flow-builder-hscroll";
const HSCROLL_INNER_CLASS = "clans-manage__flow-builder-hscroll-inner";
const GRID_CLASS = "clans-manage__flow-builder-grid";
const CELLS_CONTAINER_CLASS = "clans-manage__flow-builder-cells";

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

export function buildFlowGrid(clanId: string): Instance<HTMLElement> {
    const wrap = div(baseProps([WRAP_CLASS]));
    const hscroll = div(baseProps([HSCROLL_CLASS]));
    const hscrollInner = div(baseProps([HSCROLL_INNER_CLASS]));
    hscroll.addChild(hscrollInner);
    const host = div(baseProps([GRID_CLASS]));
    const cells = div(baseProps([CELLS_CONTAINER_CLASS]));
    const overlay = buildConnectorOverlay(host.el);
    host.addChild(cells);
    host.addChild(overlay.el);
    wrap.addChild(hscroll);
    wrap.addChild(host);

    let syncing = false;
    const syncFromHost = (): void => {
        if (syncing) return;
        syncing = true;
        hscroll.el.scrollLeft = host.el.scrollLeft;
        syncing = false;
    };
    const syncFromRail = (): void => {
        if (syncing) return;
        syncing = true;
        host.el.scrollLeft = hscroll.el.scrollLeft;
        syncing = false;
    };
    host.el.addEventListener("scroll", syncFromHost);
    hscroll.el.addEventListener("scroll", syncFromRail);

    const syncInnerWidth = (): void => {
        hscrollInner.el.style.width = `${host.el.scrollWidth}px`;
    };
    const ro = new ResizeObserver(syncInnerWidth);
    ro.observe(host.el);

    wrap.trackDispose(
        effect(() => {
            const placements = flowMetaSignal().placements;
            const dims = gridDimensions(placements);
            host.el.style.gridTemplateColumns = `repeat(${dims.columns}, 26rem)`;
            host.el.style.gridTemplateRows = `repeat(${dims.rows}, max-content)`;
            const cellInsts = placements.map((placement) =>
                gridCell({ row: placement.row, col: placement.col }, [buildFlowCard(placement, clanId)]),
            );
            cells.setChildren(...cellInsts);
            requestAnimationFrame(syncInnerWidth);
        }),
    );
    return wrap;
}
