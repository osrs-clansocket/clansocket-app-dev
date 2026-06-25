import { span } from "../../factory";

const BS_ICON = "bi";

export function bsSpan(iconClass: string): HTMLElement {
    return span({ classes: [BS_ICON, iconClass], context: null, meta: null }).el;
}
