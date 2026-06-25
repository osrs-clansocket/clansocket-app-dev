import type { Params } from "./deep-link-pattern.js";

export type EnterFn = (params: Params) => void | Promise<void>;
export type LeaveFn = () => void | Promise<void>;
