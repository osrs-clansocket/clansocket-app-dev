import { isStarted, markStarted } from "./deep-link-store.js";
import { resolvePath } from "./deep-link-resolver.js";

const EVT_POPSTATE = "popstate";

export function start(): void {
    if (isStarted()) return;
    markStarted();
    window.addEventListener(EVT_POPSTATE, () => resolvePath(window.location.pathname));
    resolvePath(window.location.pathname);
}
