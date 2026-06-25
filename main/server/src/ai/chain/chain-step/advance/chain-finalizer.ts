import { chainGraph } from "../../chain/index.js";
import { chainStateStore } from "../../chain-state-store.js";
import { pinnedContext } from "../../../memory/pinned-context.js";
import { extractDisplayText } from "../chain-utils.js";
import type { FinalResult } from "../types.js";
import { applyModeGates } from "./apply-mode-gates.js";
import { recordChainStep } from "./chain-step-recorder.js";
import type { FinalizeOptions, SharedFinalizeInput } from "./chain-finalize-types.js";

export type { SharedFinalizeInput, FinalizeOptions } from "./chain-finalize-types.js";

export function finalizeChain(input: SharedFinalizeInput, options: FinalizeOptions): FinalResult {
    recordChainStep(input, options.learning);
    const gated = applyModeGates(input, input.modeOverrides);
    const result: FinalResult = {
        chainContinues: options.chainContinues(gated),
        message: input.parsedMessage ?? extractDisplayText(input.llmResponse),
        raw: input.llmResponse,
        actions: gated.actions,
        chainId: input.chainId,
        loadedIds: input.loadedIds,
        pinnedContext: pinnedContext.list(input.siteAccountId),
        profileContext: gated.profileContext,
        suggestedUserResponse: gated.suggestedUserResponse,
    };
    chainGraph.complete(input.siteAccountId);
    chainStateStore.delete(input.chainId);
    return result;
}
