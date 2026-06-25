import { lookupCategoryEmoji } from "../../../shared/discord/category-emoji-lookup.js";
import { registerRenderer } from "../renderer-store.js";
import { renderResult, type Renderer } from "../renderer-types.js";
import { assembleCategoryUsername } from "../username-assembly.js";

interface FarmingPatchPayload {
    regionId: number;
    varbitId: number;
    value: number;
}

const CATEGORY = "Farming";

export const renderFarmingPatch: Renderer = ({ payload, context }) => {
    const p = payload as FarmingPatchPayload;
    const username = assembleCategoryUsername({
        emoji: lookupCategoryEmoji(CATEGORY).unicode,
        category: CATEGORY,
        subject: `region ${p.regionId}`,
        clanName: context.clanName,
    });
    return renderResult({
        username,
        content: `**\`${context.rsn}\`** varbit \`${p.varbitId}\` = \`${p.value}\``,
        tokens: {
            rsn: context.rsn,
            regionId: p.regionId,
            varbitId: p.varbitId,
            value: p.value,
            clanName: context.clanName ?? "",
        },
    });
};

registerRenderer("farming_patch", renderFarmingPatch);
