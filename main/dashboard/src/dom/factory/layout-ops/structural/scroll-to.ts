const SCROLLABLE_OVERFLOW: ReadonlySet<string> = new Set(["scroll", "auto"]);

export function scrollToTarget(el: Element): void {
    let parent: Element | null = el.parentElement;
    while (parent !== null && !SCROLLABLE_OVERFLOW.has(getComputedStyle(parent).overflowY)) {
        parent = parent.parentElement;
    }
    const scrollParent = parent ?? document.documentElement;
    const block: ScrollLogicalPosition =
        el.getBoundingClientRect().height > scrollParent.clientHeight ? "start" : "center";
    el.scrollIntoView({ behavior: "smooth", block });
}
