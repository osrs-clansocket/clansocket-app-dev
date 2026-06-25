import type { HandlerCtx } from "../handler-ctx.js";
import { extractWhere } from "../projection-utils.js";
import { upsertItemsCatalog } from "../items-catalog.js";
import { dispatchContainerDelta } from "./container-changes.js";
import { snapshotEquipment, snapshotInventory, snapshotSeedVault } from "./container-snapshots.js";
import {
    EQUIPMENT,
    INVENTORY,
    KIND_MAIN,
    KIND_RUNE_POUCH,
    SEED_VAULT,
    type ContainerCause,
    type ContainerItem,
    type RunePouchSlot,
} from "./container-types.js";

export function handleContainer(ctx: HandlerCtx): void {
    const { conn, payload, now } = ctx;
    const { accountHash, rsn } = ctx.id;
    const containerLabel = typeof payload.containerLabel === "string" ? payload.containerLabel : null;
    const items: ContainerItem[] = Array.isArray(payload.items) ? payload.items : [];
    if (containerLabel === null) return;
    conn.transaction(() => {
        upsertItemsCatalog(conn, items, now);
        if (containerLabel === INVENTORY) {
            snapshotInventory({ conn, accountHash, rsn, items, now, containerKind: KIND_MAIN });
        } else if (containerLabel === EQUIPMENT) {
            snapshotEquipment({ conn, accountHash, rsn, items, now });
        } else if (containerLabel === SEED_VAULT) {
            snapshotSeedVault({ conn, accountHash, rsn, items, now });
        }
    })();
}

export function handleContainerDelta(ctx: HandlerCtx): void {
    const { conn, payload, now, envelope, id } = ctx;
    const containerLabel = typeof payload.containerLabel === "string" ? payload.containerLabel : null;
    const changes: ContainerItem[] = Array.isArray(payload.changes) ? payload.changes : [];
    const cause: ContainerCause = payload.cause;
    if (containerLabel === null || changes.length === 0) return;
    const where = extractWhere(payload);
    upsertItemsCatalog(conn, changes, now);
    dispatchContainerDelta({ conn, id, envelope, where, changes, cause, containerLabel });
}

export function handleRunePouch(ctx: HandlerCtx): void {
    const { conn, payload, now } = ctx;
    const { accountHash, rsn } = ctx.id;
    const slots: RunePouchSlot[] = Array.isArray(payload.slots) ? payload.slots : [];
    const items: ContainerItem[] = slots
        .filter((s) => typeof s.itemId === "number" && typeof s.qty === "number")
        .map((s) => ({ id: s.itemId, qty: s.qty, name: s.name, price: s.price, slot: s.slot }));
    conn.transaction(() => {
        upsertItemsCatalog(conn, items, now);
        snapshotInventory({ conn, accountHash, rsn, items, now, containerKind: KIND_RUNE_POUCH });
    })();
}
