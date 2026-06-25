import { matchRoute, splitPath } from "./deep-link-pattern.js";
import type { ActiveRoute } from "./link-active-route.js";
import { getActive, getRegistered, setActive } from "./deep-link-store.js";

export function findMatch(path: string): ActiveRoute | null {
    const parts = splitPath(path);
    for (const candidate of getRegistered()) {
        const params = matchRoute(candidate.segments, parts);
        if (params) return { route: candidate, params, path };
    }
    return null;
}

async function applyTransition(next: ActiveRoute | null): Promise<void> {
    const prev = getActive();
    setActive(next);
    if (prev && (!next || prev.route !== next.route)) {
        await prev.route.route.onLeave?.();
    }
    if (next && (!prev || next.route !== prev.route || next.path !== prev.path)) {
        await next.route.route.onEnter(next.params);
    }
}

export function resolvePath(path: string): void {
    void applyTransition(findMatch(path));
}
