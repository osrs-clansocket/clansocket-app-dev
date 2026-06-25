import type { RouteSeoData } from "./seo-data.js";

export type RouteSeoResolver = (path: string) => Promise<RouteSeoData | null>;
