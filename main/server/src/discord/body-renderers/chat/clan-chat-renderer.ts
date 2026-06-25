import { lookupCategoryEmoji } from "../../../shared/discord/category-emoji-lookup.js";
import { registerRenderer } from "../renderer-store.js";
import { renderResult, type Renderer } from "../renderer-types.js";
import { assembleUsername } from "../username-assembly.js";

interface ClanChatPayload {
    rank?: string | null;
    message: string;
}

export const renderClanChat: Renderer = ({ payload, context }) => {
    const p = payload as ClanChatPayload;
    const emojiHit = lookupCategoryEmoji(context.rsn);
    const username = assembleUsername({
        emoji: emojiHit.unicode,
        rsn: context.rsn,
        rank: p.rank ?? null,
        clanName: context.clanName,
    });
    return renderResult({
        username,
        content: p.message,
        tokens: {
            rsn: context.rsn,
            rank: p.rank ?? "",
            message: p.message,
            clanName: context.clanName ?? "",
        },
    });
};

registerRenderer("clan_chat", renderClanChat);
