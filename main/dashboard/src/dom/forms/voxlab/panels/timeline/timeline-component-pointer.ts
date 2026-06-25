export function tryPointerCapture(el: Element, id: number): void {
    try {
        el.setPointerCapture(id);
    } catch {
        void 0;
    }
}

export function releasePointerCapture(el: Element, id: number): void {
    try {
        el.releasePointerCapture(id);
    } catch {
        void 0;
    }
}

export function attachPointerHandlers(
    el: HTMLElement,
    onMove: (e: PointerEvent) => void,
    onUp: () => void,
    onCancel: () => void,
): () => void {
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerup", onUp);
    el.addEventListener("pointercancel", onCancel);
    return () => {
        el.removeEventListener("pointermove", onMove);
        el.removeEventListener("pointerup", onUp);
        el.removeEventListener("pointercancel", onCancel);
    };
}
