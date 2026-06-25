import { buildChangeEmitter } from "../change-inserter.js";
import type { HandlerCtx } from "../handler-ctx.js";
import { extractWhere, type Payload } from "../projection-utils.js";

interface PetDropFacts {
    petItemId: number | null;
    petItemName: string | null;
    trigger: string;
    message: string;
    sourceKind: string | null;
    sourceId: number | null;
    sourceName: string | null;
}

function petDropSource(payload: Payload, sourceKind: string | null): string | null {
    if (sourceKind === "PLAYER") return null;
    return typeof payload.sourceName === "string" ? payload.sourceName : null;
}

function extractFacts(payload: Payload): PetDropFacts {
    const sourceKind = typeof payload.sourceKind === "string" ? payload.sourceKind : null;
    return {
        sourceKind,
        petItemId: typeof payload.petItemId === "number" ? payload.petItemId : null,
        petItemName: typeof payload.petName === "string" ? payload.petName : null,
        trigger: typeof payload.trigger === "string" ? payload.trigger : "unknown",
        message: typeof payload.message === "string" ? payload.message : "",
        sourceId: typeof payload.sourceId === "number" ? payload.sourceId : null,
        sourceName: petDropSource(payload, sourceKind),
    };
}

const PET_DROP_COLS = ["pet_item_id", "pet_item_name", "trigger", "message", "source_kind", "source_id", "source_name"];

export function handlePetDrop(ctx: HandlerCtx): void {
    const { conn, payload, envelope, id } = ctx;
    const where = extractWhere(payload);
    const f = extractFacts(payload);
    buildChangeEmitter(conn, "plugin_pet_drops", PET_DROP_COLS).emit({
        id,
        envelope,
        where,
        dedupKind: "pet_drop",
        dedupParts: [f.petItemId ?? 0, f.trigger],
        specific: [f.petItemId, f.petItemName, f.trigger, f.message, f.sourceKind, f.sourceId, f.sourceName],
    });
}
