import type { ListenerSpec } from "./dispatch.js";

const listeners: ListenerSpec<any>[] = [];

export function registerListener<T>(spec: ListenerSpec<T>): void {
    listeners.push(spec as ListenerSpec<any>);
}

export function listListeners(): ReadonlyArray<ListenerSpec<any>> {
    return listeners;
}
