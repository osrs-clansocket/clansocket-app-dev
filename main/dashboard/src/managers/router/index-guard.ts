import { type Route } from "./types.js";

export async function routeGuard(route: Route, path: string, r: { navigate(p: string): void }): Promise<boolean> {
    const allowed = await route.guard!(path);
    if (allowed !== false) return true;
    const reject = typeof route.onReject === "function" ? route.onReject(path) : (route.onReject ?? "/");
    r.navigate(reject);
    return false;
}
