import "../../../../../../../styles/pages/clans/manage/discord/clan-discord-page.css";
import { button, div, effect, image, paragraph, type Instance, baseProps, textProps } from "../../../../../../factory";
import { reconcile } from "../../../../../../factory/live-ops/reconcile.js";
import { stickersFeed } from "../../../../../../../state/discord/server-stickers/server-stickers-feed.js";
import { selectDiscordItem } from "../../../../../../../state/discord/inspector-selection.js";
import { selectedDiscordItem } from "../../../../../../../state/discord/selected-item.js";
import type { DiscordServerSticker } from "../../../../../../../state/discord/client.js";
import {
    DISCORD_EMOJI_GRID_CLASS,
    DISCORD_EMOJI_PANE_CLASS,
    DISCORD_EMOJI_TILE_ACTIVE_CLASS,
    DISCORD_EMOJI_TILE_CLASS,
    DISCORD_PANE_PLACEHOLDER_CLASS,
} from "../../../../../../../shared/constants/clan-manage-discord/route-constants.js";
import { subscribeTileFeed, type FeedHandle } from "../../../../../../../state/discord/tile-pane-base.js";
import type { ModeContext } from "../../registry";

const EMPTY_TEXT = "No server stickers in this guild yet.";
const TILE_IMAGE_CLASS = "clans-manage__discord-emoji-tile-image";

function stickerTileChildren(sticker: DiscordServerSticker): HTMLElement[] {
    if (sticker.image_url === null) return [];
    return [
        image({ src: sticker.image_url, alt: sticker.name, classes: [TILE_IMAGE_CLASS], context: null, meta: null }).el,
    ];
}

function buildTile(sticker: DiscordServerSticker): Instance {
    const inst = button(
        {
            classes: [DISCORD_EMOJI_TILE_CLASS],
            ariaLabel: sticker.name,
            context: `select the ${sticker.name} server sticker to inspect or delete`,
            meta: ["choice", "discord", "emoji"],
            onClick: () => selectDiscordItem({ kind: "server-sticker", data: sticker }),
        },
        stickerTileChildren(sticker),
    );
    inst.trackDispose(
        effect(() => {
            const sel = selectedDiscordItem();
            const isActive = sel?.kind === "server-sticker" && sel.data.sticker_id === sticker.sticker_id;
            inst.toggleClass(DISCORD_EMOJI_TILE_ACTIVE_CLASS, isActive);
        }),
    );
    return inst;
}

function sortedByName(stickers: readonly DiscordServerSticker[]): DiscordServerSticker[] {
    return [...stickers].sort((a, b) => a.name.localeCompare(b.name));
}

interface StickersPaneState {
    grid: Instance;
    empty: Instance;
    tileState: Map<string, Instance>;
    latestRef: { v: readonly DiscordServerSticker[] };
}

function makeStickersRerender(s: StickersPaneState): () => void {
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
            keyOf: (st) => st.sticker_id,
            create: (st) => buildTile(st),
        });
    };
}

function subscribeStickers(state: StickersPaneState, guildId: string): () => void {
    const rerender = makeStickersRerender(state);
    return subscribeTileFeed<DiscordServerSticker>({
        rerender,
        feed: stickersFeed(guildId) as unknown as FeedHandle<DiscordServerSticker>,
        getLatest: () => state.latestRef.v,
        setLatest: (next) => {
            state.latestRef.v = next;
        },
        keyOf: (st) => st.sticker_id,
    });
}

export function stickersMode(guildId: string): Instance {
    const grid = div(baseProps([DISCORD_EMOJI_GRID_CLASS]));
    const empty = paragraph(textProps([DISCORD_PANE_PLACEHOLDER_CLASS], EMPTY_TEXT));
    const pane = div(baseProps([DISCORD_EMOJI_PANE_CLASS]), [grid, empty]);
    grid.el.hidden = true;
    const tileState = new Map<string, Instance>();
    const latestRef: { v: DiscordServerSticker[] } = { v: [] };
    const state: StickersPaneState = { grid, empty, tileState, latestRef };
    const unsubscribe = subscribeStickers(state, guildId);
    pane.trackDispose({
        dispose: () => {
            for (const inst of state.tileState.values()) inst.destroy();
            state.tileState.clear();
            unsubscribe();
        },
    });
    return pane;
}

export const build = (ctx: ModeContext): Instance => stickersMode(ctx.server.guild_id);
