import logger from "@clansocket/logger";

import { chainGraph } from "../../chain/index.js";
import { chainStateStore } from "../../chain-state-store.js";
import { KIND_DONE, type ChainEvent, type ChainStepResult } from "../types.js";
import { runContinuation } from "./continuation-step.js";
import { buildAbortResult, buildCompletionResult } from "./final-results.js";
import { abortResultArgs, buildAdvanceContext, buildResultArgs, completionResultArgs } from "./shaper-advance.js";
import { shouldContinue } from "./predicate-advance.js";

const doneStep = (chainId: string, events: ChainEvent[], result: unknown): ChainStepResult =>
    ({ chainId, events, result, kind: KIND_DONE }) as ChainStepResult;

export async function advanceChain(chainId: string, llmResponse: string): Promise<ChainStepResult> {
    const state = chainStateStore.get(chainId);
    if (!state) throw new Error(`chain not found: ${chainId}`);
    const events: ChainEvent[] = [];
    const c = buildAdvanceContext(chainId, llmResponse, state, events);
    const resultArgs = buildResultArgs(chainId, llmResponse, c);
    if (chainGraph.isAborted(state.siteAccountId)) {
        return doneStep(chainId, events, buildAbortResult(abortResultArgs(resultArgs)));
    }
    if (shouldContinue(c)) return runContinuation(c);
    logger.info(`[ai/chain-step] done chainId=${chainId} depth=${state.depth}`);
    return doneStep(chainId, events, buildCompletionResult(completionResultArgs(resultArgs)));
}
