export function isFormControl(el: HTMLElement): el is HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement {
    return el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement;
}
