import { div } from "./container.js";
import { baseProps, type Child, type Instance } from "../../core/index.js";

export interface GridCellProps {
    readonly row: number;
    readonly col: number;
    readonly rowSpan?: number;
    readonly colSpan?: number;
    readonly classes?: readonly string[];
}

export function gridCell(props: GridCellProps, children: readonly Child[] = []): Instance<HTMLElement> {
    const inst = div(baseProps(props.classes ?? []), children);
    const rowSpan = props.rowSpan ?? 1;
    const colSpan = props.colSpan ?? 1;
    inst.el.style.gridRow = `${props.row + 1} / span ${rowSpan}`;
    inst.el.style.gridColumn = `${props.col + 1} / span ${colSpan}`;
    return inst;
}
