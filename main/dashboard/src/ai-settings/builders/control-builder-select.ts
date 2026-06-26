import { createInstance, effect, type Instance } from "../../dom/factory";
import { buildGlassSelect, type SelectOption } from "../../dom/forms/glass/inputs/select/index.js";
import { personaStore, type SlotMeta } from "../../ai/persona-store/index.js";
import { defaultValueOf } from "../../ai/persona-store/defaults-client.js";

const GLASS_SELECT_LABEL_CLASS = "glass-select__label";
const GLASS_SELECT_OPTION_CLASS = "glass-select__option";
const DATA_ATTR_VALUE = "data-value";
const ATTR_ARIA_SELECTED = "aria-selected";

function syncControlVisual(sel: Instance, next: string, optionSet: SelectOption[]): void {
    const labelEl = sel.el.querySelector<HTMLElement>(`.${GLASS_SELECT_LABEL_CLASS}`);
    const labelMatch = optionSet.find((o) => o.value === next);
    if (labelEl && labelMatch) createInstance(labelEl).setText(labelMatch.label);
    for (const optEl of Array.from(sel.el.querySelectorAll<HTMLElement>(`.${GLASS_SELECT_OPTION_CLASS}`))) {
        const val = optEl.getAttribute(DATA_ATTR_VALUE);
        if (val === next) createInstance(optEl).setAttr(ATTR_ARIA_SELECTED, "true");
        else createInstance(optEl).removeAttr(ATTR_ARIA_SELECTED);
    }
}

export function buildSelectControl(meta: SlotMeta): Instance {
    const optionSet: SelectOption[] = (meta.options ?? []).map((o) => ({ value: o, label: o }));
    const fallback = optionSet[0]?.value ?? "";
    const initial = personaStore.valueOf(meta.key) ?? defaultValueOf(meta.key) ?? fallback;
    const sel = buildGlassSelect(`slot-${meta.key}`, optionSet, initial);
    const hidden = sel.el.querySelector<HTMLInputElement>(`input[name="slot-${meta.key}"]`);
    if (hidden) {
        hidden.addEventListener("change", () => personaStore.commitOrReset(meta.key, meta.type, hidden.value));
    }
    sel.trackDispose(
        effect(() => {
            const next = personaStore.valueOf(meta.key) ?? defaultValueOf(meta.key) ?? fallback;
            if (!hidden || hidden.value === next) return;
            hidden.value = next;
            syncControlVisual(sel, next, optionSet);
        }),
    );
    return sel;
}
