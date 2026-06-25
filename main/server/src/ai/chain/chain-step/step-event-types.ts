import type { Actions } from "../../types.js";

export interface ChainEvent {
    type: string;
    payload: Record<string, unknown>;
}

export interface FinalResult {
    message: string;
    raw: string;
    actions: Actions | null;
    chainId: string;
    chainContinues: boolean;
    loadedIds: string[];
    pinnedContext: string[];
    profileContext: Record<string, unknown> | null;
    suggestedUserResponse: string | null;
}
