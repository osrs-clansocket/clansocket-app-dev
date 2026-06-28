import { buildChangeEmitter } from "../change-inserter.js";
import type { HandlerCtx } from "../handler-ctx.js";
import { extractWhere } from "../projection-utils.js";
import { EVENT_WORLD_HOP } from "../../../../plugin-api/event-types.js";
import { registerPluginEvent } from "../../../../flows/registries/plugin-event-registry.js";

export function handleWorldHop(ctx: HandlerCtx): void {
    const { conn, payload, now, envelope, id } = ctx;
    const { accountHash } = id;
    const fromWorld = typeof payload.fromWorld === "number" ? payload.fromWorld : 0;
    const toWorld = typeof payload.toWorld === "number" ? payload.toWorld : 0;
    const where = extractWhere(payload);
    const emitter = buildChangeEmitter(conn, "plugin_world_hops", ["from_world", "to_world"]);
    conn.transaction(() => {
        emitter.emit({
            id,
            envelope,
            where,
            dedupKind: "world_hop",
            dedupParts: [fromWorld, toWorld],
            specific: [fromWorld, toWorld],
        });
        conn.prepare(
            `UPDATE plugin_current_state SET world = $toWorld, last_seen = $now, updated_at = $now WHERE account_hash = $accountHash`,
        ).run({ toWorld, now, accountHash });
    })();
}

registerPluginEvent({
    eventType: EVENT_WORLD_HOP,
    routing: "current-state",
    handler: handleWorldHop,
    payloadFields: [
        { name: "fromWorld", type: "integer" },
        { name: "toWorld", type: "integer" },
    ],
});
