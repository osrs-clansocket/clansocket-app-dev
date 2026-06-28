import type { Instance } from "../../../factory/core";
import type { Disposable } from "../../../factory/reactive/index.js";
import { makeCanvasSizer } from "../internal/canvas-sizer.js";
import type { MapStateSignals } from "../internal/state.js";

export function setupResizeObserver(
    hostEl: HTMLElement,
    refs: { bg: { el: HTMLCanvasElement }; overlay: { el: HTMLCanvasElement } },
    canvasDims$: MapStateSignals["canvasDims$"],
): Disposable {
    const sync = makeCanvasSizer(hostEl, { bg: refs.bg.el, overlay: refs.overlay.el }, canvasDims$);
    let rafId = 0;
    const deferredSync = (): void => {
        if (rafId !== 0) return;
        rafId = requestAnimationFrame(() => {
            rafId = 0;
            sync();
        });
    };
    const observer = new ResizeObserver(deferredSync);
    queueMicrotask(() => {
        observer.observe(hostEl);
        sync();
    });
    return {
        dispose: () => {
            observer.disconnect();
            if (rafId !== 0) cancelAnimationFrame(rafId);
        },
    };
}

export interface AllDisposers {
    bindDisposers: Disposable[];
    tileRootEff: Disposable;
    observerDisposer: Disposable;
    persistDisposer: Disposable;
}

export function trackAllDisposers(host: Instance, d: AllDisposers): void {
    for (const x of d.bindDisposers) host.trackDispose(x);
    host.trackDispose(d.tileRootEff);
    host.trackDispose(d.observerDisposer);
    host.trackDispose(d.persistDisposer);
    host.trackDispose({
        dispose: () => {
            const dbg = window as unknown as { __clanMap?: unknown };
            delete dbg.__clanMap;
        },
    });
}
