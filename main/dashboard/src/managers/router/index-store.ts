import { createInstance, type Instance } from "../../dom/factory";
import type { Route } from "./types.js";

const NO_ELEMENT: HTMLElement | null = null;
const routes: Route[] = [];
let rootEl: HTMLElement | null = NO_ELEMENT;
let rootInst: Instance | null = null;
let currentPath = "";
let nextDirection: "forward" | "backward" = "forward";

export function getRoutes(): Route[] {
    return routes;
}

export function setRootEl(el: HTMLElement): void {
    rootEl = el;
}

export function isMounted(): boolean {
    return rootEl !== NO_ELEMENT;
}

export function getRouteRoot(): Instance {
    if (rootInst === null) rootInst = createInstance(rootEl!);
    return rootInst;
}

export function getCurrentPath(): string {
    return currentPath;
}

export function setCurrentPath(path: string): void {
    currentPath = path;
}

export function getNextDirection(): "forward" | "backward" {
    return nextDirection;
}

export function setNextDirection(dir: "forward" | "backward"): void {
    nextDirection = dir;
}
