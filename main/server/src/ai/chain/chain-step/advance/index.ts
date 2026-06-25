import logger from "@clansocket/logger";

import { parseResponse, type DbQuery, type ParsedResponse } from "../../response-parser/index.js";
import { chainGraph } from "../../chain/index.js";
import { incomingQueue } from "../../../lifecycle/incoming-queue.js";
import { chainStateStore, type ChainState } from "../../chain-state-store.js";
import { KIND_DONE, type ChainEvent, type ChainStepResult } from "../types.js";
import { runContinuation } from "./continuation-step.js";
import { buildAbortResult, buildCompletionResult } from "./final-results.js";
import { applyMemoryOps, applyPinUnpin } from "./pin-ops.js";

function pickEmittedStatus(status: unknown): string | null {
    if (Array.isArray(status)) return (status[0] as string | undefined) ?? null;
    if (typeof status === "string") return status;
    return null;
}

function applySideEffects(parsed: ParsedResponse, state: ChainState, events: ChainEvent[], chainId: string): string[] {
    const emittedStatus = pickEmittedStatus(parsed.status);
    if (emittedStatus && emittedStatus.trim().length > 0) {
        chainStateStore.update(chainId, { nextStatus: emittedStatus });
    }
    applyMemoryOps(parsed, state.siteAccountId, events, state.modeOverrides);
    applyPinUnpin(parsed, state.siteAccountId, events, state.modeOverrides);
    const appendedUserInput = incomingQueue.drain(state.siteAccountId);
    for (const text of appendedUserInput) events.push({ type: "append", payload: { text } });
    return appendedUserInput;
}

interface ResultArgs {
    chainId: string;
    state: ChainState;
    parsed: ParsedResponse;
    parsedRecap: Record<string, string> | undefined;
    parsedProfileContext: Record<string, unknown> | null;
    readIds: string[];
    llmResponse: string;
}

function abortResultArgs(r: ResultArgs) {
    return {
        chainId: r.chainId,
        parsedRecap: r.parsedRecap,
        parsedProfileContext: r.parsedProfileContext,
        readIds: r.readIds,
        llmResponse: r.llmResponse,
        siteAccountId: r.state.siteAccountId,
        loadedIds: r.state.loadedIds,
        parsedMessage: r.parsed.message,
        parsedActions: r.parsed.actions,
        parsedSuggestedUserResponse: r.parsed.suggested_user_response,
        modeOverrides: r.state.modeOverrides,
    };
}

function completionResultArgs(r: ResultArgs) {
    return { ...abortResultArgs(r), parsedChain: r.parsed.chain === true };
}

function hasActions(parsed: ParsedResponse): boolean {
    return parsed.actions !== null && parsed.actions !== undefined && Object.keys(parsed.actions).length > 0;
}

interface ContinuationSignals {
    parsed: ParsedResponse;
    appendedUserInput: string[];
    readIds: string[];
    queries: DbQuery[];
    nextCtx: string[];
}

function wantsContinuation(s: ContinuationSignals): boolean {
    const wantsChain = s.parsed.chain === true || s.appendedUserInput.length > 0;
    return wantsChain || s.readIds.length > 0 || s.queries.length > 0 || s.nextCtx.length > 0;
}

interface AdvanceContext {
    chainId: string;
    state: ChainState;
    parsed: ParsedResponse;
    parsedRecap: Record<string, string> | undefined;
    parsedProfileContext: Record<string, unknown> | null;
    appendedUserInput: string[];
    readIds: string[];
    queries: DbQuery[];
    nextCtx: string[];
    llmResponse: string;
    events: ChainEvent[];
}

function buildAdvanceContext(
    chainId: string,
    llmResponse: string,
    state: ChainState,
    events: ChainEvent[],
): AdvanceContext {
    const parsed = parseResponse(llmResponse);
    const appendedUserInput = applySideEffects(parsed, state, events, chainId);
    return {
        chainId,
        state,
        parsed,
        events,
        llmResponse,
        appendedUserInput,
        parsedRecap: (parsed.recap as Record<string, string> | undefined) ?? undefined,
        parsedProfileContext: (parsed.profile_context as Record<string, unknown> | null) ?? null,
        readIds: parsed.read ?? [],
        queries: parsed.query ?? [],
        nextCtx: parsed.next_context ?? [],
    };
}

function buildResultArgs(chainId: string, llmResponse: string, c: AdvanceContext): ResultArgs {
    return {
        chainId,
        llmResponse,
        state: c.state,
        parsed: c.parsed,
        parsedRecap: c.parsedRecap,
        parsedProfileContext: c.parsedProfileContext,
        readIds: c.readIds,
    };
}

function shouldContinue(c: AdvanceContext): boolean {
    const { parsed, appendedUserInput, readIds, queries, nextCtx } = c;
    return wantsContinuation({ parsed, appendedUserInput, readIds, queries, nextCtx }) && !hasActions(parsed);
}

export async function advanceChain(chainId: string, llmResponse: string): Promise<ChainStepResult> {
    const state = chainStateStore.get(chainId);
    if (!state) throw new Error(`chain not found: ${chainId}`);
    const events: ChainEvent[] = [];
    const c = buildAdvanceContext(chainId, llmResponse, state, events);
    const resultArgs = buildResultArgs(chainId, llmResponse, c);
    if (chainGraph.isAborted(state.siteAccountId)) {
        return { chainId, events, kind: KIND_DONE, result: buildAbortResult(abortResultArgs(resultArgs)) };
    }
    if (shouldContinue(c)) return runContinuation(c);
    logger.info(`[ai/chain-step] done chainId=${chainId} depth=${state.depth}`);
    return { chainId, events, kind: KIND_DONE, result: buildCompletionResult(completionResultArgs(resultArgs)) };
}
