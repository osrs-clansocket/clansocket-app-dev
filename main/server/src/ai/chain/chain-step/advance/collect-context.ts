import type { ContinuationArgs } from "./advance-types.js";
import { resolveStatusLabels } from "./continuation.js";
import { loadReadContext } from "./load-reads.js";
import { runChainQueries } from "./run-queries.js";

export async function collectContext(
    args: ContinuationArgs,
): Promise<{ injections: string[]; executedQueries: ReturnType<typeof runChainQueries> }> {
    const { state, parsed, readIds, queries, events } = args;
    resolveStatusLabels(parsed, readIds, queries, events);
    const injections: string[] = [];
    await loadReadContext(
        { readIds, siteAccountId: state.siteAccountId, pageState: state.pageState, history: state.history },
        injections,
        events,
    );
    const executedQueries = runChainQueries({
        queries,
        injections,
        events,
        siteAccountId: state.siteAccountId,
        modeOverrides: state.modeOverrides,
    });
    return { injections, executedQueries };
}
