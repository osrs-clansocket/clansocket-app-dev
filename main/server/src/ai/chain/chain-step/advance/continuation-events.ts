import type { ParsedResponse } from "../../response-parser/index.js";
import { chainStateStore } from "../../chain-state-store.js";
import type { ChainEvent } from "../types.js";

export function summarizeRequested(readIds: string[], queries: ParsedResponse["query"]): string[] {
    const requested: string[] = [];
    if (readIds.length > 0) requested.push(`read: ${readIds.join(", ")}`);
    if (queries.length > 0) requested.push(`query: ${queries.length} queries`);
    return requested;
}

export function emitContinuationEvents(
    events: ChainEvent[],
    newDepth: number,
    parsed: ParsedResponse,
    requested: string[],
): void {
    if (parsed.message) {
        events.push({ type: "chain", payload: { depth: newDepth, message: parsed.message } });
    }
    events.push({
        type: "continuation",
        payload: { turn: requested.join("; ") || "continuing", recap: parsed.recap },
    });
}

export function emitContinuationStatus(chainId: string, events: ChainEvent[]): void {
    const status = chainStateStore.get(chainId)?.nextStatus;
    if (status !== null && status !== undefined) {
        events.push({ type: "status", payload: { status } });
    }
}
