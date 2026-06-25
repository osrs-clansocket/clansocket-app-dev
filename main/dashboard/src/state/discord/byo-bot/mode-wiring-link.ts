import { verifyAndLink } from "../../discord-byo-bot/clients/byo-bot-client.js";
import type { ModeCtx } from "../../../dom/pages/clans/manage/discord/modes/byo-bot/mode-wiring-context.js";

export function makeLinkSubmit(
    ctx: ModeCtx,
): (payload: { applicationId: string; botToken: string; publicKey?: string }) => Promise<void> {
    return async (payload) => {
        const result = await verifyAndLink(ctx.slug, payload, ctx.server.guild_id);
        if (!result.ok) throw new Error(result.reason ?? "verify or link failed");
        await ctx.store.refresh();
        await ctx.serversStore.refresh();
    };
}
