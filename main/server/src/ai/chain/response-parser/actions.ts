import { isPlainObject } from "../../../shared/validators/type-guards.js";
import type { Actions } from "../../types.js";
import {
    normalizeCheckOp,
    pressKey as pressKeyOp,
    selectOption as selectOptionOp,
    setValue as setValueOp,
    toggleOpen as toggleOpenOp,
} from "./action-ops.js";
import { pickOpArray, pickString, pickStringArray } from "./pickers.js";

function pickStringActions(r: Record<string, unknown>, out: Actions): void {
    const navigate = pickString(r, "navigate");
    if (navigate) out.navigate = navigate;
    const show = pickString(r, "show");
    if (show) out.show = show;
    const route = pickString(r, "route");
    if (route) out.route = route;
    const click = pickString(r, "click");
    if (click) out.click = click;
    const submit = pickString(r, "submit");
    if (submit) out.submit = submit;
    const focus = pickString(r, "focus");
    if (focus) out.focus = focus;
    const blur = pickString(r, "blur");
    if (blur) out.blur = blur;
}

function pickOpActions(r: Record<string, unknown>, out: Actions): void {
    const highlight = pickStringArray(r, "highlight");
    if (highlight) out.highlight = highlight;
    const setValue = pickOpArray(r, "setValue", setValueOp);
    if (setValue) out.setValue = setValue;
    const check = pickOpArray(r, "check", normalizeCheckOp);
    if (check) out.check = check;
    const selectOption = pickOpArray(r, "selectOption", selectOptionOp);
    if (selectOption) out.selectOption = selectOption;
    const pressKey = pickOpArray(r, "pressKey", pressKeyOp);
    if (pressKey) out.pressKey = pressKey;
    const toggleOpen = pickOpArray(r, "toggleOpen", toggleOpenOp);
    if (toggleOpen) out.toggleOpen = toggleOpen;
}

export function normalizeActions(raw: unknown): Actions | null {
    if (!isPlainObject(raw)) return null;
    const out: Actions = {};
    pickStringActions(raw, out);
    pickOpActions(raw, out);
    return Object.keys(out).length > 0 ? out : null;
}
