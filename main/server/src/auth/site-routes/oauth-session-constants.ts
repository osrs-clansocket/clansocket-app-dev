import { MS_PER_DAY, TEN_MINUTES_MS } from "../../shared/time/index.js";
import { COOKIE_OAUTH_STATE, COOKIE_SITE_SESSION } from "../oauth-providers.js";

export const STATE_COOKIE = COOKIE_OAUTH_STATE;
export const SESSION_COOKIE = COOKIE_SITE_SESSION;
export const STATE_TTL_MS = TEN_MINUTES_MS;
export const SESSION_TTL_MS = 30 * MS_PER_DAY;
export const LINK_COOKIE = "cs_oauth_link";
export const OAUTH_PATH = "/api/auth/site";
export const ROOT_PATH = "/";
