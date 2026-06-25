import type { AiMessage } from "../../types.js";
import type { ChainEvent, FinalResult } from "./step-event-types.js";

export type { ChainEvent, FinalResult } from "./step-event-types.js";

export const KIND_CALL_LLM = "call_llm" as const;
export const KIND_DONE = "done" as const;

export interface CallLlm {
    kind: typeof KIND_CALL_LLM;
    chainId: string;
    system: string;
    messages: AiMessage[];
    events: ChainEvent[];
    nextPollSeconds: number | null;
}

export interface ChainStepDone {
    kind: typeof KIND_DONE;
    chainId: string;
    result: FinalResult;
    events: ChainEvent[];
}

export type ChainStepResult = CallLlm | ChainStepDone;
