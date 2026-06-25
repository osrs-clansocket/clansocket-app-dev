import "../../../../../../../styles/pages/clans/manage/discord/clan-auto-hooks-page.css";
import "../../../../../../../styles/pages/account/greeting-page.css";
import { div, paragraph, type Instance } from "../../../../../../factory";
import { openHooksStream } from "../../../../../../../state/discord/auto-hooks/client.js";
import { inspectorOverride$ } from "../../../../../../../state/discord/inspector-override.js";
import { autoHooksStore } from "../../../../../../../state/discord/auto-hooks/configured-store.js";
import { buildPreviewPane } from "./preview/preview-pane.js";
import {
    freshState,
    subscribeChannelsFeed,
    subscribeWebhooksFeed,
} from "../../../../../../../state/discord/auto-hooks/mode-feeds.js";
import { makeRenderer, makeValueAccess } from "./mode-renderer.js";
import { AUTO_HOOKS_ROOT_CLASS } from "../../../../../../../shared/constants/clan-manage-discord/auto-hook-constants.js";
import { DISCORD_PANE_PLACEHOLDER_CLASS } from "../../../../../../../shared/constants/clan-manage-discord/route-constants.js";
import { defineDiscordMode } from "../../registry";
import { trackDispose } from "./mode-dispose.js";
import { makeRefetchFn } from "../../../../../../../state/discord/auto-hooks/mode-refetch.js";

const LOADING_TEXT = "Loading auto-hooks…";

defineDiscordMode({
    key: "auto-hooks",
    label: "Auto-Hooks",
    order: 100,
    build: (ctx) => autoHooksMode(ctx.server.guild_id),
});

export function autoHooksMode(guildId: string): Instance {
    const root = div({ classes: [AUTO_HOOKS_ROOT_CLASS], context: null, meta: null }, [
        paragraph({ classes: [DISCORD_PANE_PLACEHOLDER_CLASS], text: LOADING_TEXT, context: null, meta: null }),
    ]);
    const state = freshState();
    const valueOps = makeValueAccess(guildId);
    const refetchRef: { fn: () => Promise<void> } = { fn: async () => undefined };
    const render = makeRenderer({ guildId, root, state, valueOps, refetchRef });
    refetchRef.fn = makeRefetchFn({ state, render, configuredStore: autoHooksStore(guildId) });
    const channels = subscribeChannelsFeed(guildId, state, render);
    const webhooks = subscribeWebhooksFeed(guildId, state, render);
    void refetchRef.fn();
    const autoHooks = openHooksStream(guildId, () => void refetchRef.fn());
    const mountedRef = { v: true };
    queueMicrotask(() => {
        if (mountedRef.v) inspectorOverride$.set(() => [buildPreviewPane()]);
    });
    trackDispose(root, { channels, webhooks, autoHooks }, mountedRef);
    return root;
}
