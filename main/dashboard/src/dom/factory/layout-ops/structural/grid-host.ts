import { div } from "./container.js";
import { baseProps, type Child, type Instance } from "../../core/index.js";

export interface GridHostProps {
    readonly columns: number;
    readonly rows: number;
    readonly cellWidthRem: number;
    readonly cellHeightRem: number;
    readonly columnGapRem: number;
    readonly rowGapRem: number;
    readonly classes?: readonly string[];
}

export function gridHost(props: GridHostProps, children: readonly Child[] = []): Instance<HTMLElement> {
    const inst = div(baseProps(props.classes ?? []), children);
    const cw = `${props.cellWidthRem}rem`;
    const ch = `${props.cellHeightRem}rem`;
    inst.el.style.display = "grid";
    inst.el.style.gridTemplateColumns = `repeat(${props.columns}, ${cw})`;
    inst.el.style.gridTemplateRows = `repeat(${props.rows}, ${ch})`;
    inst.el.style.columnGap = `${props.columnGapRem}rem`;
    inst.el.style.rowGap = `${props.rowGapRem}rem`;
    return inst;
}
