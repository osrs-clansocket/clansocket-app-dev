import type { Disposable } from "./reactive-types.js";
import { disposeObserver, freshObserver, rebindThen } from "./reactive-observer-ops.js";

export function effect(fn: () => void): Disposable {
    const e = freshObserver(false);
    e.run = (): void => {
        if (!e.active) return;
        rebindThen(e, fn);
    };
    e.run();
    return { dispose: () => disposeObserver(e) };
}
