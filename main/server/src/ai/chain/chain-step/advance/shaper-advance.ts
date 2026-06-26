import { parseResponse } from "../../response-parser/index.js";
import type { ChainState } from "../../chain-state-store.js";
import type { ChainEvent } from "../types.js";
import { applySideEffects } from "./effect-advance.js";
import type { AdvanceContext, ResultArgs } from "./advance-types.js";

export function abortResultArgs(r: ResultArgs) {
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

export function completionResultArgs(r: ResultArgs) {
    return { ...abortResultArgs(r), parsedChain: r.parsed.chain === true };
}

export function buildAdvanceContext(
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

export function buildResultArgs(chainId: string, llmResponse: string, c: AdvanceContext): ResultArgs {
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
