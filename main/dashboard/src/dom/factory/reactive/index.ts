export { isSignal } from "./reactive-types.js";
export type { Disposable, ReadSignal, Signal, ReactiveValue, EffectOwner } from "./reactive-types.js";
export { signal } from "./reactive-signal.js";
export { effect } from "./reactive-effect.js";
export { derived } from "./reactive-derived.js";

export function snapshot<T>(value: T): T {
    return value;
}
