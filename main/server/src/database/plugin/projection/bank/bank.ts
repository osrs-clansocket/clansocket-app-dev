import type { ChangeEmitter } from "../change-inserter.js";
import { buildChangeEmitter } from "../change-inserter.js";
import { type BankItem, upsertBankItems } from "./bank-store.js";
import type { EventEnvelopeCols } from "../envelope.js";
import type { HandlerCtx } from "../handler-ctx.js";
import { asNumberNullable, extractWhere, type PlayerIdentity, type SpatialColumns } from "../projection-utils.js";
import { upsertItemsCatalog } from "../items-catalog.js";
import { safeItemName, safePrice } from "./bank-utils.js";

export function handleBankOpen(ctx: HandlerCtx): void {
    const { conn, payload, now } = ctx;
    const { accountHash, rsn } = ctx.id;
    const items: BankItem[] = Array.isArray(payload.items) ? payload.items : [];
    conn.transaction(() => {
        upsertItemsCatalog(conn, items, now);
        upsertBankItems({ conn, accountHash, rsn, items, now });
    })();
}

const BANK_CHANGE_COLS = ["item_id", "item_name", "qty_signed", "unit_price_gp"];

interface BankChangeArgs {
    emitter: ChangeEmitter;
    id: PlayerIdentity;
    envelope: EventEnvelopeCols;
    where: SpatialColumns;
    change: BankItem;
}

function emitBankChange(args: BankChangeArgs): void {
    const { emitter, id, envelope, where, change } = args;
    const itemId = asNumberNullable(change.id);
    const qty = asNumberNullable(change.qty);
    if (itemId === null || qty === null || qty === 0) return;
    emitter.emit({
        id,
        envelope,
        where,
        dedupKind: "bank_change",
        dedupParts: [itemId, qty],
        specific: [itemId, safeItemName(change.name), qty, safePrice(change.price)],
    });
}

export function handleBankClose(ctx: HandlerCtx): void {
    const { conn, payload, now, envelope, id } = ctx;
    const { accountHash, rsn } = id;
    const items: BankItem[] = Array.isArray(payload.items) ? payload.items : [];
    const changes: BankItem[] = Array.isArray(payload.changes) ? payload.changes : [];
    const where = extractWhere(payload);
    const emitter = buildChangeEmitter(conn, "plugin_bank_changes", BANK_CHANGE_COLS);
    conn.transaction(() => {
        upsertItemsCatalog(conn, items, now);
        upsertItemsCatalog(conn, changes, now);
        upsertBankItems({ conn, accountHash, rsn, items, now });
        for (const change of changes) emitBankChange({ emitter, id, envelope, where, change });
    })();
}
