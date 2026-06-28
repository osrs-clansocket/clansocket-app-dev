import { type Instance } from "../../../../../factory/index.js";
import { buildGlassCheck } from "../../../../../forms/glass/inputs/glass-check.js";
import type { BooleanControlProps } from "./render-types.js";

export function renderBooleanControl(p: BooleanControlProps): Instance {
    return buildGlassCheck({
        name: p.fieldName,
        ariaLabel: p.fieldName,
        checked: () => p.current,
        onChange: p.onChange,
    });
}
