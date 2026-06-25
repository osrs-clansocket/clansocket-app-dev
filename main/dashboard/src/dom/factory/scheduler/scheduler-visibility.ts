import { isHidden } from "../../../managers/raf.js";

let visibilityBound = false;

export function bindVisibility(onVisibleWithWork: () => void): void {
    if (visibilityBound || typeof document === "undefined") return;
    visibilityBound = true;
    document.addEventListener("visibilitychange", () => {
        if (!isHidden()) onVisibleWithWork();
    });
}
