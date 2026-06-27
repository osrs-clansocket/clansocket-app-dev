import { div, effect, baseProps, gridCell, type Instance } from "../../../../factory";
import { buildFlowCard } from "./flow-card.js";
import { flowMetaSignal } from "./flow-card-state.js";

const GRID_CLASS = "clans-manage__flow-builder-grid";

function gridDimensions(placements: ReturnType<typeof flowMetaSignal>["placements"]): { rows: number; columns: number } {
    let rows = 1;
    let columns = 1;
    for (const placement of placements) {
        if (placement.row + 1 > rows) rows = placement.row + 1;
        if (placement.col + 1 > columns) columns = placement.col + 1;
    }
    return { rows, columns };
}

export function buildFlowGrid(): Instance<HTMLElement> {
    const host = div(baseProps([GRID_CLASS]));
    effect(() => {
        const placements = flowMetaSignal().placements;
        const dims = gridDimensions(placements);
        host.el.style.gridTemplateColumns = `repeat(${dims.columns}, minmax(0, 26rem))`;
        host.el.style.gridTemplateRows = `repeat(${dims.rows}, auto)`;
        const cells = placements.map((placement) =>
            gridCell({ row: placement.row, col: placement.col }, [buildFlowCard(placement)]),
        );
        host.setChildren(...cells);
    });
    return host;
}
