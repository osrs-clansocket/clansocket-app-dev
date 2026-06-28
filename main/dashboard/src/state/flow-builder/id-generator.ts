import type { FlowMeta } from "../../dom/pages/clans/manage/flow-builder/flow-card-types.js";

export const CARD_ID_PREFIX = "card-";
export const FLOW_ID_PREFIX = "flow-";

const sequences = new Map<string, number>();

function nextWithPrefix(prefix: string): string {
    const current = sequences.get(prefix) ?? 0;
    const next = current + 1;
    sequences.set(prefix, next);
    return `${prefix}${next}`;
}

export function nextCardId(): string {
    return nextWithPrefix(CARD_ID_PREFIX);
}

export function nextFlowId(): string {
    return nextWithPrefix(FLOW_ID_PREFIX);
}

const ASCII_ZERO = 48;
const ASCII_NINE = 57;

function parsePrefixedSuffix(value: string, prefix: string): number | null {
    if (!value.startsWith(prefix)) return null;
    const rest = value.slice(prefix.length);
    if (rest.length === 0) return null;
    for (let i = 0; i < rest.length; i++) {
        const code = rest.charCodeAt(i);
        if (code < ASCII_ZERO || code > ASCII_NINE) return null;
    }
    return Number(rest);
}

function maxIdSuffix(values: Iterable<string>, prefix: string): number {
    let max = 0;
    for (const value of values) {
        const n = parsePrefixedSuffix(value, prefix);
        if (n !== null && n > max) max = n;
    }
    return max;
}

export function seedSequences(flows: readonly FlowMeta[]): void {
    const flowIds: string[] = [];
    const cardIds: string[] = [];
    for (const flow of flows) {
        flowIds.push(flow.id);
        for (const placement of flow.placements) cardIds.push(placement.config.id);
    }
    sequences.set(FLOW_ID_PREFIX, maxIdSuffix(flowIds, FLOW_ID_PREFIX));
    sequences.set(CARD_ID_PREFIX, maxIdSuffix(cardIds, CARD_ID_PREFIX));
}
