import { pinnedContext } from "../../../memory/pinned-context.js";

export function pinnedSection(siteAccountId: string): string | null {
    const pinned = pinnedContext.list(siteAccountId);
    const pinnedContent = pinnedContext.format(siteAccountId);
    if (!pinnedContent) return null;
    return `[PROMPT: pinned-context]\n## Active Context (pinned — persists across turns, use \`unpin\` to remove)\nPinned IDs: [${pinned.join(", ")}]\n\n${pinnedContent}`;
}
