import { input, wireChange, wireInput, type Instance } from "../../../../../../factory";
import { buildGlassSelect } from "../../../../../../forms/glass/inputs/select/index.js";
import type { SelectOption } from "../../../../../../forms/glass/inputs/select/index.js";
import { glassInput } from "../../../../../../forms/glass/inputs/glass-input.js";
import { FORM_INPUT } from "../../../../../../forms/form-classes.js";
import {
    isContainsOperator,
    isNumericOperator,
} from "../../../../../../../shared/constants/clan-manage-discord/condition-values.js";

export interface ConditionRow {
    field: string;
    op: string;
    value: string;
}

export interface ConditionEditorCallbacks {
    onChange: (next: readonly ConditionRow[]) => void;
    getTriggerType: () => string;
    getValueOptions: (triggerType: string, field: string) => readonly string[];
    subscribeValueOptions: (listener: () => void) => () => void;
    subscribeTriggerChange: (listener: () => void) => () => void;
    getFieldOptions?: (triggerType: string) => readonly SelectOption[];
}

export const OP_OPTIONS: ReadonlyArray<SelectOption> = [
    { value: "eq", label: "equals" },
    { value: "ne", label: "not equals" },
    { value: "gt", label: ">" },
    { value: "gte", label: ">=" },
    { value: "lt", label: "<" },
    { value: "lte", label: "<=" },
    { value: "contains", label: "contains" },
];

function buildNumericInput(value: string, onUpdate: (v: string) => void): Instance {
    const inp = input({
        value,
        classes: [FORM_INPUT],
        type: "number",
        placeholder: "number",
        ariaLabel: "Condition value (number)",
        context: "numeric value to compare the field against",
        meta: ["input"],
    });
    wireInput(inp.el, () => onUpdate(inp.el.value));
    return inp;
}

function buildValueSelect(
    idx: number,
    options: readonly string[],
    current: string,
    onUpdate: (v: string) => void,
): Instance {
    const opts: SelectOption[] = options.map((v) => ({ value: v, label: v }));
    const sel = buildGlassSelect(`cond-val-${idx}`, opts, current.length > 0 ? current : (options[0] ?? ""));
    const hidden = sel.el.querySelector<HTMLInputElement>("input[type='hidden']");
    if (hidden) wireChange(hidden, () => onUpdate(hidden.value));
    return sel;
}

function buildValueText(value: string, onUpdate: (v: string) => void, placeholder: string): Instance {
    const inp = glassInput({
        value,
        placeholder,
        ariaLabel: "Condition value",
        context: "value to compare the field against",
        meta: ["input"],
    });
    wireInput(inp.el, () => onUpdate(inp.el.value));
    return inp;
}

export interface ValueControlArgs {
    idx: number;
    row: ConditionRow;
    triggerType: string;
    cb: ConditionEditorCallbacks;
    onUpdate: (v: string) => void;
}

export function buildValueControl(a: ValueControlArgs): Instance {
    const { idx, row, triggerType, cb, onUpdate } = a;
    if (isNumericOperator(row.op)) return buildNumericInput(row.value, onUpdate);
    if (isContainsOperator(row.op)) return buildValueText(row.value, onUpdate, "substring");
    const options = cb.getValueOptions(triggerType, row.field);
    if (options.length > 0) return buildValueSelect(idx, options, row.value, onUpdate);
    return buildValueText(row.value, onUpdate, "no observed values yet");
}

export function parseConditions(json: string | null): ConditionRow[] {
    if (json === null || json.length === 0) return [];
    try {
        const arr = JSON.parse(json) as ConditionRow[];
        return Array.isArray(arr) ? arr : [];
    } catch {
        return [];
    }
}

export function serializeConditions(rows: readonly ConditionRow[]): string | null {
    const active = rows.filter((r) => r.field.length > 0 && r.op.length > 0);
    if (active.length === 0) return null;
    return JSON.stringify(active);
}
