import type { PointerProp } from "./handler-types.js";
import { resolveProp } from "./prop-resolver.js";

function wirePointer(el: HTMLElement | Element, evt: string, prop: PointerProp): () => void {
    const { handler, options } = resolveProp(prop);
    el.addEventListener(evt, handler as EventListener, options);
    return () => el.removeEventListener(evt, handler as EventListener, options);
}

export function wirePointerDown(el: HTMLElement | Element, prop: PointerProp): () => void {
    return wirePointer(el, "pointerdown", prop);
}

export function wirePointerUp(el: HTMLElement | Element, prop: PointerProp): () => void {
    return wirePointer(el, "pointerup", prop);
}

export function wirePointerMove(el: HTMLElement | Element, prop: PointerProp): () => void {
    return wirePointer(el, "pointermove", prop);
}

export function wirePointerCancel(el: HTMLElement | Element, prop: PointerProp): () => void {
    return wirePointer(el, "pointercancel", prop);
}

export interface PointerDragBindings {
    down?: PointerProp;
    move?: PointerProp;
    up?: PointerProp;
    cancel?: PointerProp;
}

export function wirePointerDrag(el: HTMLElement | Element, bindings: PointerDragBindings): () => void {
    const disposers: Array<() => void> = [];
    if (bindings.down) disposers.push(wirePointerDown(el, bindings.down));
    if (bindings.move) disposers.push(wirePointerMove(el, bindings.move));
    if (bindings.up) disposers.push(wirePointerUp(el, bindings.up));
    if (bindings.cancel) disposers.push(wirePointerCancel(el, bindings.cancel));
    return () => {
        for (const d of disposers) d();
    };
}
