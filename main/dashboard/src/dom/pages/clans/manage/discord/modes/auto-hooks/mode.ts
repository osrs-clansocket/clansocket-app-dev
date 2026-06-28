import "../../../../../../../styles/pages/clans/manage/discord/clan-auto-hooks-page.css";
import "../../../../../../../styles/pages/account/greeting-page.css";
import { div, paragraph, type Instance, baseProps, textProps } from "../../../../../../factory";
import { openHooksStream } from "../../../../../../../state/discord/auto-hooks/client.js";
import { ensureFieldOperatorsLoaded } from "../../../../../../../state/flows/field-operators-store.js";
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
import { trackDispose } from "./mode-dispose.js";
import { makeRefetchFn } from "../../../../../../../state/discord/auto-hooks/mode-refetch.js";
import type { ModeContext } from "../../registry";

const LOADING_TEXT = "Loading auto-hooks…";

export function autoHooksMode(guildId: string): Instance {
    const root = div(baseProps([AUTO_HOOKS_ROOT_CLASS]), [
        paragraph(textProps([DISCORD_PANE_PLACEHOLDER_CLASS], LOADING_TEXT)),
    ]);
    const state = freshState();
    const valueOps = makeValueAccess(guildId);
    const refetchRef: { fn: () => Promise<void> } = { fn: async () => undefined };
    const render = makeRenderer({ guildId, root, state, valueOps, refetchRef });
    refetchRef.fn = makeRefetchFn({ state, render, configuredStore: autoHooksStore(guildId) });
    const channels = subscribeChannelsFeed(guildId, state, render);
    const webhooks = subscribeWebhooksFeed(guildId, state, render);
    void refetchRef.fn();
    void ensureFieldOperatorsLoaded();
    const autoHooks = openHooksStream(guildId, () => void refetchRef.fn());
    const mountedRef = { v: true };
    queueMicrotask(() => {
        if (mountedRef.v) inspectorOverride$.set(() => [buildPreviewPane()]);
    });
    trackDispose(root, { channels, webhooks, autoHooks }, mountedRef);
    return root;
}

export const build = (ctx: ModeContext): Instance => autoHooksMode(ctx.server.guild_id);
