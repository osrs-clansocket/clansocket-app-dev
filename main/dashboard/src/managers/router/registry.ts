import type { Route, RouteNavMeta } from "./types.js";

export interface RouteDef extends Route {
    description: string;
    example?: string;
}

const defs: RouteDef[] = [];

export function defineRoute(def: RouteDef): void {
    defs.push(def);
}

export function routeDefs(): readonly RouteDef[] {
    return defs;
}

export interface ResolvedNavPage extends RouteNavMeta {
    route: string;
}

export function navPages(isAuthed: boolean): ResolvedNavPage[] {
    return defs
        .filter((d) => d.nav !== undefined)
        .filter((d) => !(d.nav!.requiresAuth === true && !isAuthed))
        .map((d) => ({ ...d.nav!, route: d.path }))
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}
