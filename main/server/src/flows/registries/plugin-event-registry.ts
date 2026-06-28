import { BaseRegistry } from "../../base/base-registry.js";
import type { Database } from "better-sqlite3";
import type { HandlerCtx } from "../../database/plugin/projection/handler-ctx.js";
import type { FlowFieldList } from "./payload-field-types.js";
import { registerTrigger, type RegisteredTrigger } from "./trigger-registry.js";

export type PluginEventRouting = "current-state" | "event" | "bucket";

export type CurrentStateHandler = (ctx: HandlerCtx) => void;
export type EventHandler = (
    conn: Database,
    accountHash: string,
    rsn: string | null,
    payload: Readonly<Record<string, unknown>>,
    now: number,
) => void;
export type BucketHandler = (
    conn: Database,
    accountHash: string,
    rsn: string | null,
    payload: Readonly<Record<string, unknown>>,
    bucket: number,
) => void;

export interface PluginEventRegistration {
    readonly eventType: string;
    readonly routing: PluginEventRouting;
    readonly handler: CurrentStateHandler | EventHandler | BucketHandler;
    readonly payloadFields: FlowFieldList;
    readonly capability?: string;
    readonly eventSource?: string;
}

class PluginEventRegistryStore extends BaseRegistry<string, PluginEventRegistration> {}

export const pluginEventRegistry = new PluginEventRegistryStore();

export function registerPluginEvent(spec: PluginEventRegistration): void {
    pluginEventRegistry.registerUnique(
        spec.eventType,
        spec,
        (key) => new Error(`plugin event "${key}" already registered`),
    );
    const capability = spec.capability ?? "plugin";
    const trigger: RegisteredTrigger = {
        capability,
        triggerId: spec.eventType,
        eventSource: spec.eventSource ?? `plugin.telemetry.${spec.eventType}`,
        routing: spec.routing,
        payloadFields: spec.payloadFields,
    };
    registerTrigger(trigger);
}

export function lookupPluginEvent(eventType: string): PluginEventRegistration | null {
    return pluginEventRegistry.get(eventType);
}

export function dispatchCurrentStateHandler(eventType: string, ctx: HandlerCtx): boolean {
    const spec = pluginEventRegistry.get(eventType);
    if (!spec || spec.routing !== "current-state") return false;
    (spec.handler as CurrentStateHandler)(ctx);
    return true;
}

export function dispatchEventHandler(
    eventType: string,
    conn: Database,
    accountHash: string,
    rsn: string | null,
    payload: Readonly<Record<string, unknown>>,
    now: number,
): boolean {
    const spec = pluginEventRegistry.get(eventType);
    if (!spec || spec.routing !== "event") return false;
    (spec.handler as EventHandler)(conn, accountHash, rsn, payload, now);
    return true;
}

export function dispatchBucketHandler(
    eventType: string,
    conn: Database,
    accountHash: string,
    rsn: string | null,
    payload: Readonly<Record<string, unknown>>,
    bucket: number,
): boolean {
    const spec = pluginEventRegistry.get(eventType);
    if (!spec || spec.routing !== "bucket") return false;
    (spec.handler as BucketHandler)(conn, accountHash, rsn, payload, bucket);
    return true;
}
