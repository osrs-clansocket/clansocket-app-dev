import "../../../../../../../styles/pages/clans/manage/discord/clan-discord-page.css";
import { button, div, effect, paragraph, type Instance, baseProps, textProps } from "../../../../../../factory";
import { discordEmoji } from "../../../../../../factory/data-ops/discord/emoji-tag.js";
import { ensureLoaded, listNames } from "../../../../../../../state/icons/discord-emojis-store.js";
import { selectedEmojiName } from "../../../../../../../state/discord/selected-emoji.js";
import { selectDiscordEmoji } from "../../../../../../../state/discord/inspector-selection.js";
import {
    DISCORD_EMOJI_GRID_CLASS,
    DISCORD_EMOJI_PANE_CLASS,
    DISCORD_EMOJI_TILE_ACTIVE_CLASS,
    DISCORD_EMOJI_TILE_CLASS,
    DISCORD_PANE_PLACEHOLDER_CLASS,
} from "../../../../../../../shared/constants/clan-manage-discord/route-constants.js";
import type { ModeContext } from "../../registry";

const LOADING_TEXT = "Loading emojis…";
const EMPTY_TEXT = "No emojis found for this bot.";

function buildTile(name: string, tiles: Instance[]): Instance {
    const inst = button(
        {
            classes: [DISCORD_EMOJI_TILE_CLASS],
            ariaLabel: `:${name}:`,
            context: `select the ${name} emoji to inspect its discord syntax`,
            meta: ["choice", "discord", "emoji"],
            onClick: () => selectDiscordEmoji(name),
        },
        [discordEmoji({ name, context: null, meta: null }).el],
    );
    inst.trackDispose(
        effect(() => {
            inst.toggleClass(DISCORD_EMOJI_TILE_ACTIVE_CLASS, selectedEmojiName() === name);
        }),
    );
    tiles.push(inst);
    return inst;
}

function buildLoadingNode(): Instance {
    return paragraph(textProps([DISCORD_PANE_PLACEHOLDER_CLASS], LOADING_TEXT));
}

function buildEmptyNode(): Instance {
    return paragraph(textProps([DISCORD_PANE_PLACEHOLDER_CLASS], EMPTY_TEXT));
}

function buildGridNode(names: readonly string[], tiles: Instance[]): Instance {
    return div(
        { classes: [DISCORD_EMOJI_GRID_CLASS], context: null, meta: null },
        names.map((n) => buildTile(n, tiles)),
    );
}

function disposeTiles(tiles: Instance[]): void {
    for (const t of tiles) t.destroy();
    tiles.length = 0;
}

function renderNames(pane: Instance, names: readonly string[], tiles: Instance[]): void {
    disposeTiles(tiles);
    if (names.length === 0) {
        pane.setChildren(buildEmptyNode());
        return;
    }
    pane.setChildren(buildGridNode(names, tiles));
}

export function buildEmojisMode(): Instance {
    const tiles: Instance[] = [];
    const pane = div(baseProps([DISCORD_EMOJI_PANE_CLASS]), [buildLoadingNode()]);
    pane.trackDispose({ dispose: () => disposeTiles(tiles) });
    void ensureLoaded().then(() => {
        renderNames(pane, listNames(), tiles);
    });
    return pane;
}

export const build = (_ctx: ModeContext): Instance => buildEmojisMode();
