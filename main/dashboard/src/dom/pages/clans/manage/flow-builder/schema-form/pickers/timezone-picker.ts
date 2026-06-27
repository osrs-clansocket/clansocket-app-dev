import { buildGlassSelect, type SelectOption } from "../../../../../../forms/glass/inputs/select/index.js";
import { registerFormat, type FormatPicker, type JSONSchemaNode } from "../format-registry.js";

const COMMON_TIMEZONES: readonly string[] = [
    "UTC",
    "Europe/London",
    "Europe/Paris",
    "Europe/Berlin",
    "Europe/Amsterdam",
    "Europe/Madrid",
    "Europe/Rome",
    "Europe/Stockholm",
    "Europe/Helsinki",
    "Europe/Athens",
    "Europe/Moscow",
    "America/New_York",
    "America/Chicago",
    "America/Denver",
    "America/Los_Angeles",
    "America/Toronto",
    "America/Vancouver",
    "America/Sao_Paulo",
    "America/Mexico_City",
    "Asia/Tokyo",
    "Asia/Shanghai",
    "Asia/Hong_Kong",
    "Asia/Singapore",
    "Asia/Seoul",
    "Asia/Dubai",
    "Asia/Kolkata",
    "Australia/Sydney",
    "Australia/Melbourne",
    "Australia/Perth",
    "Pacific/Auckland",
];

const timezonePicker: FormatPicker = (_schema: JSONSchemaNode, value, onChange, ctx) => {
    const opts: SelectOption[] = [{ value: "", label: "Pick a timezone" }];
    for (const tz of COMMON_TIMEZONES) opts.push({ value: tz, label: tz });
    const select = buildGlassSelect(`tz-${ctx.fieldName}-${ctx.operationId ?? "op"}`, opts, value);
    const hidden = select.el.querySelector<HTMLInputElement>("input[type='hidden']");
    if (hidden) hidden.addEventListener("change", () => onChange(hidden.value));
    return select;
};

registerFormat("iana-timezone", timezonePicker);
