import type { FinalResult } from "../types.js";
import { finalizeChain, type SharedFinalizeInput } from "./chain-finalizer.js";

export interface CompletionInput extends SharedFinalizeInput {
    parsedChain: boolean;
}

export function buildCompletionResult(input: CompletionInput): FinalResult {
    return finalizeChain(input, {
        learning: "",
        chainContinues: (gated) =>
            input.parsedChain === true && gated.actions !== null && Object.keys(gated.actions).length > 0,
    });
}
