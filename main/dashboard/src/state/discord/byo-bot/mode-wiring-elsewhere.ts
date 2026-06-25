import type { ByoBotStatus } from "../../discord-byo-bot/clients/byo-bot-client.js";
import { linkedElsewhereView } from "../../../dom/pages/clans/manage/discord/modes/byo-bot/mode-views.js";
import { buildBindPanel } from "../../../dom/pages/clans/manage/discord/modes/byo-bot/mode-wiring-confirms.js";
import type { ModeCtx, Track } from "../../../dom/pages/clans/manage/discord/modes/byo-bot/mode-wiring-context.js";

export function renderLinkedElsewhere(
    ctx: ModeCtx,
    track: Track,
    status: Extract<ByoBotStatus, { linked: true }>,
    uid: string,
): void {
    void uid;
    const allServers = ctx.serversStore.servers() ?? [];
    const otherBound = allServers.filter((s) => s.bot_id === status.bot_id && s.guild_id !== ctx.server.guild_id);
    const otherIds = otherBound.map((s) => s.guild_id);
    const otherNames = otherBound.map((s) => s.guild_name);
    const elsewhereLabel = otherNames.length === 0 ? "the previously-bound server" : otherNames.join(", ");
    ctx.content.setChildren(
        linkedElsewhereView({
            status,
            currentUserId: uid,
            server: ctx.server,
            otherGuildNames: otherNames,
            bindConfirmPanel: buildBindPanel(ctx, track, otherIds, elsewhereLabel),
        }),
    );
}
