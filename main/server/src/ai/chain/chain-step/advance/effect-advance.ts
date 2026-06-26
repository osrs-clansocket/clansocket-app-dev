import type { ParsedResponse } from "../../response-parser/index.js";
import { chainStateStore, type ChainState } from "../../chain-state-store.js";
import { incomingQueue } from "../../../lifecycle/incoming-queue.js";
import type { ChainEvent } from "../types.js";
import { applyMemoryOps, applyPinUnpin } from "./pin-ops.js";
import { pickEmittedStatus } from "./predicate-advance.js";

export function applySideEffects(
    parsed: ParsedResponse,
    state: ChainState,
    events: ChainEvent[],
    chainId: string,
): string[] {
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
