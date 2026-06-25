import type { ClanAuditEntry } from "../clans-client/index.js";
import type { PresentedEntry } from "./presenter-types.js";

export function withCausedBy(entry: ClanAuditEntry, result: PresentedEntry): PresentedEntry {
    const causedBy = entry.payload?.causedBy;
    if (typeof causedBy !== "string" || causedBy.length === 0) return result;
    const parts = causedBy.split(".");
    const seqLabel = parts.length === 2 && parts[1]!.length > 0 ? `#${parts[1]}` : "";
    const marker = seqLabel.length > 0 ? `↳ caused by client ${seqLabel}` : "↳ caused by client";
    return {
        ...result,
        detail: result.detail.length > 0 ? `${result.detail} · ${marker}` : marker,
    };
}
