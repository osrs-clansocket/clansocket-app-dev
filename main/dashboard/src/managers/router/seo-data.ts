import type { RouteChangeFreq } from "./seo-change-freq.js";

export interface RouteSeoData {
    title: string;
    description: string;
    image?: string;
    hidden?: boolean;
    changefreq?: RouteChangeFreq;
    priority?: number;
}
