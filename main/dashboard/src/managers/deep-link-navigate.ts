import type { NavigateOptions } from "./link-navigate-options.js";
import { setActive } from "./deep-link-store.js";
import { findMatch, resolvePath } from "./deep-link-resolver.js";

export function navigate(path: string, opts: NavigateOptions = {}): void {
    const method = opts.replace ? history.replaceState.bind(history) : history.pushState.bind(history);
    method(null, "", path);
    if (opts.silent) setActive(findMatch(path));
    else resolvePath(path);
}
