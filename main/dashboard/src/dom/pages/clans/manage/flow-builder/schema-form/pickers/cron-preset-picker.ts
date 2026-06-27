import { buildGlassSelect, type SelectOption } from "../../../../../../forms/glass/inputs/select/index.js";
import { registerFormat, type FormatPicker, type JSONSchemaNode } from "../format-registry.js";

interface CronPreset {
    readonly expr: string;
    readonly label: string;
}

const CRON_PRESETS: readonly CronPreset[] = [
    { expr: "* * * * *", label: "Every minute" },
    { expr: "*/5 * * * *", label: "Every 5 minutes" },
    { expr: "*/15 * * * *", label: "Every 15 minutes" },
    { expr: "*/30 * * * *", label: "Every 30 minutes" },
    { expr: "0 * * * *", label: "Hourly (on the hour)" },
    { expr: "0 */2 * * *", label: "Every 2 hours" },
    { expr: "0 */6 * * *", label: "Every 6 hours" },
    { expr: "0 0 * * *", label: "Daily at midnight" },
    { expr: "0 9 * * *", label: "Daily at 9am" },
    { expr: "0 12 * * *", label: "Daily at noon" },
    { expr: "0 18 * * *", label: "Daily at 6pm" },
    { expr: "0 0 * * 0", label: "Weekly (Sunday midnight)" },
    { expr: "0 0 * * 1", label: "Weekly (Monday midnight)" },
    { expr: "0 0 1 * *", label: "Monthly (1st at midnight)" },
];

const cronPresetPicker: FormatPicker = (_schema: JSONSchemaNode, value, onChange, ctx) => {
    const opts: SelectOption[] = [{ value: "", label: "Pick a schedule" }];
    for (const p of CRON_PRESETS) opts.push({ value: p.expr, label: p.label });
    const select = buildGlassSelect(`cron-${ctx.fieldName}-${ctx.operationId ?? "op"}`, opts, value);
    const hidden = select.el.querySelector<HTMLInputElement>("input[type='hidden']");
    if (hidden) hidden.addEventListener("change", () => onChange(hidden.value));
    return select;
};

registerFormat("cron-preset", cronPresetPicker);
