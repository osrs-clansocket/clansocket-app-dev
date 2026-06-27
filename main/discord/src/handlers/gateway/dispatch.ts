import type { Client, ClientEvents } from "discord.js";
import logger from "@clansocket/logger";
import { fire } from "../../flow-api/trigger-bus.js";
import { apiRequest } from "../../fetchers/api-fetcher.js";
import { HTTP_METHOD_POST } from "../../core/constants.js";

export interface ListenerSpec<TEntity> {
    event: keyof ClientEvents;
    triggerId: string;
    selectEntity: (...args: any[]) => TEntity | null;
    buildPayload: (entity: TEntity) => Record<string, unknown> & { guildId: string };
    persist: (guildId: string, entity: TEntity, ...args: any[]) => Promise<unknown> | void;
}

function postFlowTrigger(triggerId: string, payload: Record<string, unknown> & { guildId: string }): void {
    apiRequest(HTTP_METHOD_POST, "/api/flows/discord-trigger", {
        guild_id: payload.guildId,
        trigger_id: triggerId,
        payload,
    }).catch((err: unknown) => {
        logger.warn(`flow-trigger post failed for ${triggerId}: ${(err as Error).message}`);
    });
}

export function wireListeners(client: Client, specs: ReadonlyArray<ListenerSpec<any>>): void {
    for (const spec of specs) {
        client.on(spec.event as any, (...args: any[]) => {
            const entity = spec.selectEntity(...args);
            if (!entity) return;
            const payload = spec.buildPayload(entity);
            if (!payload.guildId) return;
            fire(spec.triggerId, payload);
            postFlowTrigger(spec.triggerId, payload);
            const result = spec.persist(payload.guildId, entity, ...args);
            if (result instanceof Promise) result.catch(() => undefined);
        });
    }
}
