let pageReady = typeof window === "undefined" || document.readyState === "complete";

export function isPageReady(): boolean {
    return pageReady;
}

export function markPageReady(): void {
    pageReady = true;
}
