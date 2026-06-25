import { ensureRow } from "../current-state.js";
import type { HandlerCtx } from "../handler-ctx.js";
import { writeDealtBucket, writeTakenBucket } from "./combat-buckets.js";
import { extractDealtFacts, extractTakenFacts } from "./combat-facts.js";
import { updateDealtCurrent, updateTakenCurrent } from "./combat-state.js";

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
