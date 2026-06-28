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
    getFieldType?: (triggerType: string, field: string) => string | undefined;
}

export const OPERATOR_LABELS: Readonly<Record<string, string>> = {
    eq: "equals",
    ne: "not equals",
    gt: ">",
    gte: ">=",
    lt: "<",
    lte: "<=",
    in: "in",
    "not-in": "not in",
    contains: "contains",
    "not-contains": "does not contain",
    "starts-with": "starts with",
    "matches-tier": "matches tier",
};

export function operatorOptions(allowed: readonly string[]): SelectOption[] {
    const opts: SelectOption[] = [];
    for (const op of allowed) {
        const label = OPERATOR_LABELS[op] ?? op;
        opts.push({ value: op, label });
    }
    return opts;
}

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
    fieldType?: string;
    format?: string;
}

const SELECTABLE_FIELD_TYPES = new Set([
    "rsn",
    "clan-rank",
    "osrs-skill",
    "osrs-boss",
    "osrs-activity",
    "osrs-metric",
    "wom-metric",
    "wom-period",
    "discord-channel-id",
    "discord-member-id",
    "discord-role-id",
    "discord-guild-id",
    "discord-webhook-id",
    "discord-channel-type",
    "discord-verification-level",
    "discord-emoji-id",
    "discord-sticker-id",
    "discord-message-id",
    "discord-interaction-type",
    "iana-timezone",
    "cron-preset",
    "chatbox-color",
    "mime-type",
    "loop-interval-preset",
    "loop-interval-unit",
    "loop-on-overlap",
    "region-id",
    "account-type",
    "menu-action-target",
]);

export function buildValueControl(a: ValueControlArgs): Instance {
    const { idx, row, triggerType, cb, onUpdate, fieldType, format } = a;
    if (isContainsOperator(row.op)) return buildValueText(row.value, onUpdate, "substring");
    if (row.op === "starts-with" || row.op === "not-contains") return buildValueText(row.value, onUpdate, "substring");
    if (isNumericOperator(row.op)) return buildNumericInput(row.value, onUpdate);
    const refType = format ?? fieldType;
    if (refType && SELECTABLE_FIELD_TYPES.has(refType)) {
        const options = cb.getValueOptions(triggerType, row.field);
        if (options.length > 0) return buildValueSelect(idx, options, row.value, onUpdate);
    }
    if (fieldType === "integer" || fieldType === "number") return buildNumericInput(row.value, onUpdate);
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
