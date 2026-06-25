export function applyToSubtree(root: HTMLElement, selector: string, fn: (el: HTMLElement) => void): void {
    fn(root);
    for (const el of root.querySelectorAll<HTMLElement>(selector)) fn(el);
}
