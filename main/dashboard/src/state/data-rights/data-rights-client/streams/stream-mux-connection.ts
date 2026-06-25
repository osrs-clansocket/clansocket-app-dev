import { buildUrl } from "./stream-mux-records.js";
import { handleMessage } from "./stream-mux-message.js";
import {
    getEs,
    isPageReady,
    isReopenPending,
    markPageReady,
    getRecords,
    setEs,
    setReopenPending,
} from "./stream-mux-state.js";

function open(): void {
    if (!isPageReady()) return;
    if (getRecords().size === 0) return;
    const next = new EventSource(buildUrl(getRecords()), { withCredentials: true });
    next.addEventListener("message", handleMessage as (e: Event) => void);
    setEs(next);
}

export function scheduleReopen(): void {
    if (isReopenPending()) return;
    setReopenPending(true);
    queueMicrotask(() => {
        setReopenPending(false);
        const existing = getEs();
        if (existing) {
            existing.close();
            setEs(null);
        }
        open();
    });
}

if (!isPageReady() && typeof window !== "undefined") {
    window.addEventListener(
        "load",
        () => {
            markPageReady();
            if (getRecords().size > 0) scheduleReopen();
        },
        { once: true },
    );
}
