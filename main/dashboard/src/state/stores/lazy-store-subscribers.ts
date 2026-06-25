import { events } from "../../managers/events";
import type { FetchUnsub } from "./lazy-store-types.js";

export function pollFetch(ms: number): (refetch: () => void) => FetchUnsub {
    return (refetch) => {
        const handle = window.setInterval(refetch, ms);
        return () => window.clearInterval(handle);
    };
}

export function onEvent(name: string): (refetch: () => void) => FetchUnsub {
    return (refetch) => events.on(name, refetch);
}
