import type { Router } from "express";

const apis: [string, Router][] = [];

export function registerApi(prefix: string, router: Router): void {
    apis.push([prefix, router]);
}

export function mountedApis(): readonly [string, Router][] {
    return apis;
}
