import type { ClientEvents } from "discord.js";
import { discordTriggerByListenerEvent } from "@clansocket/constants/discord-trigger-manifest";
import type { ListenerSpec } from "./dispatch.js";

export type ListenerSpecInput<TEntity> = Omit<ListenerSpec<TEntity>, "triggerId"> & {
    triggerId?: string;
};

const listeners: ListenerSpec<any>[] = [];

function resolveTriggerId(event: keyof ClientEvents, override: string | undefined): string {
    if (typeof override === "string" && override.length > 0) return override;
    const spec = discordTriggerByListenerEvent(String(event));
    if (!spec) throw new Error(`no shared trigger manifest entry for gateway event "${String(event)}"`);
    return spec.triggerId;
}

export function registerListener<T>(spec: ListenerSpecInput<T>): void {
    const triggerId = resolveTriggerId(spec.event, spec.triggerId);
    listeners.push({ ...spec, triggerId } as ListenerSpec<any>);
}

export function listListeners(): ReadonlyArray<ListenerSpec<any>> {
    return listeners;
}
