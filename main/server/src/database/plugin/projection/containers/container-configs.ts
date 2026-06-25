import { SQL_COLUMNS } from "../../../core/sql-columns.js";
import {
    EQUIPMENT,
    INVENTORY,
    KIND_MAIN,
    SEED_VAULT,
    type ContainerCause,
    type ContainerItem,
} from "./container-types.js";
import { itemName, itemPrice } from "./container-formatter.js";
import type { ContainerChangeCtx } from "./container-changes.js";

type Cell = string | number | null;

const INVENTORY_COLS = [
    SQL_COLUMNS.ITEM_ID,
    SQL_COLUMNS.ITEM_NAME,
    "container_kind",
    SQL_COLUMNS.QTY_SIGNED,
    SQL_COLUMNS.UNIT_PRICE_GP,
    "cause_action",
    "cause_option",
    "cause_target",
    "cause_target_id",
];

const SIMPLE_CONTAINER_COLS = [
    SQL_COLUMNS.ITEM_ID,
    SQL_COLUMNS.ITEM_NAME,
    SQL_COLUMNS.QTY_SIGNED,
    SQL_COLUMNS.UNIT_PRICE_GP,
];

function inventorySpecific(c: ContainerItem, containerKind: string, cause: ContainerCause): Cell[] {
    return [
        c.id,
        itemName(c),
        containerKind,
        c.qty,
        itemPrice(c),
        cause?.action ?? null,
        cause?.option ?? null,
        cause?.target ?? null,
        cause?.id ?? null,
    ];
}

function emit(ctx: ContainerChangeCtx, dedupKind: string, dedupParts: Cell[], specific: Cell[]): void {
    const { emitter, id, envelope, where } = ctx;
    emitter.emit({ id, envelope, where, dedupKind, dedupParts, specific });
}

export interface ContainerConfig {
    table: string;
    cols: string[];
    build: (ctx: ContainerChangeCtx, c: ContainerItem, cause: ContainerCause) => void;
}

export const CONTAINER_CONFIGS: Record<string, ContainerConfig> = {
    [INVENTORY]: {
        table: "plugin_inventory_changes",
        cols: INVENTORY_COLS,
        build: (ctx, c, cause) =>
            emit(ctx, "inventory_change", [KIND_MAIN, c.id, c.qty], inventorySpecific(c, KIND_MAIN, cause)),
    },
    [EQUIPMENT]: {
        table: "plugin_equipment_changes",
        cols: SIMPLE_CONTAINER_COLS,
        build: (ctx, c) => emit(ctx, "equipment_change", [c.id, c.qty], [c.id, itemName(c), c.qty, itemPrice(c)]),
    },
    [SEED_VAULT]: {
        table: "plugin_seed_vault_changes",
        cols: SIMPLE_CONTAINER_COLS,
        build: (ctx, c) => emit(ctx, "seed_vault_change", [c.id, c.qty], [c.id, itemName(c), c.qty, itemPrice(c)]),
    },
};
