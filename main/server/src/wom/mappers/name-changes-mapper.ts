import { tryParseIso as parseIsoMs } from "../../shared/time/index.js";
import { lookupOrFallback } from "./lookup-mapper.js";

export type NameChangeStatus = "pending" | "approved" | "denied" | "unknown";

interface NameChangeRaw {
    id?: number;
    playerId?: number;
    oldName?: string;
    newName?: string;
    status?: string;
    resolvedAt?: string | null;
}

export type NameChangesResponse = readonly NameChangeRaw[];

export interface MappedNameChange {
    womChangeId: number;
    womPlayerId: number;
    oldRsn: string;
    newRsn: string;
    status: NameChangeStatus;
    resolvedAtMs: number | null;
}

const STATUS_LOOKUP: Record<string, NameChangeStatus> = {
    pending: "pending",
    approved: "approved",
    denied: "denied",
};

const mapStatus = (raw: string | undefined): NameChangeStatus => lookupOrFallback(raw, STATUS_LOOKUP, "unknown");

function tryMap(entry: NameChangeRaw): MappedNameChange | null {
    if (typeof entry.id !== "number" || typeof entry.playerId !== "number") return null;
    if (typeof entry.oldName !== "string" || typeof entry.newName !== "string") return null;
    return {
        womChangeId: entry.id,
        womPlayerId: entry.playerId,
        oldRsn: entry.oldName,
        newRsn: entry.newName,
        status: mapStatus(entry.status),
        resolvedAtMs: parseIsoMs(entry.resolvedAt),
    };
}

export function mapChanges(response: NameChangesResponse): MappedNameChange[] {
    const out: MappedNameChange[] = [];
    for (const entry of response) {
        const mapped = tryMap(entry);
        if (mapped !== null) out.push(mapped);
    }
    return out;
}
