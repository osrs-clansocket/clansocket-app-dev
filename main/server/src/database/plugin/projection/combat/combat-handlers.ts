import { ensureRow } from "../current-state.js";
import type { HandlerCtx } from "../handler-ctx.js";
import { writeDealtBucket, writeTakenBucket } from "./combat-buckets.js";
import { extractDealtFacts, extractTakenFacts } from "./combat-facts.js";
import { updateDealtCurrent, updateTakenCurrent } from "./combat-state.js";
import { EVENT_DAMAGE_DEALT, EVENT_DAMAGE_TAKEN } from "../../../../plugin-api/event-types.js";
import { registerPluginEvent } from "../../../../flows/registries/plugin-event-registry.js";

export function handleDamageDealt(ctx: HandlerCtx): void {
    const { conn, payload, now, id } = ctx;
    const { accountHash, rsn } = id;
    ensureRow(conn, accountHash, rsn, now);
    const facts = extractDealtFacts(payload);
    updateDealtCurrent(conn, accountHash, facts, now);
    writeDealtBucket({ conn, accountHash, rsn, facts, now });
}

export function handleDamageTaken(ctx: HandlerCtx): void {
    const { conn, payload, now, id } = ctx;
    const { accountHash, rsn } = id;
    ensureRow(conn, accountHash, rsn, now);
    const facts = extractTakenFacts(payload);
    updateTakenCurrent(conn, accountHash, facts, now);
    writeTakenBucket({ conn, accountHash, rsn, facts, now });
}

registerPluginEvent({
    eventType: EVENT_DAMAGE_DEALT,
    routing: "current-state",
    handler: handleDamageDealt,
    payloadFields: [
        { name: "amount", type: "integer" },
        { name: "hitsplatType", type: "integer" },
        { name: "hitsplatName", type: "string" },
        { name: "targetKind", type: "string" },
        { name: "targetId", type: "integer" },
        { name: "targetName", type: "string" },
        { name: "attackStyle", type: "string" },
    ],
});

registerPluginEvent({
    eventType: EVENT_DAMAGE_TAKEN,
    routing: "current-state",
    handler: handleDamageTaken,
    payloadFields: [
        { name: "amount", type: "integer" },
        { name: "hitsplatType", type: "integer" },
        { name: "hitsplatName", type: "string" },
    ],
});
