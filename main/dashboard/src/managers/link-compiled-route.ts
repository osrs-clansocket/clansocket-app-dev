import type { PatternSegment } from "./deep-link-pattern.js";
import type { DeepLinkRoute } from "./deep-link-route.js";

export interface CompiledRoute {
    segments: PatternSegment[];
    route: DeepLinkRoute;
}
