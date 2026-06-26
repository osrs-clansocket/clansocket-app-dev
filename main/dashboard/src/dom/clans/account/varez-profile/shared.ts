import { BTN_VARIANT_OUTLINE, button, div, icon, span, type Instance, baseProps, textProps } from "../../../factory";
import { FIELD_LABEL_CLASS, HEADER_ROW_CLASS, ICON_BTN_CLASS } from "./state.js";

export function iconBtn(name: string, label: string, onClick: () => void): ReturnType<typeof button> {
    return button(
        {
            classes: [ICON_BTN_CLASS],
            ariaLabel: label,
            title: label,
            context: label,
            meta: ["action"],
            onClick,
        },
        [icon({ name, context: null, meta: null }).el],
    );
}

export function renderSectionHeader(host: Instance, title: string, addLabel: string, onAdd: () => void): void {
    const hdr = div(baseProps([HEADER_ROW_CLASS]), [
        span(textProps([FIELD_LABEL_CLASS], title)),
        button({
            variant: BTN_VARIANT_OUTLINE,
            
            text: addLabel,
            ariaLabel: addLabel,
            context: addLabel,
            meta: ["action"],
            onClick: onAdd,
        }),
    ]);
    host.addChild(hdr);
}
