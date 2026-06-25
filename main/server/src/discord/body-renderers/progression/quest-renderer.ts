import { lookupCategoryEmoji } from "../../../shared/discord/category-emoji-lookup.js";
import { registerRenderer } from "../renderer-store.js";
import { renderResult, rolloverTokens, type Renderer } from "../renderer-types.js";
import { assembleCategoryUsername } from "../username-assembly.js";

interface QuestsPayload {
    completed: number;
    total: number;
}

interface QuestCompletedPayload {
    name: string;
}

const CATEGORY_ROLLUP = "Quests";
const CATEGORY_SINGLE = "Quest";

export const renderQuests: Renderer = ({ payload, context }) => {
    const p = payload as QuestsPayload;
    const username = assembleCategoryUsername({
        emoji: lookupCategoryEmoji(CATEGORY_ROLLUP).unicode,
        category: CATEGORY_ROLLUP,
        subject: null,
        clanName: context.clanName,
    });
    return renderResult({
        username,
        content: `**\`${context.rsn}\`** \`${p.completed}/${p.total}\` finished`,
        tokens: rolloverTokens(context.rsn, p.completed, p.total, context.clanName),
    });
};

export const renderQuestCompleted: Renderer = ({ payload, context }) => {
    const p = payload as QuestCompletedPayload;
    const username = assembleCategoryUsername({
        emoji: lookupCategoryEmoji(CATEGORY_SINGLE).unicode,
        category: CATEGORY_SINGLE,
        subject: p.name,
        clanName: context.clanName,
    });
    return renderResult({
        username,
        content: `**\`${context.rsn}\`** completed`,
        tokens: { rsn: context.rsn, name: p.name, clanName: context.clanName ?? "" },
    });
};

registerRenderer("quests", renderQuests);
registerRenderer("quest_completed", renderQuestCompleted);
