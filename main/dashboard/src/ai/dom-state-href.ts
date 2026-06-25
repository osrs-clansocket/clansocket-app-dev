const ATTR_HREF = "href";
const SELECTOR_ANCHOR = "a[href]";

export function extractHref(el: HTMLElement): string | null {
    if (el instanceof HTMLAnchorElement) {
        const own = el.getAttribute(ATTR_HREF);
        if (own) return own;
    }
    const ancestor = el.closest(SELECTOR_ANCHOR);
    if (ancestor && ancestor !== el) {
        const inherited = ancestor.getAttribute(ATTR_HREF);
        if (inherited) return inherited;
    }
    const descendant = el.querySelector(SELECTOR_ANCHOR);
    if (descendant) {
        const child = descendant.getAttribute(ATTR_HREF);
        if (child) return child;
    }
    return null;
}
