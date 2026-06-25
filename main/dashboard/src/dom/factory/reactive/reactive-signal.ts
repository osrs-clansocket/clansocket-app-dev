import { brand, type Observer, type Signal } from "./reactive-types.js";
import { track } from "./reactive-track.js";
import { markDownstream, scheduleFlush } from "./reactive-flush.js";

export function signal<T>(initial: T): Signal<T> {
    let value = initial;
    const subscribers = new Set<Observer>();
    const read = brand((): T => {
        track(subscribers);
        return value;
    }) as Signal<T>;
    read.set = (next: T): void => {
        if (Object.is(value, next)) return;
        value = next;
        markDownstream(subscribers);
        scheduleFlush();
    };
    return read;
}
