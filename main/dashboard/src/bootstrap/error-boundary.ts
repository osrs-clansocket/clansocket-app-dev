import { events } from "../managers/events.js";
import { clearAllBanners, paintBanner } from "./error-banners.js";

const ROUTE_CHANGE_EVENT = "route:change";

let installed = false;

export function installErrorBoundary(): void {
    if (installed) return;
    installed = true;
    events.on(ROUTE_CHANGE_EVENT, clearAllBanners);
    window.addEventListener("error", (event) => {
        paintBanner(event.message, event.error instanceof Error ? event.error.stack : undefined);
    });
    window.addEventListener("unhandledrejection", (event) => {
        const reason = event.reason;
        if (reason instanceof Error) {
            paintBanner(reason.message, reason.stack);
            return;
        }
        paintBanner(String(reason), undefined);
    });
}
