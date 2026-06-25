import { div, span, wireInput, type Instance } from "../../../../../../factory";
import { glassInput } from "../../../../../../forms/glass/inputs/glass-input.js";
import { emojisFeed } from "../../../../../../../state/discord/server-emojis/server-emojis-feed.js";
import type { DiscordServerEmoji } from "../../../../../../../state/discord/client.js";
import { listGuildEmojis, type DiscordEmojiEntry } from "../../../../../../../state/icons/discord-emojis-store.js";
import {
    AUTO_HOOKS_EMOJI_GRID_CLASS,
    AUTO_HOOKS_EMOJI_PICKER_CLASS,
    AUTO_HOOKS_TOKEN_CHIPS_CLASS,
} from "../../../../../../../shared/constants/clan-manage-discord/auto-hook-constants.js";
import { CLAN_MANAGE_AUTO_HOOKS_EMOJI_PICKER_VARIABLES_LABEL_CLASS } from "../../../../../../../shared/constants/clan/manage-constants.js";
import {
    buildAppCell,
    buildServerCell,
    buildEmojiCell,
    buildVariableCells,
    matchesQuery,
    UNICODE_EMOJIS,
} from "./emoji-picker-cells.js";

export interface EmojiPickerOptions {
    guildId: string;
    getTriggerType: () => string;
    onInsert: (text: string) => void;
}

interface EmojiPickerState {
    variablesRow: Instance;
    grid: Instance;
    serverRef: { v: readonly DiscordServerEmoji[] };
    appRef: { v: readonly DiscordEmojiEntry[] };
    queryRef: { v: string };
    getTriggerType: () => string;
    onInsert: (text: string) => void;
}

function makeEmojiRerender(s: EmojiPickerState): () => void {
    return (): void => {
        s.variablesRow.setChildren(...buildVariableCells(s.getTriggerType(), s.onInsert));
        const unicode = UNICODE_EMOJIS.filter((u) => matchesQuery(u.keywords + " " + u.emoji, s.queryRef.v)).map((u) =>
            buildEmojiCell(u.emoji, s.onInsert),
        );
        const serverCells = s.serverRef.v
            .filter((em) => matchesQuery(em.name, s.queryRef.v))
            .map((em) => buildServerCell(em, s.onInsert));
        const appCells = s.appRef.v
            .filter((em) => matchesQuery(em.name, s.queryRef.v))
            .map((em) => buildAppCell(em, s.onInsert));
        s.grid.setChildren(...unicode, ...appCells, ...serverCells);
    };
}

function subscribeServerEmojis(args: {
    guildId: string;
    serverRef: { v: readonly DiscordServerEmoji[] };
    rerender: () => void;
}): () => void {
    const { guildId, serverRef, rerender } = args;
    const feed = emojisFeed(guildId);
    return feed.source.subscribe(
        (snap) => {
            serverRef.v = snap.rows as DiscordServerEmoji[];
            rerender();
        },
        (batch) => {
            const byKey = new Map(serverRef.v.map((e) => [e.emoji_id, e]));
            for (const d of batch.deltas) {
                if (d.op === "upsert" && d.row) byKey.set(d.key, d.row as DiscordServerEmoji);
                else if (d.op === "remove") byKey.delete(d.key);
            }
            serverRef.v = [...byKey.values()];
            rerender();
        },
    );
}

function buildVariablesLabel(): Instance {
    const variablesLabel = span({
        classes: [CLAN_MANAGE_AUTO_HOOKS_EMOJI_PICKER_VARIABLES_LABEL_CLASS],
        text: "Variable emojis (resolve per-event)",
        context: null,
        meta: null,
    });
    variablesLabel.el.style.fontSize = "var(--fs-3xs)";
    variablesLabel.el.style.color = "var(--base-graphite-300)";
    variablesLabel.el.style.textTransform = "uppercase";
    variablesLabel.el.style.letterSpacing = "var(--ls-snug)";
    variablesLabel.el.style.paddingBlockEnd = "var(--sp-0)";
    return variablesLabel;
}

function freshPickerState(opts: EmojiPickerOptions): EmojiPickerState {
    return {
        variablesRow: div({ classes: [AUTO_HOOKS_TOKEN_CHIPS_CLASS], context: null, meta: null }),
        grid: div({ classes: [AUTO_HOOKS_EMOJI_GRID_CLASS], context: null, meta: null }),
        serverRef: { v: [] },
        appRef: { v: [] },
        queryRef: { v: "" },
        getTriggerType: opts.getTriggerType,
        onInsert: opts.onInsert,
    };
}

function buildSearchInput(state: EmojiPickerState, rerender: () => void): Instance<HTMLInputElement> {
    const searchInp = glassInput({
        placeholder: "Search emojis…",
        ariaLabel: "Search emojis",
        context: "filter the emoji grid by name or keyword",
        meta: ["input"],
    });
    wireInput(searchInp.el, () => {
        state.queryRef.v = searchInp.el.value;
        rerender();
    });
    return searchInp;
}

export function buildEmojiPicker(opts: EmojiPickerOptions): Instance {
    const state = freshPickerState(opts);
    const rerender = makeEmojiRerender(state);
    void listGuildEmojis(opts.guildId).then((list) => {
        state.appRef.v = list;
        rerender();
    });
    const unsubscribe = subscribeServerEmojis({ guildId: opts.guildId, serverRef: state.serverRef, rerender });
    const searchInp = buildSearchInput(state, rerender);
    const root = div({ classes: [AUTO_HOOKS_EMOJI_PICKER_CLASS], context: null, meta: null }, [
        buildVariablesLabel(),
        state.variablesRow,
        searchInp,
        state.grid,
    ]);
    root.trackDispose({ dispose: () => unsubscribe() });
    rerender();
    return root;
}
