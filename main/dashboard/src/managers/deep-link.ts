import { register } from "./deep-link-register.js";
import { navigate } from "./deep-link-navigate.js";
import { start } from "./deep-link-start.js";
import { current } from "./deep-link-current.js";

const ROOT = "/";

const deepLink = { register, navigate, start, current, ROOT };

export { deepLink };
export type { DeepLinkRoute } from "./deep-link-route.js";
export type { NavigateOptions } from "./link-navigate-options.js";
export type { Params } from "./deep-link-pattern.js";
