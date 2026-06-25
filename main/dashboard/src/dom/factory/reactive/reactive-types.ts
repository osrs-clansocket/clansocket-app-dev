export type { Disposable, EffectOwner, Observer } from "./reactive-observer.js";

export const SIGNAL_BRAND = Symbol.for("lvi.signal");

export type ReadSignal<T> = {
    (): T;
    readonly [SIGNAL_BRAND]: true;
};

export type Signal<T> = ReadSignal<T> & {
    set(next: T): void;
};

export type ReactiveValue<T> = T | ReadSignal<T>;

export function isSignal(value: unknown): value is ReadSignal<unknown> {
    if (typeof value !== "function") return false;
    return (value as { [SIGNAL_BRAND]?: true })[SIGNAL_BRAND] === true;
}

export function brand<T extends object>(target: T): T & { [SIGNAL_BRAND]: true } {
    Object.defineProperty(target, SIGNAL_BRAND, { value: true });
    return target as T & { [SIGNAL_BRAND]: true };
}
