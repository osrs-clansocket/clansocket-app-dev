import { tableAfterFrom } from "../chain-utils.js";
import { pickDefaultStatus } from "../statuses.js";
import type { ChainEvent } from "../types.js";

interface DbQuery {
    db: string;
    sql: string;
    clan?: string;
}

interface ParsedSlice {
    status?: string | string[] | null;
}

function parseStatusLabels(status: string | string[] | null): string[] {
    if (Array.isArray(status)) return status;
    if (typeof status === "string" && status.length > 0) return [status];
    return [];
}

export function resolveStatusLabels(
    parsed: ParsedSlice,
    readIds: string[],
    queries: DbQuery[],
    events: ChainEvent[],
): void {
    const statusLabels = parseStatusLabels(parsed.status ?? null);
    if (statusLabels.length === 0) {
        for (const q of queries) {
            const table = tableAfterFrom(q.sql) ?? q.db;
            statusLabels.push(`Querying ${table}`);
        }
        for (const id of readIds) statusLabels.push(`Loading ${id}`);
    }
    if (statusLabels.length === 0) statusLabels.push(pickDefaultStatus());
    for (const label of statusLabels) events.push({ type: "status", payload: { status: label } });
}

export function buildChainMessage(injections: string[], requested: string[], appendedUserInput: string[]): string {
    const appendedBlock =
        appendedUserInput.length > 0
            ? `\n\n[USER APPENDED MID-CHAIN — do NOT halt; stay in chain, respond inline via \`message\`, keep reasoning]\n` +
              appendedUserInput.map((t) => `USER: "${t}"`).join("\n")
            : "";
    const body =
        injections.length > 0
            ? `[CHAIN TURN — ${requested.join("; ")}]\n\n${injections.join("\n\n---\n\n")}\n\nContinue your reasoning with this context. Your previous response and recap are above.`
            : `[CHAIN TURN — continuing]\n\nYour previous response and recap are above. Continue your reasoning.`;
    return body + appendedBlock;
}
