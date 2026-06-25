import type { ClanAuditEntry } from "../clans-client/index.js";

export function pload(entry: ClanAuditEntry, key: string): string | null {
    const v = entry.payload?.[key];
    if (typeof v === "string") return v;
    if (typeof v === "number") return String(v);
    return null;
}

export function ploadNum(entry: ClanAuditEntry, key: string): number | null {
    const v = entry.payload?.[key];
    return typeof v === "number" ? v : null;
}
