import { ROLE_ASSISTANT, ROLE_USER } from "../../../persona/role-constants.js";
import { buildSystemPrompt } from "../../../persona/prompt/index.js";
import type { AiMessage } from "../../../types.js";
import { chainGraph } from "../../chain/index.js";
import type { ChainState } from "../../chain-state-store.js";
import type { ParsedResponse } from "../../response-parser/index.js";
import { runChainQueries } from "./run-queries.js";

export interface ChainStepRecord {
    state: ChainState;
    readIds: string[];
    executedQueries: ReturnType<typeof runChainQueries>;
    parsedRecap: Record<string, string> | undefined;
    parsed: ParsedResponse;
}

export function recordChainStep(r: ChainStepRecord): void {
    chainGraph.addStep(r.state.siteAccountId, {
        loadedContext: r.state.loadedIds,
        reads: r.readIds,
        queries: r.executedQueries,
        recap: r.parsedRecap ?? null,
        message: r.parsed.message ?? "",
        learning: "",
    });
}

export function buildNextMessages(state: ChainState, llmResponse: string, chainMessage: string): AiMessage[] {
    return [
        ...state.messages,
        { role: ROLE_ASSISTANT, content: llmResponse },
        { role: ROLE_USER, content: chainMessage },
    ];
}

export async function buildNextSystem(state: ChainState, nextCtx: string[]) {
    return buildSystemPrompt({
        instruction: state.instruction,
        mode: state.mode,
        pageState: state.pageState,
        extraContextIds: nextCtx,
        siteAccountId: state.siteAccountId,
        priorRawResponse: null,
        priorUserMessage: null,
        chainMode: state.chainMode,
        history: state.history,
        profile: state.profile,
        personaOverrides: state.personaOverrides,
        modeOverrides: state.modeOverrides,
    });
}
