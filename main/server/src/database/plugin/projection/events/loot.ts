import { SQL_COLUMNS } from "../../../core/sql-columns.js";
import type { ChangeEmitter } from "../change-inserter.js";
import { buildChangeEmitter } from "../change-inserter.js";
import type { HandlerCtx } from "../handler-ctx.js";
import {
    asNumber,
    asNumberNullable,
    asString,
    asStringNullable,
    extractWhere,
    sanitizeItemName,
    type Payload,
    type PlayerIdentity,
    type SpatialColumns,
} from "../projection-utils.js";
import { upsertItemsCatalog } from "../items-catalog.js";
import { reconcileNpcKc } from "../npc-kc-recorder.js";

function causeName(payload: Payload, causeKind: string): string | null {
    return causeKind === "PLAYER" ? null : asStringNullable(payload.source);
}

function causeCombat(payload: Payload, causeKind: string): number | null {
    if (causeKind === "PLAYER" || causeKind === "ENVIRONMENT") return null;
    return asNumberNullable(payload.sourceLevel);
}

interface LootItem {
    id: number;
    qty: number;
    name?: string;
    price?: number;
}

interface LootCause {
    causeKind: string;
    causeId: number | null;
    causeName: string | null;
    causeCombatLevel: number | null;
    kc: number | null;
}

interface InsertLootArgs {
    emitter: ChangeEmitter;
    id: PlayerIdentity;
    envelope: HandlerCtx["envelope"];
    where: SpatialColumns;
    cause: LootCause;
    item: LootItem;
}

function insertLootDrop(args: InsertLootArgs): void {
    const { emitter, id, envelope, where, cause, item } = args;
    const itemName = sanitizeItemName(asString(item.name, ""));
    const itemPrice = asNumber(item.price, 0);
    const price = itemPrice > 0 ? itemPrice : null;
    emitter.emit({
        id,
        envelope,
        where,
        dedupKind: "loot_drop",
        dedupParts: [cause.causeKind, cause.causeId ?? 0, item.id, item.qty],
        specific: [
            item.id,
            itemName,
            item.qty,
            price,
            cause.causeKind,
            cause.causeId,
            cause.causeName,
            cause.causeCombatLevel,
            cause.kc,
        ],
    });
}

const LOOT_DROP_COLS = [
    SQL_COLUMNS.ITEM_ID,
    SQL_COLUMNS.ITEM_NAME,
    "qty",
    SQL_COLUMNS.UNIT_PRICE_GP,
    "cause_kind",
    "cause_id",
    "cause_name",
    "cause_combat_level",
    "kc",
];

function extractLootCause(payload: Payload): LootCause {
    const causeKind = asString(payload.sourceType, "UNKNOWN");
    return {
        causeKind,
        causeId: asNumberNullable(payload.sourceId),
        causeName: causeName(payload, causeKind),
        causeCombatLevel: causeCombat(payload, causeKind),
        kc: asNumberNullable(payload.kc),
    };
}

export function handleLoot(ctx: HandlerCtx): void {
    const { conn, payload, now, envelope, id } = ctx;
    const items: LootItem[] = Array.isArray(payload.items) ? payload.items : [];
    if (items.length === 0) return;
    const where = extractWhere(payload);
    const cause = extractLootCause(payload);
    const emitter = buildChangeEmitter(conn, "plugin_loot_drops", LOOT_DROP_COLS);
    conn.transaction(() => {
        upsertItemsCatalog(conn, items, now);
        for (const item of items) {
            if (asNumberNullable(item.id) === null || asNumberNullable(item.qty) === null) continue;
            insertLootDrop({ emitter, id, envelope, where, cause, item });
        }
        reconcileNpcKc({
            conn,
            id,
            now,
            sourceKind: cause.causeKind,
            sourceId: cause.causeId,
            sourceName: cause.causeName,
            kc: cause.kc,
        });
    })();
}
