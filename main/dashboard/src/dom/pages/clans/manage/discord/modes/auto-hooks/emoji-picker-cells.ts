import { BTN_VARIANT_BARE, BTN_VARIANT_CHIP, button, image, type Instance } from "../../../../../../factory";
import type { DiscordServerEmoji } from "../../../../../../../state/discord/client.js";
import { urlOf, type DiscordEmojiEntry } from "../../../../../../../state/icons/discord-emojis-store.js";
import { tokensForTrigger } from "../../../../../../../shared/constants/clan-manage-discord/token-list.js";
import { AUTO_HOOKS_EMOJI_CELL_CLASS } from "../../../../../../../shared/constants/clan-manage-discord/auto-hook-constants.js";
import { CLAN_MANAGE_AUTO_HOOKS_EMOJI_CELL_IMG_CLASS } from "../../../../../../../shared/constants/clan/manage-constants.js";

import { VARIABLE_EMOJI_EXCLUDE } from "../../../../../../../state/discord/auto-hooks/emoji-exclude.js";

export const UNICODE_EMOJIS: readonly { emoji: string; keywords: string }[] = [
    { emoji: "💰", keywords: "money loot drop coin" },
    { emoji: "🐾", keywords: "pet paw" },
    { emoji: "📈", keywords: "promote up trend" },
    { emoji: "📉", keywords: "demote down trend" },
    { emoji: "🚫", keywords: "kick ban no" },
    { emoji: "➕", keywords: "join add plus" },
    { emoji: "➖", keywords: "leave remove minus" },
    { emoji: "⭐", keywords: "level star" },
    { emoji: "📜", keywords: "quest scroll" },
    { emoji: "🏆", keywords: "achievement trophy" },
    { emoji: "📢", keywords: "broadcast loud announce" },
    { emoji: "☠️", keywords: "slayer death skull" },
    { emoji: "🗃️", keywords: "collection log" },
    { emoji: "🎖️", keywords: "combat achievement medal" },
    { emoji: "🏦", keywords: "bank" },
    { emoji: "📖", keywords: "diary book" },
    { emoji: "🗝️", keywords: "clue key" },
    { emoji: "💀", keywords: "death skull" },
    { emoji: "🎮", keywords: "actions game controller" },
    { emoji: "🌱", keywords: "farming plant seed" },
    { emoji: "🔥", keywords: "fire hot" },
    { emoji: "⚔️", keywords: "combat swords" },
    { emoji: "🛡️", keywords: "defense shield" },
    { emoji: "🏹", keywords: "range bow" },
    { emoji: "🪄", keywords: "magic wand" },
    { emoji: "💎", keywords: "gem rare" },
    { emoji: "👑", keywords: "leader crown owner" },
    { emoji: "❤️", keywords: "heart love" },
];

export function matchesQuery(haystack: string, q: string): boolean {
    if (q.length === 0) return true;
    return haystack.toLowerCase().includes(q.toLowerCase());
}

export function buildEmojiCell(emoji: string, onInsert: (text: string) => void): Instance {
    return button({
        variant: BTN_VARIANT_BARE,
        classes: [AUTO_HOOKS_EMOJI_CELL_CLASS],
        text: emoji,
        ariaLabel: `Insert ${emoji}`,
        context: `insert the ${emoji} unicode emoji`,
        meta: ["action", "input"],
        onClick: () => onInsert(emoji),
    });
}

interface ImageCellArgs {
    src: string;
    name: string;
    syntax: string;
    onInsert: (text: string) => void;
    titleAttr: string;
}

function buildImageCell(args: ImageCellArgs): Instance {
    const { src, name, syntax, onInsert, titleAttr } = args;
    const cell = button({
        variant: BTN_VARIANT_BARE,
        classes: [AUTO_HOOKS_EMOJI_CELL_CLASS],
        ariaLabel: `Insert ${titleAttr}`,
        context: `insert the ${titleAttr} emoji`,
        meta: ["action", "input"],
        onClick: () => onInsert(syntax),
    });
    cell.setChildren(
        image({ src, alt: name, classes: [CLAN_MANAGE_AUTO_HOOKS_EMOJI_CELL_IMG_CLASS], context: null, meta: null }),
    );
    cell.setAttr("title", titleAttr);
    return cell;
}

export function buildServerCell(em: DiscordServerEmoji, onInsert: (text: string) => void): Instance {
    const prefix = em.animated ? "a" : "";
    const syntax = `<${prefix}:${em.name}:${em.emoji_id}>`;
    if (em.image_url === null) {
        return button({
            variant: BTN_VARIANT_BARE,
            classes: [AUTO_HOOKS_EMOJI_CELL_CLASS],
            text: `:${em.name}:`,
            ariaLabel: `Insert :${em.name}:`,
            context: `insert the :${em.name}: server emoji`,
            meta: ["action", "input"],
            onClick: () => onInsert(syntax),
        });
    }
    return buildImageCell({ syntax, onInsert, src: em.image_url, name: em.name, titleAttr: `:${em.name}: (server)` });
}

export function buildAppCell(em: DiscordEmojiEntry, onInsert: (text: string) => void): Instance {
    const prefix = em.animated ? "a" : "";
    const syntax = `<${prefix}:${em.name}:${em.emoji_id}>`;
    return buildImageCell({ syntax, onInsert, src: urlOf(em), name: em.name, titleAttr: `:${em.name}: (bot)` });
}

export function buildVariableCells(triggerType: string, onInsert: (text: string) => void): readonly Instance[] {
    return tokensForTrigger(triggerType)
        .map((t) => ({ name: t.token.slice(1, -1), label: t.label }))
        .filter((t) => !VARIABLE_EMOJI_EXCLUDE.has(t.name))
        .map((t) => {
            const insertText = `:{${t.name}}:`;
            const btn = button({
                variant: BTN_VARIANT_CHIP,
                text: `:${t.name}:`,
                ariaLabel: `Insert variable emoji for ${t.label}`,
                context: `inserts ${insertText} which resolves per-event to an emoji whose name matches the ${t.label} field value`,
                meta: ["action", "input"],
                onClick: () => onInsert(insertText),
            });
            btn.setAttr("title", `Variable emoji: ${insertText}`);
            return btn;
        });
}
