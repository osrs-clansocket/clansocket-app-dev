import { div, span, type Instance } from "../../../../../../factory";
import type { SelectOption } from "../../../../../../forms/glass/inputs/select/index.js";
import { fieldsForTrigger } from "../../../../../../../shared/constants/clan-manage-discord/condition-field-list.js";
import type { ConditionEditorCallbacks, ConditionRow } from "./condition-editor-value.js";
export { parseConditions, serializeConditions } from "./condition-editor-value.js";
export type { ConditionEditorCallbacks, ConditionRow } from "./condition-editor-value.js";
import { buildRow } from "./condition-editor-row.js";
import { bindLifecycle, buildAddBtn, makeRowCtx, type EditorState } from "./condition-editor-state.js";
import {
    AUTO_HOOKS_CARD_LABEL_CLASS,
    AUTO_HOOKS_EMBED_EDITOR_CLASS,
} from "../../../../../../../shared/constants/clan-manage-discord/auto-hook-constants.js";

function buildFieldOptions(triggerType: string): SelectOption[] {
    return fieldsForTrigger(triggerType).map((f) => ({ value: f.field, label: f.label }));
}

export function buildConditionEditor(initial: readonly ConditionRow[], cb: ConditionEditorCallbacks): Instance {
    const state: EditorState = { rows: [...initial] };
    const host = div({ classes: [AUTO_HOOKS_EMBED_EDITOR_CLASS], context: null, meta: null });

    function rerender(): void {
        const triggerType = cb.getTriggerType();
        const fields = buildFieldOptions(triggerType);
        const rowEls = state.rows.map((row, idx) =>
            buildRow(makeRowCtx({ state, cb, rerender, row, idx, triggerType, fields })),
        );
        host.setChildren(
            span({ classes: [AUTO_HOOKS_CARD_LABEL_CLASS], text: "Conditions", context: null, meta: null }),
            ...rowEls,
            buildAddBtn({ triggerType, fields, state, cb, rerender }),
        );
    }

    bindLifecycle(host, state, cb, rerender);
    rerender();
    return host;
}
