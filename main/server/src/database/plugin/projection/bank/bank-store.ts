import type Database from "better-sqlite3";
import { asNumberNullable } from "../projection-utils.js";
import { safeItemName, safePrice } from "./bank-utils.js";

export interface BankItem {
    id: number;
    qty: number;
    name?: string;
    price?: number;
    slot?: number;
    bankTab?: number;
}

interface UpsertBankItem {
    conn: Database.Database;
    accountHash: string;
    rsn: string | null;
    item: BankItem;
    now: number;
}

interface BankItemBind {
    itemName: string;
    price: number | null;
    slot: number | null;
    bankTab: number | null;
}

function extractBankBind(item: BankItem): BankItemBind {
    const slot = asNumberNullable(item.slot);
    return {
        itemName: safeItemName(item.name),
        price: safePrice(item.price),
        slot: slot !== null && slot >= 0 ? slot : null,
        bankTab: asNumberNullable(item.bankTab),
    };
}

const BANK_UPSERT_SQL = `INSERT INTO plugin_bank (account_hash, rsn, item_id, item_name, qty, unit_price_gp, slot, bank_tab, first_seen, last_seen, updated_at)
 VALUES ($accountHash, $rsn, $itemId, $itemName, $qty, $price, $slot, $bankTab, $now, $now, $now)
 ON CONFLICT (account_hash, item_id) DO UPDATE SET
    rsn = excluded.rsn,
    item_name = excluded.item_name,
    qty = excluded.qty,
    unit_price_gp = COALESCE(excluded.unit_price_gp, unit_price_gp),
    slot = excluded.slot,
    bank_tab = excluded.bank_tab,
    last_seen = excluded.last_seen,
    updated_at = CASE
        WHEN qty != excluded.qty
          OR item_name != excluded.item_name
          OR COALESCE(unit_price_gp, -1) != COALESCE(excluded.unit_price_gp, -1)
          OR COALESCE(slot, -1) != COALESCE(excluded.slot, -1)
          OR COALESCE(bank_tab, -1) != COALESCE(excluded.bank_tab, -1)
        THEN excluded.updated_at
        ELSE updated_at
    END`;

function upsertBankItem(args: UpsertBankItem): void {
    const { conn, accountHash, rsn, item, now } = args;
    const itemId = asNumberNullable(item.id);
    if (itemId === null) return;
    const b = extractBankBind(item);
    conn.prepare(BANK_UPSERT_SQL).run({ rsn: rsn ?? "", accountHash, itemId, qty: item.qty, now, ...b });
}

function reconcileBank(conn: Database.Database, accountHash: string, keepIds: number[]): void {
    if (keepIds.length === 0) {
        conn.prepare(`DELETE FROM plugin_bank WHERE account_hash = ?`).run(accountHash);
        return;
    }
    const ph = keepIds.map(() => "?").join(",");
    conn.prepare(`DELETE FROM plugin_bank WHERE account_hash = ? AND item_id NOT IN (${ph})`).run(
        accountHash,
        ...keepIds,
    );
}

export interface UpsertBankItems {
    conn: Database.Database;
    accountHash: string;
    rsn: string | null;
    items: BankItem[];
    now: number;
}

export function upsertBankItems(args: UpsertBankItems): void {
    const { conn, accountHash, rsn, items, now } = args;
    const keepIds: number[] = [];
    for (const item of items) {
        const itemId = asNumberNullable(item.id);
        if (itemId === null) continue;
        upsertBankItem({ conn, accountHash, rsn, item, now });
        keepIds.push(itemId);
    }
    reconcileBank(conn, accountHash, keepIds);
}
