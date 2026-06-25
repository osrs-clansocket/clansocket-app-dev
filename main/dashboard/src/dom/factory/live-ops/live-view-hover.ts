import type { Instance } from "../core";

const KEY_ATTR = "data-live-key";

function keyOfTarget(el: Element | null): string | null {
    return el?.closest(`[${KEY_ATTR}]`)?.getAttribute(KEY_ATTR) ?? null;
}

export function wireHoverFreezing(
    container: Instance,
    ops: { freeze: (k: string) => void; unfreeze: (k: string) => void },
): { bind: () => void; unbind: () => void } {
    const onOver = (e: Event): void => {
        const k = keyOfTarget(e.target as Element);
        if (k !== null) ops.freeze(k);
    };
    const onOut = (e: Event): void => {
        const k = keyOfTarget(e.target as Element);
        if (k !== null) ops.unfreeze(k);
    };
    const pairs: Array<[string, EventListener]> = [
        ["pointerover", onOver],
        ["pointerout", onOut],
        ["focusin", onOver],
        ["focusout", onOut],
    ];
    return {
        bind: () => pairs.forEach(([ev, fn]) => container.el.addEventListener(ev, fn)),
        unbind: () => pairs.forEach(([ev, fn]) => container.el.removeEventListener(ev, fn)),
    };
}
