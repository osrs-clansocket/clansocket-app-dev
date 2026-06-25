import type { ActiveRoute } from "./link-active-route.js";
import { getActive } from "./deep-link-store.js";

export function current(): ActiveRoute | null {
    return getActive();
}
