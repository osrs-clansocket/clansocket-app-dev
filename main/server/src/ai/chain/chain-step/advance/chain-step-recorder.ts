import { chainGraph } from "../../chain/index.js";
import type { SharedFinalizeInput } from "./chain-finalize-types.js";

export function recordChainStep(input: SharedFinalizeInput, learning: string): void {
    chainGraph.addStep(input.siteAccountId, {
        loadedContext: input.loadedIds,
        reads: input.readIds,
        queries: [],
        recap: input.parsedRecap ?? null,
        message: input.parsedMessage ?? "",
        learning,
    });
}
