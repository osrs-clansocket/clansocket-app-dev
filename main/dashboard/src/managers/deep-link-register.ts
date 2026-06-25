import { compilePattern } from "./deep-link-pattern.js";
import type { CompiledRoute } from "./link-compiled-route.js";
import type { DeepLinkRoute } from "./deep-link-route.js";
import { getRegistered, isStarted } from "./deep-link-store.js";
import { resolvePath } from "./deep-link-resolver.js";

export function register(route: DeepLinkRoute): () => void {
    const compiled: CompiledRoute = { segments: compilePattern(route.pattern), route };
    getRegistered().push(compiled);
    if (isStarted()) resolvePath(window.location.pathname);
    return () => {
        const idx = getRegistered().indexOf(compiled);
        if (idx >= 0) getRegistered().splice(idx, 1);
    };
}
