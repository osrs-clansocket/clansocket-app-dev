import { wireInput, type Instance } from "../../../../../factory/index.js";
import { glassInput } from "../../../../../forms/glass/inputs/glass-input.js";
import { getFormat } from "./format-registry.js";
import { readEnum, readEnumLabels } from "../../../../../../state/flows/schema-enum-reader.js";
import { readFormat, readTitle } from "../../../../../../state/flows/schema-types-reader.js";
import { renderEnumControl } from "./enum-renderer.js";
import type { StringControlProps } from "./render-types.js";

export function renderStringControl(p: StringControlProps): Instance {
    const format = readFormat(p.schema);
    const formatPicker = getFormat(format);
    if (formatPicker) return formatPicker(p.schema, p.current, p.onChange, p.ctx);
    const enumValues = readEnum(p.schema);
    if (enumValues) {
        return renderEnumControl({
            fieldName: p.fieldName,
            options: enumValues,
            labels: readEnumLabels(p.schema),
            current: p.current,
            onChange: p.onChange,
        });
    }
    const inputEl = glassInput({
        value: p.current,
        placeholder: readTitle(p.schema, p.fieldName),
        ariaLabel: p.fieldName,
        autocomplete: "off",
    });
    wireInput(inputEl.el, (e) => p.onChange((e.target as HTMLInputElement).value));
    return inputEl;
}
