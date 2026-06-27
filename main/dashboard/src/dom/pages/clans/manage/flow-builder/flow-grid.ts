import { div, effect, baseProps, gridCell, wirePointerDrag, wireWheel, type Instance } from "../../../../factory";
import { buildFlowCard } from "./flow-card.js";
import { flowMetaSignal } from "./flow-card-state.js";

const GRID_CLASS = "clans-manage__flow-builder-grid";
const GRABBING_CLASS = "clans-manage__flow-builder-grid--grabbing";

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

interface PanState {
    active: boolean;
    pointerId: number;
    startX: number;
    startY: number;
    startScrollLeft: number;
    startScrollTop: number;
}

function attachPan(el: HTMLElement): void {
    const state: PanState = {
        active: false,
        pointerId: -1,
        startX: 0,
        startY: 0,
        startScrollLeft: 0,
        startScrollTop: 0,
    };
    wirePointerDrag(el, {
        down: (e) => {
            if (e.button !== 0) return;
            if (e.target !== el) return;
            state.active = true;
            state.pointerId = e.pointerId;
            state.startX = e.clientX;
            state.startY = e.clientY;
            state.startScrollLeft = el.scrollLeft;
            state.startScrollTop = el.scrollTop;
            el.setPointerCapture(e.pointerId);
            el.classList.add(GRABBING_CLASS);
        },
        move: (e) => {
            if (!state.active || e.pointerId !== state.pointerId) return;
            el.scrollLeft = state.startScrollLeft - (e.clientX - state.startX);
            el.scrollTop = state.startScrollTop - (e.clientY - state.startY);
        },
        up: (e) => {
            if (!state.active || e.pointerId !== state.pointerId) return;
            state.active = false;
            el.releasePointerCapture(e.pointerId);
            el.classList.remove(GRABBING_CLASS);
        },
        cancel: (e) => {
            if (!state.active || e.pointerId !== state.pointerId) return;
            state.active = false;
            el.releasePointerCapture(e.pointerId);
            el.classList.remove(GRABBING_CLASS);
        },
    });
}

function attachWheelHorizontal(el: HTMLElement): void {
    wireWheel(el, {
        handler: (e) => {
            if (e.ctrlKey) return;
            e.preventDefault();
            el.scrollLeft += e.deltaY + e.deltaX;
        },
        passive: false,
    });
}

export function buildFlowGrid(): Instance<HTMLElement> {
    const host = div(baseProps([GRID_CLASS]));
    attachPan(host.el);
    attachWheelHorizontal(host.el);
    effect(() => {
        const placements = flowMetaSignal().placements;
        const dims = gridDimensions(placements);
        host.el.style.gridTemplateColumns = `repeat(${dims.columns}, 26rem)`;
        host.el.style.gridTemplateRows = `repeat(${dims.rows}, max-content)`;
        const cells = placements.map((placement) =>
            gridCell({ row: placement.row, col: placement.col }, [buildFlowCard(placement)]),
        );
        host.setChildren(...cells);
    });
    return host;
}
