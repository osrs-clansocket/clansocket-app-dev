export function unhideRoot(clone: HTMLElement, original: HTMLElement): void {
    clone.removeAttribute("hidden");
    if (clone.style.display === "none") clone.style.removeProperty("display");
    if (getComputedStyle(original).display === "none") {
        clone.style.setProperty("display", "revert", "important");
    }
}
