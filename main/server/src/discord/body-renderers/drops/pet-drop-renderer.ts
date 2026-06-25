import { lookupCategoryEmoji } from "../../../shared/discord/category-emoji-lookup.js";
import { registerRenderer } from "../renderer-store.js";
import { renderResult, type Renderer } from "../renderer-types.js";
import { assembleCategoryUsername } from "../username-assembly.js";

interface PetDropPayload {
    petName: string;
    trigger?: string | null;
    petItemId?: number | null;
}

const CATEGORY = "Pet";

export const renderPetDrop: Renderer = ({ payload, context }) => {
    const p = payload as PetDropPayload;
    const username = assembleCategoryUsername({
        emoji: lookupCategoryEmoji(CATEGORY).unicode,
        category: CATEGORY,
        subject: p.petName,
        clanName: context.clanName,
    });
    const trigger = p.trigger ?? "drop";
    return renderResult({
        username,
        content: `**\`${context.rsn}\`** got a pet (**\`${trigger}\`**)`,
        tokens: {
            trigger,
            rsn: context.rsn,
            petName: p.petName,
            petItemId: p.petItemId ?? "",
            clanName: context.clanName ?? "",
        },
    });
};

registerRenderer("pet_drop", renderPetDrop);
