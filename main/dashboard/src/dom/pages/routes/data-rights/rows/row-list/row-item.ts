import { div, effect, snapshot, type Instance, type ReadSignal } from "../../../../../factory/index.js";
import { rowSummary } from "../../../../../../state/data-rights/summary.js";
import { pkKeyOf } from "../../../../../../state/data-rights/page-state/formatters/pk-key-formatter.js";
import {
    applyAsset,
    buildRowButton,
    buildSummaryParts,
    liveDeleteButton,
    resolvePrimaryAsset,
} from "./row-item-parts.js";
import { DR_ROW_ITEM_CLASS } from "../../../../../../shared/constants/rights-constants.js";
import { IS_SELECTED_CLASS } from "../../../../../../shared/constants/state-modifier-constants.js";

export interface DataRowCtx {
    table: string;
    pkCols: readonly string[];
    tsCol: string | null;
    secretColumns: readonly string[];
    canDeleteRow: boolean;
    selectedKey: ReadSignal<string | null>;
    onSelect: (key: string) => void;
    onDelete: (key: string) => void;
}

interface RowCellRefs {
    primary: Instance;
    secondary: Instance | null;
    meta: Instance | null;
    assetEl: HTMLImageElement;
}

const cellRefs = new WeakMap<HTMLElement, RowCellRefs>();

export function mountDataRow(row: Record<string, unknown>, ctx: DataRowCtx): Instance {
    const key = pkKeyOf(row, ctx.pkCols);
    const sum = rowSummary({
        row,
        table: ctx.table,
        pkCols: ctx.pkCols,
        tsCol: ctx.tsCol,
        secretColumns: ctx.secretColumns,
    });
    const parts = buildSummaryParts(row, ctx.table, sum);
    const children: Instance[] = [buildRowButton(sum, parts, key, ctx.onSelect)];
    if (ctx.canDeleteRow) children.push(liveDeleteButton(key, ctx.table, ctx.onDelete));
    const wrap = div({ classes: [DR_ROW_ITEM_CLASS], context: null, meta: null }, children);
    wrap.trackDispose(effect(() => wrap.toggleClass(IS_SELECTED_CLASS, ctx.selectedKey() === key)));
    cellRefs.set(wrap.el, {
        primary: parts.primary,
        secondary: parts.secondary,
        meta: parts.meta,
        assetEl: parts.assetInst.el,
    });
    return wrap;
}

export function patchDataRow(inst: Instance, row: Record<string, unknown>, ctx: DataRowCtx): void {
    const refs = cellRefs.get(inst.el);
    if (!refs) return;
    const sum = rowSummary({
        row,
        table: ctx.table,
        pkCols: ctx.pkCols,
        tsCol: ctx.tsCol,
        secretColumns: ctx.secretColumns,
    });
    refs.primary.setText(snapshot(sum.primary));
    if (refs.secondary) refs.secondary.setText(snapshot(sum.secondary ?? ""));
    if (refs.meta) refs.meta.setText(snapshot(sum.meta ?? ""));
    applyAsset(refs.assetEl, resolvePrimaryAsset(ctx.table, row));
}
