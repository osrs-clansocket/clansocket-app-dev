import type { HistoryEntry, ProfileContext } from "../../../chain/chain-state-store.js";
import { asFiniteNumber, nonEmptyString } from "../../../../shared/coerce.js";
import type { ActionResultBody, SendKind } from "../feedback.js";

const SEND_MAX_TOKENS_DEFAULT = 4096;
const SEND_MAX_TOKENS_CEILING = 32000;
const SEND_MAX_TOKENS_FLOOR = 1;

export interface SendBody {
    text?: string;
    mode?: string;
    pageState?: Record<string, unknown> | null;
    chainMode?: string;
    kind?: SendKind;
    actionResults?: ActionResultBody[];
    priorChainId?: string;
    history?: HistoryEntry[];
    profile?: ProfileContext | null;
    personaOverrides?: Record<string, unknown> | null;
    modeOverrides?: Record<string, unknown> | null;
    lastTurn?: { raw?: unknown; userMessage?: unknown } | null;
    apiKey?: string;
    provider?: string;
    model?: string;
    maxTokens?: number;
}

export function validateSendBody(body: SendBody): string | null {
    if (nonEmptyString(body.text) === null) return "text required";
    if (nonEmptyString(body.mode) === null) return "mode required";
    if (nonEmptyString(body.apiKey) === null) return "apiKey required";
    if (nonEmptyString(body.provider) === null) return "provider required";
    if (body.maxTokens !== undefined) {
        if (asFiniteNumber(body.maxTokens) === null) return "maxTokens must be a number";
        if (body.maxTokens < SEND_MAX_TOKENS_FLOOR) return `maxTokens must be at least ${SEND_MAX_TOKENS_FLOOR}`;
        if (body.maxTokens > SEND_MAX_TOKENS_CEILING) return `maxTokens must be at most ${SEND_MAX_TOKENS_CEILING}`;
    }
    return null;
}

export function resolveMaxTokens(requested: number | undefined): number {
    if (requested === undefined) return SEND_MAX_TOKENS_DEFAULT;
    return Math.floor(requested);
}
