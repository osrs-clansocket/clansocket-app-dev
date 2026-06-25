import type { Instance } from "../../dom/factory/index.js";
import type { RouteSeoData, RouteSeoResolver } from "./types-seo.js";
import type { RouteNavMeta } from "./types-nav.js";

export type RouteRenderResult = HTMLElement | Instance | Promise<HTMLElement | Instance>;

export interface Route {
    path: string;
    render: (path: string) => RouteRenderResult;
    seo: RouteSeoData | RouteSeoResolver;
    match?: (path: string) => boolean;
    guard?: (path: string) => boolean | Promise<boolean>;
    onReject?: string | ((path: string) => string);
    preload?: ReadonlyArray<() => Promise<unknown>>;
    nav?: RouteNavMeta;
}
