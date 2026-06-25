import type { FetchUnsub } from "./lazy-store-types.js";

export function bindVisibilityRefresh(fetchOnce: () => Promise<void>): FetchUnsub {
    const onVisible = (): void => {
        if (document.visibilityState === "visible") void fetchOnce();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
}
