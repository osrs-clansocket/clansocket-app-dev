import type { ActiveRoute } from "./link-active-route.js";
import type { CompiledRoute } from "./link-compiled-route.js";

const NONE = null;

const registered: CompiledRoute[] = [];
let active: ActiveRoute | null = NONE;
let started = false;

export function getRegistered(): CompiledRoute[] {
    return registered;
}

export function getActive(): ActiveRoute | null {
    return active;
}

export function setActive(next: ActiveRoute | null): void {
    active = next;
}

export function isStarted(): boolean {
    return started;
}

export function markStarted(): void {
    started = true;
}
