import type { Params } from "./deep-link-pattern.js";
import type { CompiledRoute } from "./link-compiled-route.js";

export interface ActiveRoute {
    route: CompiledRoute;
    params: Params;
    path: string;
}
