const BUBBLE_OPTS = { bubbles: true } as const;

export function dispatchBubbling(el: HTMLElement, type: string): void {
    el.dispatchEvent(new Event(type, BUBBLE_OPTS));
}
