import type { FinalResult } from "../types.js";
import { finalizeChain, type SharedFinalizeInput } from "./chain-finalizer.js";

export { buildCompletionResult } from "./build-completion-result.js";
export type { CompletionInput } from "./build-completion-result.js";

export type AbortInput = SharedFinalizeInput;

export function buildAbortResult(input: AbortInput): FinalResult {
    return finalizeChain(input, {
        learning: "aborted",
        chainContinues: () => false,
    });
}
