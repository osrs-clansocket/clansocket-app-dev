import { lookupCategoryEmoji } from "../../../shared/discord/category-emoji-lookup.js";
import { registerRenderer } from "../renderer-store.js";
import { renderResult, type Renderer } from "../renderer-types.js";
import { assembleCategoryUsername } from "../username-assembly.js";

interface CollectionEntryPayload {
    itemName: string;
    itemId?: number;
    wikiLink?: string;
}

interface CollectionSnapshotPayload {
    itemCount: number;
}

const CATEGORY = "Collection";

function buildWikiLink(name: string, explicit: string | undefined): string {
    if (explicit !== undefined && explicit.length > 0) return explicit;
    const encoded = encodeURIComponent(name.split(" ").join("_"));
    return `https://oldschool.runescape.wiki/w/${encoded}`;
}

export const renderCollectionLog: Renderer = ({ payload, context }) => {
    const p = payload as CollectionEntryPayload;
    const username = assembleCategoryUsername({
        emoji: lookupCategoryEmoji(CATEGORY).unicode,
        category: CATEGORY,
        subject: null,
        clanName: context.clanName,
    });
    const link = buildWikiLink(p.itemName, p.wikiLink);
    return renderResult({
        username,
        content: `**\`${context.rsn}\`** unlocked **[${p.itemName}](${link})**`,
        tokens: { rsn: context.rsn, itemName: p.itemName, wikiLink: link, clanName: context.clanName ?? "" },
    });
};

export const renderLogSnapshot: Renderer = ({ payload, context }) => {
    const p = payload as CollectionSnapshotPayload;
    const username = assembleCategoryUsername({
        emoji: lookupCategoryEmoji(CATEGORY).unicode,
        category: CATEGORY,
        subject: null,
        clanName: context.clanName,
    });
    return renderResult({
        username,
        content: `**\`${context.rsn}\`** \`${p.itemCount}\` items unlocked`,
        tokens: { rsn: context.rsn, itemCount: p.itemCount, clanName: context.clanName ?? "" },
    });
};

registerRenderer("collection_log_entry", renderCollectionLog);
registerRenderer("collection_log_snapshot", renderLogSnapshot);
