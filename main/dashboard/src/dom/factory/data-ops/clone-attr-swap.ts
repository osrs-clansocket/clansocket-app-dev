export function swapAttr(el: HTMLElement, from: string, to: string): void {
    const value = el.getAttribute(from);
    if (value === null || value.length === 0) return;
    el.removeAttribute(from);
    el.setAttribute(to, value);
}
