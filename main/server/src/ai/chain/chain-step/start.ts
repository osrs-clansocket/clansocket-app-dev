import logger from "@clansocket/logger";
import { ROLE_USER } from "../../persona/role-constants.js";
import { buildSystemPrompt } from "../../persona/prompt/index.js";
import type { AiMessage } from "../../types.js";
import { chainGraph } from "../chain/index.js";
import type { ChainState } from "../chain-state-store.js";
import { chainStateStore } from "../chain-state-store.js";
import { type ChainEvent, type CallLlm, KIND_CALL_LLM } from "./types.js";
import { pickDefaultStatus } from "./statuses.js";

function buildStartPrompt(state: ChainState) {
    return buildSystemPrompt({
        instruction: state.instruction,
        mode: state.mode,
        pageState: state.pageState,
        extraContextIds: state.extraContext,
        siteAccountId: state.siteAccountId,
        priorRawResponse: state.lastTurn?.raw ?? null,
        priorUserMessage: state.lastTurn?.userMessage ?? null,
        chainMode: state.chainMode,
        history: state.history,
        profile: state.profile,
        personaOverrides: state.personaOverrides,
        modeOverrides: state.modeOverrides,
    });
}

export async function startChain(state: ChainState): Promise<CallLlm> {
    const { system, loadedIds } = await buildStartPrompt(state);
    const messages: AiMessage[] = [{ role: ROLE_USER, content: `USER MESSAGE= "${state.instruction}"` }];
    chainStateStore.update(state.chainId, { loadedIds, messages });
    chainGraph.start(state.siteAccountId, state.instruction, state.mode);
    const statusEvent: ChainEvent = {
        type: "status",
        payload: { status: state.nextStatus ?? pickDefaultStatus() },
    };
    logger.info(`[ai/chain-step] start chainId=${state.chainId} depth=0 systemLen=${system.length}`);
    return {
        system,
        messages,
        kind: KIND_CALL_LLM,
        chainId: state.chainId,
        events: [statusEvent],
        nextPollSeconds: null,
    };
}
