import { applyRouteSeo } from "../../dom/factory/seo-ops/apply-seo.js";
import { events } from "../events";
import { type Route } from "./types.js";
import { renderRouteInto } from "./route-renderer.js";
import {
    getCurrentPath,
    getNextDirection,
    getRouteRoot,
    getRoutes,
    isMounted,
    setCurrentPath,
    setNextDirection,
    setRootEl,
} from "./index-store.js";
import { applyCanonicalRedirect, findRoute } from "./index-finder.js";
import { routeGuard } from "./index-guard.js";

export const router = {
    register(route: Route): void {
        getRoutes().push(route);
    },

    mount(root: HTMLElement): void {
        setRootEl(root);
        window.addEventListener("popstate", () => {
            setNextDirection("backward");
            this.resolve(location.pathname);
        });
        document.addEventListener("click", (e) => {
            const anchor = (e.target as HTMLElement).closest<HTMLAnchorElement>("a[data-route]");
            if (anchor) {
                e.preventDefault();
                this.navigate(anchor.getAttribute("href")!);
            }
        });
        this.resolve(location.pathname);
    },

    navigate(path: string, direction: "forward" | "backward" = "forward"): void {
        if (path === getCurrentPath()) return;
        setNextDirection(direction);
        history.pushState(null, "", path);
        this.resolve(path);
    },

    async resolve(path: string): Promise<void> {
        if (!isMounted()) return;
        path = applyCanonicalRedirect(path);
        const route = findRoute(path);
        if (!route) return;
        if (route.guard && !(await routeGuard(route, path, this))) return;
        const prev = getCurrentPath();
        const prevRoute = prev === "" ? undefined : findRoute(prev);
        setCurrentPath(path);
        events.emit("route:change", path);
        applyRouteSeo(path, route.seo).catch(() => undefined);
        if (prevRoute !== undefined && prevRoute === route && prevRoute.match === undefined) return;
        const direction = getNextDirection();
        setNextDirection("forward");
        await renderRouteInto({ root: getRouteRoot(), route, path, direction });
        window.scrollTo(0, 0);
    },

    current(): string {
        return getCurrentPath();
    },
} as const;
