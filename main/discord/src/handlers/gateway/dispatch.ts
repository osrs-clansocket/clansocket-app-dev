import type { Client, ClientEvents } from "discord.js";
import { fire } from "../../flow-api/trigger-bus.js";

export interface ListenerSpec<TEntity> {
    event: keyof ClientEvents;
    triggerId: string;
    selectEntity: (...args: any[]) => TEntity | null;
    buildPayload: (entity: TEntity) => Record<string, unknown> & { guildId: string };
    persist: (guildId: string, entity: TEntity, ...args: any[]) => Promise<unknown> | void;
}

export function wireListeners(client: Client, specs: ReadonlyArray<ListenerSpec<any>>): void {
    for (const spec of specs) {
        client.on(spec.event as any, (...args: any[]) => {
            const entity = spec.selectEntity(...args);
            if (!entity) return;
            const payload = spec.buildPayload(entity);
            if (!payload.guildId) return;
            fire(spec.triggerId, payload);
            const result = spec.persist(payload.guildId, entity, ...args);
            if (result instanceof Promise) result.catch(() => undefined);
        });
    }
}
