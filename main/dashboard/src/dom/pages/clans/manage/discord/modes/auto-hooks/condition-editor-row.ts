import { BTN_VARIANT_BARE, button, div, icon, wireChange, type Instance, baseProps } from "../../../../../../factory";
import { buildGlassSelect } from "../../../../../../forms/glass/inputs/select/index.js";
import type { SelectOption } from "../../../../../../forms/glass/inputs/select/index.js";
import {
    buildValueControl,
    OP_OPTIONS,
    type ConditionEditorCallbacks,
    type ConditionRow,
} from "./condition-editor-value.js";
import {
    AUTO_HOOKS_CARD_DELETE_CLASS,
    AUTO_HOOKS_CARD_ROW_CLASS,
    AUTO_HOOKS_CARD_VALUE_CLASS,
} from "../../../../../../../shared/constants/clan-manage-discord/auto-hook-constants.js";

export interface RowContext {
    idx: number;
    row: ConditionRow;
    triggerType: string;
    fields: SelectOption[];
    cb: ConditionEditorCallbacks;
    onUpdate: (next: ConditionRow) => void;
    onValueUpdate: (next: ConditionRow) => void;
    onDelete: () => void;
}

function bindHiddenChange(sel: Instance, onChange: (value: string) => void): void {
    const hidden = sel.el.querySelector<HTMLInputElement>("input[type='hidden']");
    if (hidden) wireChange(hidden, () => onChange(hidden.value));
}

function buildDeleteBtn(onDelete: () => void): Instance {
    return button(
        {
            variant: BTN_VARIANT_BARE,
            classes: [AUTO_HOOKS_CARD_DELETE_CLASS],
            ariaLabel: "Remove condition",
            context: "remove this condition row",
            meta: ["action", "destructive"],
            onClick: onDelete,
        },
        [icon({ name: "trash", context: null, meta: null }).el],
    );
}

export function buildRow(ctx: RowContext): Instance {
    const fieldSel = buildGlassSelect(`cond-field-${ctx.idx}`, ctx.fields, ctx.row.field);
    bindHiddenChange(fieldSel, (v) => ctx.onUpdate({ ...ctx.row, field: v, value: "" }));
    const opSel = buildGlassSelect(`cond-op-${ctx.idx}`, OP_OPTIONS, ctx.row.op);
    bindHiddenChange(opSel, (v) => ctx.onUpdate({ ...ctx.row, op: v, value: "" }));
    const valueCtrl = buildValueControl({
        idx: ctx.idx,
        row: ctx.row,
        triggerType: ctx.triggerType,
        cb: ctx.cb,
        onUpdate: (v) => ctx.onValueUpdate({ ...ctx.row, value: v }),
    });
    const delBtn = buildDeleteBtn(ctx.onDelete);
    fieldSel.el.classList.add(AUTO_HOOKS_CARD_VALUE_CLASS);
    opSel.el.classList.add(AUTO_HOOKS_CARD_VALUE_CLASS);
    valueCtrl.el.classList.add(AUTO_HOOKS_CARD_VALUE_CLASS);
    return div(baseProps([AUTO_HOOKS_CARD_ROW_CLASS]), [fieldSel, opSel, valueCtrl, delBtn]);
}
