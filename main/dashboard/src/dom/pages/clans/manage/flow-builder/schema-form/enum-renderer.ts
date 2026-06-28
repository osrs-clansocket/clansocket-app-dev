import { type Instance } from "../../../../../factory/index.js";
import { buildGlassSelect, type SelectOption } from "../../../../../forms/glass/inputs/select/index.js";
import type { EnumControlProps } from "./render-types.js";

export function renderEnumControl(p: EnumControlProps): Instance {
    const opts: SelectOption[] = p.options.map((value, idx) => ({
        value,
        label: p.labels && p.labels[idx] ? p.labels[idx] : value,
    }));
    const select = buildGlassSelect(p.fieldName, opts, p.current);
    const hidden = select.el.querySelector<HTMLInputElement>("input[type='hidden']");
    if (hidden) hidden.addEventListener("change", () => p.onChange(hidden.value));
    return select;
}
