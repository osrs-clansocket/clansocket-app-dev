import type { EnterFn, LeaveFn } from "./link-fn-types.js";

export interface DeepLinkRoute {
    pattern: string;
    onEnter: EnterFn;
    onLeave?: LeaveFn;
}
