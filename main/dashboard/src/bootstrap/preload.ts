import { preloadIcons } from "../icons/providers";

const PRELOAD_DELAY_MS = 500;

export function schedulePreload(): void {
    const ric = (window as unknown as { requestIdleCallback?: (cb: () => void) => void }).requestIdleCallback;
    if (typeof ric === "function") ric(() => preloadIcons());
    else window.setTimeout(() => preloadIcons(), PRELOAD_DELAY_MS);
}

export function registerServiceWorker(): void {
    if (!import.meta.env.PROD) return;
    if (!("serviceWorker" in navigator)) return;
    window.addEventListener("load", () => {
        navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    });
}

export function cleanupServiceWorker(): void {}
