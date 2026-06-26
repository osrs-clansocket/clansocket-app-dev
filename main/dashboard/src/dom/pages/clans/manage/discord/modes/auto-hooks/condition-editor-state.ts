import { BTN_VARIANT_OUTLINE, button, type Instance } from "../../../../../../factory";
import type { SelectOption } from "../../../../../../forms/glass/inputs/select/index.js";
import type { ConditionEditorCallbacks, ConditionRow } from "./condition-editor-value.js";
import type { RowContext } from "./condition-editor-row.js";

export interface EditorState {
    rows: ConditionRow[];
}

function pickDefaultField(triggerType: string, fields: SelectOption[], cb: ConditionEditorCallbacks): string {
    for (const f of fields) {
        if (cb.getValueOptions(triggerType, f.value).length > 0) return f.value;
    }
    return fields[0]?.value ?? "";
}

export interface AddBtnArgs {
    triggerType: string;
    fields: SelectOption[];
    state: EditorState;
    cb: ConditionEditorCallbacks;
    rerender: () => void;
}

export function buildAddBtn(a: AddBtnArgs): Instance {
    const { triggerType, fields, state, cb, rerender } = a;
    return button({
        variant: BTN_VARIANT_OUTLINE,
        
        text: "+ Add condition",
        context: "add a new condition row",
        meta: ["action"],
        onClick: () => {
            state.rows.push({ field: pickDefaultField(triggerType, fields, cb), op: "eq", value: "" });
            cb.onChange([...state.rows]);
            rerender();
        },
    });
}

interface RowCtxArgs {
    state: EditorState;
    cb: ConditionEditorCallbacks;
    rerender: () => void;
    row: ConditionRow;
    idx: number;
    triggerType: string;
    fields: SelectOption[];
}

export function makeRowCtx(a: RowCtxArgs): RowContext {
    const { state, cb, rerender, row, idx, triggerType, fields } = a;
    return {
        idx,
        row,
        triggerType,
        fields,
        cb,
        onUpdate: (next) => {
            state.rows[idx] = next;
            cb.onChange([...state.rows]);
            rerender();
        },
        onValueUpdate: (next) => {
            state.rows[idx] = next;
            cb.onChange([...state.rows]);
        },
        onDelete: () => {
            state.rows = state.rows.filter((_, i) => i !== idx);
            cb.onChange([...state.rows]);
            rerender();
        },
    };
}

export function bindLifecycle(
    host: Instance,
    state: EditorState,
    cb: ConditionEditorCallbacks,
    rerender: () => void,
): void {
    const unsubscribeValues = cb.subscribeValueOptions(rerender);
    const unsubscribeTrigger = cb.subscribeTriggerChange(() => {
        state.rows = [];
        cb.onChange([]);
        rerender();
    });
    host.trackDispose({
        dispose: () => {
            unsubscribeValues();
            unsubscribeTrigger();
        },
    });
}
