import { createInstance, type Instance } from "../../dom/factory";
import { errorBanner } from "../../dom/factory/data-ops/error-banner.js";
import { ERROR_BANNER_ACTION_HOME } from "../../shared/constants/error-banner-constants.js";
import { ROUTE_ENTER_BACKWARD, ROUTE_ENTER_FORWARD, type Route } from "./types.js";
import { ROUTE_ERROR_TITLE_TEXT } from "../../shared/constants/route/route-constants.js";

const PRELOAD_IDLE_FALLBACK_MS = 200;

export function isInstance(v: unknown): v is Instance {
    return typeof v === "object" && v !== null && "el" in v && "destroy" in v;
}

function paintRenderError(root: ReturnType<typeof createInstance>, err: unknown, path: string): void {
    const errorObj = err as Error;
    const banner = errorBanner({
        path,
        title: ROUTE_ERROR_TITLE_TEXT,
        message: errorObj.message,
        stack: errorObj.stack,
        action: ERROR_BANNER_ACTION_HOME,
    });
    root.addChild(banner);
}

function triggerPreloads(preload: Route["preload"]): void {
    if (preload === undefined || preload.length === 0) return;
    const fire = (): void => {
        for (const loader of preload) {
            loader().catch(() => undefined);
        }
    };
    if (typeof requestIdleCallback === "function") {
        requestIdleCallback(fire, { timeout: 2000 });
    } else {
        setTimeout(fire, PRELOAD_IDLE_FALLBACK_MS);
    }
}

function mountRouteResult(
    root: Instance,
    result: Awaited<ReturnType<Route["render"]>>,
    enterClass: string,
): HTMLElement {
    const el = isInstance(result) ? result.el : result;
    el.classList.add(enterClass);
    if (isInstance(result)) root.setChildren(result);
    else {
        root.clear();
        root.addChild(el);
    }
    const handler = (): void => {
        el.classList.remove(enterClass);
        el.removeEventListener("animationend", handler);
    };
    el.addEventListener("animationend", handler);
    return el;
}

export async function renderRouteInto(args: {
    root: Instance;
    route: Route;
    path: string;
    direction: "forward" | "backward";
}): Promise<void> {
    const { root, route, path, direction } = args;
    const enterClass = direction === "backward" ? ROUTE_ENTER_BACKWARD : ROUTE_ENTER_FORWARD;
    try {
        const result = await route.render(path);
        mountRouteResult(root, result, enterClass);
        triggerPreloads(route.preload);
    } catch (err) {
        root.clear();
        paintRenderError(root, err, path);
    }
}
