import { normalizeClanPath } from "./slug-paths.js";
import { type Route } from "./types.js";
import { getRoutes } from "./index-store.js";

export function findRoute(path: string): Route | undefined {
    const queryAt = path.indexOf("?");
    const pathname = queryAt === -1 ? path : path.slice(0, queryAt);
    const routes = getRoutes();
    return (
        routes.find((r) => r.path === pathname) ??
        routes.find((r) => r.match !== undefined && r.match(pathname)) ??
        routes.find((r) => r.path === "/")
    );
}

export function applyCanonicalRedirect(path: string): string {
    const canonical = normalizeClanPath(path);
    if (canonical !== path) {
        history.replaceState(null, "", canonical);
        return canonical;
    }
    return path;
}
