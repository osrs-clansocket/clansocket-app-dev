import { chainGraph } from "../../../chain/chain/index.js";

export function chainJournalSection(siteAccountId: string): string | null {
    const journal = chainGraph.formatActive(siteAccountId);
    if (!journal) return null;
    return `[PROMPT: chain-journal]\n## Chain So Far (append-only journal of every turn completed in THIS chain — read before composing this turn so nothing you already established gets lost or repeated)\n${journal}`;
}
