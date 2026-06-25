export function releaseDragPointer(handle: HTMLElement, pointerId: number): void {
    if (!handle.hasPointerCapture(pointerId)) return;
    handle.releasePointerCapture(pointerId);
}
