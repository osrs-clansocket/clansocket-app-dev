import { lookupCategoryEmoji } from "../../../shared/discord/category-emoji-lookup.js";
import { registerRenderer } from "../renderer-store.js";
import { renderResult, type Renderer } from "../renderer-types.js";
import { rolloverTokens } from "../shaper-rollover-tokens.js";
import { assembleCategoryUsername } from "../username-assembly.js";

interface DiariesPayload {
    completed: number;
    total: number;
}

interface DiaryCompletedPayload {
    region: string;
    tier: string;
}

const CATEGORY_ROLLUP = "Diaries";
const CATEGORY_SINGLE = "Diary";

function titleCase(s: string): string {
    if (s.length === 0) return s;
    return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

export const renderDiaries: Renderer = ({ payload, context }) => {
    const p = payload as DiariesPayload;
    const username = assembleCategoryUsername({
        emoji: lookupCategoryEmoji(CATEGORY_ROLLUP).unicode,
        category: CATEGORY_ROLLUP,
        subject: null,
        clanName: context.clanName,
    });
    return renderResult({
        username,
        content: `**\`${context.rsn}\`** \`${p.completed}/${p.total}\` complete`,
        tokens: rolloverTokens(context.rsn, p.completed, p.total, context.clanName),
    });
};

export const renderDiaryCompleted: Renderer = ({ payload, context }) => {
    const p = payload as DiaryCompletedPayload;
    const subject = `${titleCase(p.region)} ${titleCase(p.tier)}`;
    const username = assembleCategoryUsername({
        subject,
        emoji: lookupCategoryEmoji(CATEGORY_SINGLE).unicode,
        category: CATEGORY_SINGLE,
        clanName: context.clanName,
    });
    return renderResult({
        username,
        content: `**\`${context.rsn}\`** completed`,
        tokens: { rsn: context.rsn, region: p.region, tier: p.tier, clanName: context.clanName ?? "" },
    });
};

registerRenderer("diaries", renderDiaries);
registerRenderer("diary_completed", renderDiaryCompleted);
