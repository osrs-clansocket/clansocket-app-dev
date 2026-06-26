import { button, div, icon, input, popover, span, type Instance, textProps } from "../../../../factory/index.js";
import { GD_LABEL, GD_OPEN, GD_POPUP, GD_ROOT, GD_TRIGGER, buildPopupContents, isoDate, parseIso } from "./build.js";
import { GLASS_DATE_ICON_CLASS } from "../../../../../shared/constants/glass-constants.js";
import { wirePopupClicks } from "./popup-clicks.js";
import type { DateState, GlassDateParts } from "./date-parts-types.js";

export interface GlassDateProps {
    name?: string;
    value?: string;
    placeholder?: string;
    onChange?: (iso: string) => void;
}

function buildTrigger(labelInst: Instance): Instance<HTMLButtonElement> {
    return button(
        {
            ariaLabel: "Pick a date",
            classes: [GD_TRIGGER],
            type: "button",
            ariaHaspopup: "dialog",
            context: "open the date picker",
            meta: ["action", "input"],
        },
        [labelInst, icon({ name: "calendar-event", classes: [GLASS_DATE_ICON_CLASS], context: null, meta: null })],
    );
}

function buildHidden(name: string, initialValue: string): Instance<HTMLInputElement> {
    return input({
        name,
        ariaLabel: "Date value",
        type: "hidden",
        value: initialValue,
        context: "the selected date (hidden field)",
        meta: ["input"],
    });
}

function buildDateLabel(initialValue: string, placeholder: string): Instance {
    return span(textProps([GD_LABEL], initialValue.length > 0 ? initialValue : placeholder));
}

export function glassDate(props: GlassDateProps = {}): Instance {
    const initialValue = props.value ?? "";
    const placeholder = props.placeholder ?? "pick a date";
    const state: DateState = { view: parseIso(initialValue) ?? new Date(), selected: initialValue, placeholder };
    const labelInst = buildDateLabel(initialValue, placeholder);
    const trigger = buildTrigger(labelInst);
    const hidden = buildHidden(props.name ?? "", initialValue);
    const popup = div({ classes: [GD_POPUP], role: "dialog", context: null, meta: null });
    const renderPopup = (): void => {
        popup.setChildren(buildPopupContents(state.view, state.selected));
    };
    renderPopup();
    const parts: GlassDateParts = { state, popup, labelInst, hidden, renderPopup, onChange: props.onChange };
    const inst = popover(
        { openClass: GD_OPEN, rootClasses: [GD_ROOT], rootAttrs: { "data-glass-date": "" }, context: null, meta: null },
        trigger,
        popup,
    );
    wirePopupClicks(parts, () => inst.close());
    inst.addChild(hidden);
    return inst;
}

export { isoDate, parseIso };
