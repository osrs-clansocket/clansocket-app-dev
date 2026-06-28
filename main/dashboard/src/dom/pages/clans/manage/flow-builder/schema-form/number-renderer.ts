import { wireInput, type Instance } from "../../../../../factory/index.js";
import { glassInput } from "../../../../../forms/glass/inputs/glass-input.js";
import { readEnum, readEnumLabels } from "../../../../../../state/flows/schema-enum-reader.js";
import { readTitle } from "../../../../../../state/flows/schema-types-reader.js";
import { renderEnumControl } from "./enum-renderer.js";
import type { NumberControlProps } from "./render-types.js";

function emitNumeric(raw: string, onChange: (next: number | null) => void): void {
    if (raw.length === 0) {
        onChange(null);
        return;
    }
    const parsed = Number(raw);
    if (Number.isFinite(parsed)) onChange(parsed);
}

function renderNumericEnum(
    p: NumberControlProps,
    enumValues: readonly string[],
): Instance {
    return renderEnumControl({
        fieldName: p.fieldName,
        options: enumValues,
        labels: readEnumLabels(p.schema),
        current: p.current === null ? "" : String(p.current),
        onChange: (next) => emitNumeric(next, p.onChange),
    });
}

export function renderNumberControl(p: NumberControlProps): Instance {
    const enumValues = readEnum(p.schema);
    if (enumValues) return renderNumericEnum(p, enumValues);
    const inputEl = glassInput({
        value: p.current === null ? "" : String(p.current),
        placeholder: readTitle(p.schema, p.fieldName),
        ariaLabel: p.fieldName,
        autocomplete: "off",
    });
    wireInput(inputEl.el, (e) => emitNumeric((e.target as HTMLInputElement).value, p.onChange));
    return inputEl;
}
