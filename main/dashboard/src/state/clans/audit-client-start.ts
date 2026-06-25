import { events } from "../../managers/events.js";
import { flush, flushBeacon } from "./audit-client-flush.js";
import { parseSlug } from "./audit-client-slug.js";
import { push } from "./audit-client-push.js";
import { getCurrentSlug, isStarted, markStarted, setCurrentSlug } from "./audit-client-state.js";

function onRouteChange(...args: unknown[]): void {
    const path = typeof args[0] === "string" ? args[0] : window.location.pathname;
    const previousSlug = getCurrentSlug();
    void flush(previousSlug);
    setCurrentSlug(parseSlug(path));
    if (getCurrentSlug() !== null) {
        push("client:route", path);
    }
}

export function startAuditClient(): void {
    if (isStarted()) return;
    markStarted();
    events.on("route:change", onRouteChange);
    window.addEventListener("beforeunload", flushBeacon);
    window.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "hidden") flushBeacon();
    });
}
