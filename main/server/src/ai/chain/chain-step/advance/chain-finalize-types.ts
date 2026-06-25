import type { Actions } from "../../../types.js";
import type { applyModeGates } from "./apply-mode-gates.js";

export interface SharedFinalizeInput {
    chainId: string;
    siteAccountId: string;
    loadedIds: string[];
    parsedMessage: string | null | undefined;
    parsedActions: Actions | null;
    parsedRecap: Record<string, string> | undefined;
    parsedProfileContext: Record<string, unknown> | null;
    parsedSuggestedUserResponse: string | null;
    readIds: string[];
    llmResponse: string;
    modeOverrides?: Record<string, boolean>;
}

export interface FinalizeOptions {
    learning: string;
    chainContinues: (gated: ReturnType<typeof applyModeGates>) => boolean;
}
