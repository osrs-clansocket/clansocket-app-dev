import type { AiMessage } from "../../../types.js";
import type { ContinuationArgs } from "./continuation-step.js";
import { buildChainMessage } from "./continuation.js";
import { buildNextMessages, recordChainStep } from "./continuation-effects.js";
import { collectContext } from "./collect-context.js";
import { emitContinuationEvents, summarizeRequested } from "./continuation-events.js";
import type { runChainQueries } from "./run-queries.js";

export interface ContinuationState {
    args: ContinuationArgs;
    injections: string[];
    executedQueries: ReturnType<typeof runChainQueries>;
    requested: string[];
    chainMessage: string;
    newMessages: AiMessage[];
    newDepth: number;
}

export async function prepareContinuation(args: ContinuationArgs): Promise<ContinuationState> {
    const { state, parsed, readIds, queries, appendedUserInput, llmResponse, events, parsedRecap } = args;
    const { injections, executedQueries } = await collectContext(args);
    const requested = summarizeRequested(readIds, queries);
    const chainMessage = buildChainMessage(injections, requested, appendedUserInput);
    const newDepth = state.depth + 1;
    emitContinuationEvents(events, newDepth, parsed, requested);
    recordChainStep({ state, readIds, executedQueries, parsedRecap, parsed });
    const newMessages = buildNextMessages(state, llmResponse, chainMessage);
    return { args, injections, executedQueries, requested, chainMessage, newMessages, newDepth };
}
