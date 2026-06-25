import { Router } from "express";

const mounts: [string, Router][] = [];

export function registerMount(path: string, router: Router): void {
    mounts.push([path, router]);
}

export function mountedRouter(path: string): Router {
    const r = Router();
    mounts.push([path, r]);
    return r;
}

export function mountedRoutes(): readonly [string, Router][] {
    return mounts;
}
