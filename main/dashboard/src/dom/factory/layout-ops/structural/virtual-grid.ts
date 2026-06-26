import { div } from "./container.js";
import { baseProps, type Instance } from "../../core/index.js";

const DEFAULT_OVERSCAN_ROWS = 4;
const MIN_COLS = 1;

interface VirtualGridProps {
    readonly classes?: readonly string[];
    readonly itemSize: number;
    readonly overscan?: number;
    readonly renderItem: (key: string) => Instance<HTMLElement>;
}

export interface VirtualGridInstance {
    readonly el: HTMLElement;
    setItems(items: readonly string[]): void;
    destroy(): void;
}

interface ViewportState {
    items: readonly string[];
    cols: number;
    width: number;
    height: number;
    scrollTop: number;
}

function computeRange(state: ViewportState, itemSize: number, overscan: number): { start: number; end: number } {
    const startRow = Math.max(0, Math.floor(state.scrollTop / itemSize) - overscan);
    const endRow = Math.ceil((state.scrollTop + state.height) / itemSize) + overscan;
    const start = startRow * state.cols;
    const end = Math.min(state.items.length, endRow * state.cols);
    return { start, end };
}

function buildItem(
    key: string,
    index: number,
    cols: number,
    itemSize: number,
    renderItem: (key: string) => Instance<HTMLElement>,
): Instance<HTMLElement> {
    const inst = renderItem(key);
    const row = Math.floor(index / cols);
    const col = index % cols;
    inst.el.style.position = "absolute";
    inst.el.style.transform = `translate(${col * itemSize}px, ${row * itemSize}px)`;
    inst.el.style.inlineSize = `${itemSize}px`;
    inst.el.style.blockSize = `${itemSize}px`;
    return inst;
}

export function virtualGrid(props: VirtualGridProps): VirtualGridInstance {
    const overscan = props.overscan ?? DEFAULT_OVERSCAN_ROWS;
    const inner = div(baseProps([]));
    inner.el.style.position = "relative";
    const classes = props.classes && props.classes.length > 0 ? props.classes : [];
    const host = div(baseProps(classes), [inner]);
    const state: ViewportState = { items: [], cols: 1, width: 0, height: 0, scrollTop: 0 };

    const sync = (): void => {
        const cols = Math.max(MIN_COLS, Math.floor(state.width / props.itemSize));
        state.cols = cols;
        const totalRows = Math.ceil(state.items.length / cols);
        inner.el.style.blockSize = `${totalRows * props.itemSize}px`;
        const { start, end } = computeRange(state, props.itemSize, overscan);
        const nodes: Instance<HTMLElement>[] = [];
        for (let i = start; i < end; i += 1) {
            const key = state.items[i]!;
            nodes.push(buildItem(key, i, cols, props.itemSize, props.renderItem));
        }
        inner.setChildren(...nodes);
    };

    const onScroll = (): void => {
        state.scrollTop = host.el.scrollTop;
        sync();
    };
    host.el.addEventListener("scroll", onScroll, { passive: true });

    const ro = new ResizeObserver((entries) => {
        for (const entry of entries) {
            const w = entry.contentRect.width;
            const h = entry.contentRect.height;
            if (w === state.width && h === state.height) continue;
            state.width = w;
            state.height = h;
            sync();
        }
    });
    ro.observe(host.el);

    return {
        el: host.el,
        setItems(items): void {
            state.items = items;
            state.scrollTop = 0;
            host.el.scrollTop = 0;
            sync();
        },
        destroy(): void {
            host.el.removeEventListener("scroll", onScroll);
            ro.disconnect();
        },
    };
}
