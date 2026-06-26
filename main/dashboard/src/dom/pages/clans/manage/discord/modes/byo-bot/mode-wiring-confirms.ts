import type { SlidePanelInstance } from "../../../../../../factory";
import {
    bindToGuild,
    revokeByoBot,
    unbindFromGuild,
} from "../../../../../../../state/discord-byo-bot/clients/byo-bot-client.js";
import { confirmPanel } from "./mode-confirm.js";
import { BIND_BTN } from "../../../../../../../shared/constants/clan-manage-discord/byo-bot-text.js";
import type { ModeCtx } from "./mode-wiring-context.js";

type Track = { trackOpen: (p: SlidePanelInstance) => void; trackClose: () => void };

export function buildRevokePanel(ctx: ModeCtx, track: Track, revokeLabel: string): SlidePanelInstance {
    return confirmPanel({
        triggerLabel: revokeLabel,
        triggerContext: "open the revoke-bot confirm panel",
        message:
            "Revoke the bot credential and unlink? Stops the bot immediately and reverts every guild it serves to clansocket-default.",
        confirmLabel: revokeLabel,
        confirmContext: "confirm revoke the BYO bot and unlink",
        cancelContext: "cancel revoke the BYO bot",
        onConfirm: async () => {
            await revokeByoBot(ctx.slug);
            await ctx.store.refresh();
            await ctx.serversStore.refresh();
        },
        onPanelOpen: track.trackOpen,
        onPanelClose: track.trackClose,
    });
}

export function buildUnbindPanel(ctx: ModeCtx, track: Track): SlidePanelInstance {
    return confirmPanel({
        triggerLabel: `Unbind from ${ctx.server.guild_name}`,
        triggerContext: `open the unbind-from-${ctx.server.guild_name} confirm panel`,
        message: `Stop routing ${ctx.server.guild_name} through the BYO bot? This server falls back to clansocket-default. The BYO bot stays linked to the clan and can be bound to another server.`,
        confirmLabel: "Unbind",
        confirmContext: `confirm unbind ${ctx.server.guild_name} from the BYO bot`,
        cancelContext: `cancel unbind ${ctx.server.guild_name}`,
        onConfirm: async () => {
            await unbindFromGuild(ctx.slug, ctx.server.guild_id);
            await ctx.serversStore.refresh();
        },
        onPanelOpen: track.trackOpen,
        onPanelClose: track.trackClose,
    });
}

export function buildBindPanel(
    ctx: ModeCtx,
    track: Track,
    otherIds: string[],
    elsewhereLabel: string,
): SlidePanelInstance {
    return confirmPanel({
        triggerLabel: `${BIND_BTN}: ${ctx.server.guild_name}`,
        triggerContext: `open the bind-to-${ctx.server.guild_name} confirm panel`,
        message: `Move BYO routing from ${elsewhereLabel} to ${ctx.server.guild_name}? The bot stops serving the previous server (it falls back to clansocket-default) and starts serving this one.`,
        confirmLabel: "Move routing",
        confirmContext: `confirm move BYO routing to ${ctx.server.guild_name}`,
        cancelContext: `cancel move BYO routing to ${ctx.server.guild_name}`,
        onConfirm: async () => {
            const pending: Promise<unknown>[] = [];
            for (const otherId of otherIds) pending.push(unbindFromGuild(ctx.slug, otherId));
            await Promise.all(pending);
            await bindToGuild(ctx.slug, ctx.server.guild_id);
            await ctx.serversStore.refresh();
        },
        onPanelOpen: track.trackOpen,
        onPanelClose: track.trackClose,
    });
}
