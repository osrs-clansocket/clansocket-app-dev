import stackVariantsRaw from "./stack-variants.json";
import { resolveVariant, type VariantRegistry } from "./variant-resolver.js";
import { readFirstNumber } from "./row-value-reader.js";

const BASE = "/resources/osrs/icon_item_ids";
const ID_COLUMNS: readonly string[] = ["item_id", "crop_id"];
const QUANTITY_COLUMNS: readonly string[] = ["qty", "qty_signed"];
const SHARD_RADIX = 16;
const SHARD_MOD = 256;
const SHARD_PAD = 2;

const STACK_VARIANTS = stackVariantsRaw as unknown as VariantRegistry;

function asNumericId(value: unknown): number | null {
    if (typeof value === "number") return Number.isFinite(value) && Number.isInteger(value) ? value : null;
    if (typeof value === "string") {
        const trimmed = value.trim();
        if (trimmed.length === 0) return null;
        const n = Number(trimmed);
        return Number.isFinite(n) && Number.isInteger(n) ? n : null;
    }
    return null;
}

function isIdColumn(column: string): boolean {
    for (const c of ID_COLUMNS) {
        if (c === column) return true;
    }
    return false;
}

function buildPath(id: number, row: Record<string, unknown>): string {
    const qty = readFirstNumber(row, QUANTITY_COLUMNS);
    const absQty = qty === null ? null : Math.abs(qty);
    const finalId = resolveVariant(STACK_VARIANTS, id, absQty);
    const shard = (finalId % SHARD_MOD).toString(SHARD_RADIX).padStart(SHARD_PAD, "0");
    return `${BASE}/${shard}/${finalId}.webp`;
}

export function resolveItemAsset(
    _table: string,
    column: string,
    value: unknown,
    row: Record<string, unknown>,
): string | null {
    if (isIdColumn(column)) {
        const id = asNumericId(value);
        return id === null ? null : buildPath(id, row);
    }
    for (const idCol of ID_COLUMNS) {
        const siblingId = asNumericId(row[idCol]);
        if (siblingId !== null) return buildPath(siblingId, row);
    }
    return null;
}
