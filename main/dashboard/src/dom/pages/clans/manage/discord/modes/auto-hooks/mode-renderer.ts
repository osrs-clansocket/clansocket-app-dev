import { paragraph, type Instance } from "../../../../../../factory";
import type { SelectOption } from "../../../../../../forms/glass/inputs/select/index.js";
import { type DiscordChannel } from "../../../../../../../state/discord/client.js";
import { valueOptionsFactory } from "../../../../../../../state/discord/auto-hooks/stores/value-options-store.js";
import { buildCallbacks } from "../../../../../../../state/discord/auto-hooks/mode-callbacks.js";
import { hooksList } from "./list.js";
import { autoHookFlow } from "./create-flow.js";
import { buildTriggerOptions } from "../../../../../../../state/discord/auto-hooks/trigger-options.js";
import { buildWebhookOptions } from "../../../../../../../state/discord/auto-hooks/webhook-options.js";
import { NO_WEBHOOKS_TEXT } from "../../../../../../../shared/constants/clan-manage-discord/auto-hook-constants.js";
import { DISCORD_PANE_PLACEHOLDER_CLASS } from "../../../../../../../shared/constants/clan-manage-discord/route-constants.js";
import type { ModeState } from "../../../../../../../state/discord/auto-hooks/mode-feeds.js";

export function makeValueAccess(guildId: string): {
    getValueOptions: (t: string, f: string) => readonly string[];
    subscribeValueOptions: (l: () => void) => () => void;
} {
    const factory = valueOptionsFactory(guildId);
    return {
        getValueOptions: (t, f) => factory.get(t, f),
        subscribeValueOptions: (l) => factory.subscribe(l),
    };
}

function nameMap(channels: readonly DiscordChannel[]): Map<string, string> {
    const map = new Map<string, string>();
    for (const c of channels) {
        if (c.name !== null) map.set(c.channel_id, c.name);
    }
    return map;
}

export interface RendererDeps {
    guildId: string;
    root: Instance;
    state: ModeState;
    valueOps: ReturnType<typeof makeValueAccess>;
    refetchRef: { fn: () => Promise<void> };
}

function renderHooksList(d: RendererDeps, triggerOptions: SelectOption[], webhookOptions: SelectOption[]): void {
    const list = hooksList({
        triggerOptions,
        webhookOptions,
        rows: d.state.autoHooks,
        cb: buildCallbacks(d.guildId, d.state.autoHooks, d.refetchRef.fn),
        getValueOptions: d.valueOps.getValueOptions,
        subscribeValueOptions: d.valueOps.subscribeValueOptions,
    });
    const createFlow = autoHookFlow({
        triggerOptions,
        webhookOptions,
        guildId: d.guildId,
        onCreated: () => void d.refetchRef.fn(),
    });
    d.root.setChildren(list, createFlow);
}

export function makeRenderer(deps: RendererDeps): () => void {
    const renderEmpty = (): void => {
        deps.root.setChildren(
            paragraph({ classes: [DISCORD_PANE_PLACEHOLDER_CLASS], text: NO_WEBHOOKS_TEXT, context: null, meta: null }),
        );
    };
    return () => {
        const triggerOptions = buildTriggerOptions();
        const webhookOptions = buildWebhookOptions(
            deps.state.webhooks,
            deps.state.tokens,
            nameMap(deps.state.channels),
        );
        if (webhookOptions.length === 0) {
            renderEmpty();
            return;
        }
        renderHooksList(deps, triggerOptions, webhookOptions);
    };
}
