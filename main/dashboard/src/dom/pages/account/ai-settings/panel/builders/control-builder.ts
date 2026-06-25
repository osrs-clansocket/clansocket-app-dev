import { button, derived, div, effect, icon, span, type Instance } from "../../../../../factory";
import { input } from "../../../../../factory/content-ops/form";
import {
    CTRL_BLOCK,
    CTRL_ENTRY,
    CTRL_RANGE,
    CTRL_SELECT,
    CTRL_TOGGLE,
    personaStore,
    type SlotMeta,
} from "../../../../../../ai/persona-store/index.js";
import { defaultValueOf } from "../../../../../../ai/persona-store/defaults-client.js";
import { currentEnumValue } from "../../../../../../ai/persona-store/enum-extractor.js";
import { ATTR_HIDDEN, HIDDEN_FALSE, HIDDEN_TRUE } from "../../shared.js";
import { buildBlockControl, buildEntryControl, buildNumberControl } from "./control-builder-text.js";
import { buildSelectControl } from "./control-builder-select.js";

const FIELD_RESET_CLASS = "account-ai-settings__field-reset";

const TOGGLE_CLASS = "account-ai-settings__toggle";
const TOGGLE_OPT_CLASS = "account-ai-settings__toggle-opt";
const TOGGLE_OPT_ACTIVE_CLASS = "account-ai-settings__toggle-opt--active";

const RANGE_CLASS = "account-ai-settings__range";
const RANGE_SLIDER_CLASS = "account-ai-settings__range-slider";
const RANGE_VALUE_CLASS = "account-ai-settings__range-value";

const DEFAULT_RANGE_MAX = 100;

export function buildResetButton(meta: SlotMeta): Instance<HTMLButtonElement> {
    const btn = button(
        {
            classes: [FIELD_RESET_CLASS],
            ariaLabel: `Reset ${meta.displayName} to default`,
            title: "Reset to default",
            context: `reset ${meta.displayName}`,
            meta: ["action"],
            onClick: () => personaStore.resetSlot(meta.key),
        },
        [icon({ name: "arrow-counterclockwise", context: null, meta: null }).el],
    );
    btn.trackDispose(
        effect(() => {
            btn.setAttr(ATTR_HIDDEN, personaStore.isOverride(meta.key) ? HIDDEN_FALSE : HIDDEN_TRUE);
        }),
    );
    return btn;
}

function buildRangeControl(meta: SlotMeta): Instance {
    const min = meta.bounds?.min ?? 0;
    const max = meta.bounds?.max ?? DEFAULT_RANGE_MAX;
    const slider = input({
        ariaLabel: meta.displayName,
        id: `slot-${meta.key}`,
        type: "range",
        classes: [RANGE_SLIDER_CLASS],
        min: String(min),
        max: String(max),
        value: derived(() => personaStore.valueOf(meta.key) ?? defaultValueOf(meta.key) ?? String(min)),
        context: meta.description,
        meta: ["input"],
        onInput: (e) => personaStore.commitOrReset(meta.key, meta.type, (e.target as HTMLInputElement).value),
    });
    const value = span({
        classes: [RANGE_VALUE_CLASS],
        text: derived(() => personaStore.valueOf(meta.key) ?? defaultValueOf(meta.key) ?? String(min)),
        context: null,
        meta: null,
    });
    return div({ classes: [RANGE_CLASS], context: null, meta: null }, [slider, value]);
}

function makeControlOpt(meta: SlotMeta, opt: string): Instance {
    const btn = button({
        classes: [TOGGLE_OPT_CLASS],
        text: opt,
        role: "radio",
        data: { value: opt },
        context: `set ${meta.displayName} to ${opt}`,
        meta: ["action"],
        onClick: () => {
            if (currentEnumValue(meta) === opt) personaStore.resetSlot(meta.key);
            else personaStore.setSlot(meta.key, opt);
        },
    });
    btn.trackDispose(
        effect(() => {
            const active = currentEnumValue(meta) === opt;
            btn.toggleClass(TOGGLE_OPT_ACTIVE_CLASS, active);
            btn.setAttr("aria-checked", active ? "true" : "false");
        }),
    );
    return btn;
}

function buildToggleControl(meta: SlotMeta): Instance {
    const group = div({ classes: [TOGGLE_CLASS], role: "radiogroup", context: null, meta: null });
    for (const opt of meta.options ?? []) group.addChild(makeControlOpt(meta, opt));
    return group;
}

export function buildControl(meta: SlotMeta): Instance {
    if (meta.control === CTRL_ENTRY) return buildEntryControl(meta);
    if (meta.control === CTRL_BLOCK) return buildBlockControl(meta);
    if (meta.control === CTRL_RANGE) return buildRangeControl(meta);
    if (meta.control === CTRL_TOGGLE) return buildToggleControl(meta);
    if (meta.control === CTRL_SELECT) return buildSelectControl(meta);
    return buildNumberControl(meta);
}
