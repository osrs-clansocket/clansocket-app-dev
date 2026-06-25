import { brand, type ReadSignal } from "./reactive-types.js";
import { track } from "./reactive-track.js";
import { freshObserver, rebindThen } from "./reactive-observer-ops.js";

export function derived<T>(fn: () => T): ReadSignal<T> {
    const memo = freshObserver(true);
    memo.run = (): void => {
        rebindThen(memo, () => {
            memo.value = fn();
        });
    };
    return brand((): T => {
        if (memo.dirty) {
            memo.dirty = false;
            memo.run();
        }
        if (memo.memoSubs !== null) track(memo.memoSubs);
        return memo.value as T;
    }) as ReadSignal<T>;
}
