import "../../../../../../../styles/pages/clans/manage/discord/clan-discord-page.css";
import { div, paragraph, treeView, type Instance, type ReorderEvent } from "../../../../../../factory";
import { identityStore } from "../../../../../../../state/identity/stores/identity-store.js";
import type { DiscordChannel, DiscordServer } from "../../../../../../../state/discord/client.js";
import { buildCreateToolbar } from "./create-dropdown/create-dropdown.js";
import {
    CATEGORY_TYPE,
    EMPTY_CLASS,
    EMPTY_TEXT,
    MODE_HOST_CLASS,
    TOOLBAR_CLASS,
    parseFeatures,
} from "./mode-constants.js";
import { buildTreeNodes } from "./mode-tree.js";
import {
    emptyChannelsState,
    makeLocalReorder,
    subscribeChannelsFeed,
    subscribeChannelsWebhooks,
    type ChannelsModeState,
} from "./mode-subscribe.js";
import { defineDiscordMode } from "../../registry";

function buildToolbar(
    guildId: string,
    getChannels: () => readonly DiscordChannel[],
    features: readonly string[],
): Instance {
    void identityStore.refresh();
    return div({ classes: [TOOLBAR_CLASS], context: null, meta: null }, [
        buildCreateToolbar({ guildId, getChannels, features }),
    ]);
}

interface RerenderArgs {
    guildId: string;
    state: ChannelsModeState;
    treeHost: Instance;
    empty: Instance;
    toggle: (k: string) => void;
    reorderRef: { fn: (e: ReorderEvent) => void };
}

function initializeExpanded(state: ChannelsModeState): void {
    if (state.initialized) return;
    for (const ch of state.latest) if (ch.type === CATEGORY_TYPE) state.expanded.add(ch.channel_id);
    state.initialized = true;
}

function makeChannelsRerender(a: RerenderArgs): () => void {
    const { guildId, state, treeHost, empty, toggle, reorderRef } = a;
    return () => {
        if (state.latest.length === 0) {
            treeHost.clear();
            empty.el.hidden = false;
            return;
        }
        initializeExpanded(state);
        empty.el.hidden = true;
        treeHost.setChildren(
            treeView(
                buildTreeNodes(state.latest, state.webhooksByChannel, {
                    toggle,
                    guildId,
                    treeHost,
                    expanded: state.expanded,
                    onReorder: reorderRef.fn,
                }),
            ),
        );
    };
}

function makeChannelsToggle(state: ChannelsModeState, rerender: () => void): (key: string) => void {
    return (key) => {
        if (state.expanded.has(key)) state.expanded.delete(key);
        else state.expanded.add(key);
        rerender();
    };
}

interface ChannelsWiring {
    state: ChannelsModeState;
    treeHost: Instance;
    empty: Instance;
    rerender: () => void;
    unsubscribeChannels: () => void;
    unsubscribeWebhooks: () => void;
}

function buildChannelsWiring(guildId: string): ChannelsWiring {
    const treeHost = div({ classes: [], context: null, meta: null });
    const empty = paragraph({ classes: [EMPTY_CLASS], text: EMPTY_TEXT, hidden: "", context: null, meta: null });
    const state = emptyChannelsState();
    const reorderRef: { fn: (e: ReorderEvent) => void } = { fn: () => undefined };
    const rerenderRef: { fn: () => void } = { fn: () => undefined };
    const toggle = makeChannelsToggle(state, () => rerenderRef.fn());
    const rerender = makeChannelsRerender({ guildId, state, treeHost, empty, toggle, reorderRef });
    rerenderRef.fn = rerender;
    reorderRef.fn = makeLocalReorder(guildId, state, rerender);
    return {
        state,
        treeHost,
        empty,
        rerender,
        unsubscribeChannels: subscribeChannelsFeed(guildId, state, rerender),
        unsubscribeWebhooks: subscribeChannelsWebhooks(guildId, state, rerender),
    };
}

export function buildChannelsMode(server: DiscordServer): Instance {
    const guildId = server.guild_id;
    const features = parseFeatures(server.features);
    const w = buildChannelsWiring(guildId);
    const modeHost = div({ classes: [MODE_HOST_CLASS], context: null, meta: null }, [
        buildToolbar(guildId, () => w.state.latest, features),
        w.treeHost,
        w.empty,
    ]);
    modeHost.trackDispose({
        dispose: () => {
            w.unsubscribeChannels();
            w.unsubscribeWebhooks();
        },
    });
    return modeHost;
}

defineDiscordMode({ key: "channels", label: "Channels", order: 10, build: (ctx) => buildChannelsMode(ctx.server) });
