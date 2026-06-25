import logger from "@clansocket/logger";
import type { AiMessage } from "../../../types.js";
import type { ParsedResponse } from "../../response-parser/index.js";
import { chainStateStore, type ChainState } from "../../chain-state-store.js";
import { KIND_CALL_LLM, type ChainEvent, type ChainStepResult } from "../types.js";
import { buildNextSystem } from "./continuation-effects.js";
import { emitContinuationStatus } from "./continuation-events.js";
import { prepareContinuation } from "./prepare-continuation.js";

export interface ContinuationArgs {
    chainId: string;
    state: ChainState;
    parsed: ParsedResponse;
    parsedRecap: Record<string, string> | undefined;
    readIds: string[];
    queries: ParsedResponse["query"];
    nextCtx: string[];
    appendedUserInput: string[];
    llmResponse: string;
    events: ChainEvent[];
}

interface ContinuationResult {
    chainId: string;
    events: ChainEvent[];
    system: string;
    messages: AiMessage[];
    nextPollSeconds: number | null;
}

function buildContinuationResult(r: ContinuationResult): ChainStepResult {
    return { ...r, kind: KIND_CALL_LLM };
}

export async function runContinuation(args: ContinuationArgs): Promise<ChainStepResult> {
    const { chainId, events, parsed, nextCtx } = args;
    const c = await prepareContinuation(args);
    const next = await buildNextSystem(args.state, nextCtx);
    chainStateStore.update(chainId, {
        messages: c.newMessages,
        depth: c.newDepth,
        loadedIds: next.loadedIds,
        extraContext: nextCtx,
    });
    logger.info(`[ai/chain-step] continuation chainId=${chainId} depth=${c.newDepth} systemLen=${next.system.length}`);
    emitContinuationStatus(chainId, events);
    return buildContinuationResult({
        chainId,
        events,
        system: next.system,
        messages: c.newMessages,
        nextPollSeconds: parsed.next_poll_seconds,
    });
}
