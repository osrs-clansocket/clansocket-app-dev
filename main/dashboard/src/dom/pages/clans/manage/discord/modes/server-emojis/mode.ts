import "../../../../../../../styles/pages/clans/manage/discord/clan-discord-page.css";
import { button, div, effect, image, paragraph, type Instance } from "../../../../../../factory";
import { reconcile } from "../../../../../../factory/live-ops/reconcile.js";
import { emojisFeed } from "../../../../../../../state/discord/server-emojis/server-emojis-feed.js";
import { selectDiscordItem } from "../../../../../../../state/discord/inspector-selection.js";
import { selectedDiscordItem } from "../../../../../../../state/discord/selected-item.js";
import type { DiscordServerEmoji } from "../../../../../../../state/discord/client.js";
import {
    DISCORD_EMOJI_GRID_CLASS,
    DISCORD_EMOJI_PANE_CLASS,
    DISCORD_EMOJI_TILE_ACTIVE_CLASS,
    DISCORD_EMOJI_TILE_CLASS,
    DISCORD_PANE_PLACEHOLDER_CLASS,
} from "../../../../../../../shared/constants/clan-manage-discord/route-constants.js";
import { subscribeTileFeed, type FeedHandle } from "../../../../../../../state/discord/tile-pane-base.js";

const EMPTY_TEXT = "No server emojis in this guild yet.";
const TILE_IMAGE_CLASS = "clans-manage__discord-emoji-tile-image";

function emojiTileChildren(emoji: DiscordServerEmoji): HTMLElement[] {
    if (emoji.image_url === null) return [];
    return [
        image({ src: emoji.image_url, alt: `:${emoji.name}:`, classes: [TILE_IMAGE_CLASS], context: null, meta: null })
            .el,
    ];
}

function buildTile(emoji: DiscordServerEmoji): Instance {
    const inst = button(
        {
            classes: [DISCORD_EMOJI_TILE_CLASS],
            ariaLabel: `:${emoji.name}:`,
            context: `select the ${emoji.name} server emoji to inspect or delete`,
            meta: ["choice", "discord", "emoji"],
            onClick: () => selectDiscordItem({ kind: "server-emoji", data: emoji }),
        },
        emojiTileChildren(emoji),
    );
    inst.trackDispose(
        effect(() => {
            const sel = selectedDiscordItem();
            const isActive = sel?.kind === "server-emoji" && sel.data.emoji_id === emoji.emoji_id;
            inst.toggleClass(DISCORD_EMOJI_TILE_ACTIVE_CLASS, isActive);
        }),
    );
    return inst;
}

function sortedByName(emojis: readonly DiscordServerEmoji[]): DiscordServerEmoji[] {
    return [...emojis].sort((a, b) => a.name.localeCompare(b.name));
}

import { defineDiscordMode } from "../../registry";

defineDiscordMode({
    key: "server-emojis",
    label: "Server Emojis",
    order: 50,
    build: (ctx) => emojisMode(ctx.server.guild_id),
});

interface EmojisPaneState {
    grid: Instance;
    empty: Instance;
    tileState: Map<string, Instance>;
    latestRef: { v: readonly DiscordServerEmoji[] };
}

function makeEmojisRerender(s: EmojisPaneState): () => void {
    return (): void => {
        if (s.latestRef.v.length === 0) {
            for (const inst of s.tileState.values()) inst.destroy();
            s.tileState.clear();
            s.grid.el.hidden = true;
            s.empty.el.hidden = false;
            return;
        }
        s.empty.el.hidden = true;
        s.grid.el.hidden = false;
        reconcile({
            container: s.grid,
            state: s.tileState,
            items: sortedByName(s.latestRef.v),
            keyOf: (e) => e.emoji_id,
            create: (e) => buildTile(e),
        });
    };
}

function subscribeEmojis(state: EmojisPaneState, guildId: string): () => void {
    const rerender = makeEmojisRerender(state);
    return subscribeTileFeed<DiscordServerEmoji>({
        rerender,
        feed: emojisFeed(guildId) as unknown as FeedHandle<DiscordServerEmoji>,
        getLatest: () => state.latestRef.v,
        setLatest: (next) => {
            state.latestRef.v = next;
        },
        keyOf: (e) => e.emoji_id,
    });
}

export function emojisMode(guildId: string): Instance {
    const grid = div({ classes: [DISCORD_EMOJI_GRID_CLASS], context: null, meta: null });
    const empty = paragraph({ classes: [DISCORD_PANE_PLACEHOLDER_CLASS], text: EMPTY_TEXT, context: null, meta: null });
    const pane = div({ classes: [DISCORD_EMOJI_PANE_CLASS], context: null, meta: null }, [grid, empty]);
    grid.el.hidden = true;
    const tileState = new Map<string, Instance>();
    const latestRef: { v: DiscordServerEmoji[] } = { v: [] };
    const state: EmojisPaneState = { grid, empty, tileState, latestRef };
    const unsubscribe = subscribeEmojis(state, guildId);
    pane.trackDispose({
        dispose: () => {
            for (const inst of state.tileState.values()) inst.destroy();
            state.tileState.clear();
            unsubscribe();
        },
    });
    return pane;
}
