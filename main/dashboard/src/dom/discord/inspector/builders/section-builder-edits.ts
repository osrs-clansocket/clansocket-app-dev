import { div, wireChange, type Instance } from "../../../factory";
import { checkbox } from "../../../factory/content-ops/form/inputs/checkbox.js";
import { textInput } from "../../../factory/content-ops/form/inputs/text-input.js";
import { buildGlassColor } from "../../../forms/glass/inputs/color/index.js";
import { FORM_INPUT } from "../../../forms/form-classes.js";
import { DISCORD_INSPECTOR_SECTION_CLASS } from "../../../../shared/constants/clan-manage-discord/route-constants.js";
import { buildLabelRow } from "./section-builder-readonly.js";

export function editText(title: string, currentValue: string, onSave: (next: string) => void): Instance {
    const inp = textInput({ classes: [FORM_INPUT], value: currentValue, context: null, meta: null });
    wireChange(inp.el, () => onSave(inp.el.value));
    return div({ classes: [DISCORD_INSPECTOR_SECTION_CLASS], context: null, meta: null }, [
        buildLabelRow(title, null),
        inp,
    ]);
}

export function editCheck(title: string, currentValue: boolean, onSave: (next: boolean) => void): Instance {
    const cb = checkbox({ context: null, meta: null });
    if (currentValue) cb.el.checked = true;
    wireChange(cb.el, () => onSave(cb.el.checked));
    return div({ classes: [DISCORD_INSPECTOR_SECTION_CLASS], context: null, meta: null }, [
        buildLabelRow(title, null),
        cb,
    ]);
}

export function editColor(title: string, currentHex: string, onSave: (nextHex: string) => void): Instance {
    let local = currentHex;
    const colorInput = buildGlassColor({
        name: title.toLowerCase(),
        ariaLabel: title,
        value: () => local,
        onChange: (next) => {
            local = next;
            onSave(next);
        },
    });
    return div({ classes: [DISCORD_INSPECTOR_SECTION_CLASS], context: null, meta: null }, [
        buildLabelRow(title, null),
        colorInput,
    ]);
}
