const CHROME_TOP_SELECTORS: ReadonlyArray<string> = [".page-banner__row", ".clans-home__edit-strip"];
const CHROME_BOTTOM_SELECTOR = ".ai-bar:not(.ai-bar--hidden)";

export function measureChromeBottom(): number {
    let bottom = 0;
    for (const sel of CHROME_TOP_SELECTORS) {
        const el = document.querySelector(sel) as HTMLElement | null;
        if (el === null) continue;
        const rect = el.getBoundingClientRect();
        if (rect.bottom > bottom) bottom = rect.bottom;
    }
    return bottom;
}

export function measureBottomGutter(): number {
    const el = document.querySelector(CHROME_BOTTOM_SELECTOR) as HTMLElement | null;
    if (el === null) return 0;
    return Math.max(0, window.innerHeight - el.getBoundingClientRect().top);
}

export function chromeObserveSelectors(): readonly string[] {
    return [...CHROME_TOP_SELECTORS, ".ai-bar"];
}
