const TYPE_CHECKBOX = "checkbox";
const TYPE_RADIO = "radio";

export function isToggleable(el: Element): el is HTMLInputElement {
    if (!(el instanceof HTMLInputElement)) return false;
    return el.type === TYPE_CHECKBOX || el.type === TYPE_RADIO;
}

export function isTextInput(el: Element): el is HTMLInputElement | HTMLTextAreaElement {
    if (el instanceof HTMLTextAreaElement) return true;
    if (!(el instanceof HTMLInputElement)) return false;
    return el.type !== TYPE_CHECKBOX && el.type !== TYPE_RADIO;
}
