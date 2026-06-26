import type { DbQuery, ParsedResponse } from "../../response-parser/index.js";
import type { ChainState } from "../../chain-state-store.js";
import type { ChainEvent } from "../types.js";

export interface ResultArgs {
    chainId: string;
    state: ChainState;
    parsed: ParsedResponse;
    parsedRecap: Record<string, string> | undefined;
    parsedProfileContext: Record<string, unknown> | null;
    readIds: string[];
    llmResponse: string;
}

export interface ContinuationSignals {
    parsed: ParsedResponse;
    appendedUserInput: string[];
    readIds: string[];
    queries: DbQuery[];
    nextCtx: string[];
}

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

export interface AdvanceContext {
    chainId: string;
    state: ChainState;
    parsed: ParsedResponse;
    parsedRecap: Record<string, string> | undefined;
    parsedProfileContext: Record<string, unknown> | null;
    appendedUserInput: string[];
    readIds: string[];
    queries: DbQuery[];
    nextCtx: string[];
    llmResponse: string;
    events: ChainEvent[];
}
