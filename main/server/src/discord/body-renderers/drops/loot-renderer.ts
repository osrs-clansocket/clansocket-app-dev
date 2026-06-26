import { lookupCategoryEmoji } from "../../../shared/discord/category-emoji-lookup.js";
import { registerRenderer } from "../renderer-store.js";
import { renderResult, type Renderer } from "../renderer-types.js";
import { assembleCategoryUsername } from "../username-assembly.js";

interface LootItem {
    name: string;
    qty: number;
}

interface LootPayload {
    source: string;
    sourceLevel?: number | null;
    kc?: number | null;
    gp?: number | null;
    items: LootItem[];
}

const CATEGORY = "Loot";

function formatLootItems(items: readonly LootItem[]): string {
    return items.map((it) => (it.qty > 1 ? `${it.name} × ${it.qty}` : it.name)).join(", ");
}

const GP_THRESHOLD_BILLION = 1_000_000_000;
const GP_THRESHOLD_MILLION = 1_000_000;
const GP_THRESHOLD_THOUSAND = 1_000;
const GP_SHORT_PRECISION = 2;

const GP_UNITS: readonly [number, string][] = [
    [GP_THRESHOLD_BILLION, "B"],
    [GP_THRESHOLD_MILLION, "M"],
    [GP_THRESHOLD_THOUSAND, "K"],
];

function formatGp(gp: number | null | undefined): string {
    return gp == null ? "" : gp.toLocaleString("en-US");
}

function formatGpShort(gp: number | null | undefined): string {
    if (gp == null) return "";
    for (const [threshold, suffix] of GP_UNITS) {
        if (gp >= threshold) return `${(gp / threshold).toFixed(GP_SHORT_PRECISION)}${suffix}`;
    }
    return String(gp);
}

function buildLootSubject(p: LootPayload): string {
    return p.sourceLevel == null ? p.source : `${p.source} - Lvl ${p.sourceLevel}`;
}

function buildLootContent(rsn: string, p: LootPayload, itemsText: string, gpText: string): string {
    const parts: string[] = [`**\`${rsn}\`** received ${itemsText}`];
    if (gpText.length > 0) parts.push(`Worth **\`${gpText} gp\`**`);
    if (p.kc != null) parts.push(`**\`[KC ${p.kc}]\`**`);
    return parts.join(" - ");
}

interface LootTokenArgs {
    p: LootPayload;
    context: { rsn: string; clanName: string | null };
    itemsText: string;
    gpText: string;
    gpShortText: string;
}

function buildLootTokens(a: LootTokenArgs) {
    return {
        rsn: a.context.rsn,
        source: a.p.source,
        sourceLevel: a.p.sourceLevel ?? "",
        kc: a.p.kc ?? "",
        gp: a.gpText,
        gpShort: a.gpShortText,
        items: a.itemsText,
        clanName: a.context.clanName ?? "",
    };
}

export const renderLoot: Renderer = ({ payload, context }) => {
    const p = payload as LootPayload;
    const username = assembleCategoryUsername({
        emoji: lookupCategoryEmoji(CATEGORY).unicode,
        category: CATEGORY,
        subject: buildLootSubject(p),
        clanName: context.clanName,
    });
    const itemsText = formatLootItems(p.items);
    const gpText = formatGp(p.gp);
    const gpShortText = formatGpShort(p.gp);
    return renderResult({
        username,
        content: buildLootContent(context.rsn, p, itemsText, gpText),
        tokens: buildLootTokens({ p, context, itemsText, gpText, gpShortText }),
    });
};

registerRenderer("loot", renderLoot);
