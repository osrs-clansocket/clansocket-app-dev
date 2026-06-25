import { isTextInput, isToggleable } from "./clone-input-classify.js";

export interface InputVisitor {
    onToggle: (el: HTMLInputElement, key: string) => void;
    onSelect: (el: HTMLSelectElement, key: string) => void;
    onText: (el: HTMLElement & { value: string }, key: string) => void;
}

export function visitInput(el: HTMLElement, key: string, v: InputVisitor): void {
    if (isToggleable(el)) {
        v.onToggle(el as HTMLInputElement, key);
        return;
    }
    if (el instanceof HTMLSelectElement) {
        v.onSelect(el, key);
        return;
    }
    if (isTextInput(el)) v.onText(el as HTMLElement & { value: string }, key);
}
