export function wireUnmountCleanup(rootEl: HTMLElement, teardown: () => void): void {
    const observer = new MutationObserver(() => {
        if (rootEl.isConnected) return;
        teardown();
        observer.disconnect();
    });
    observer.observe(document.body, { childList: true, subtree: true });
}
