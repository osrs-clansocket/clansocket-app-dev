import "../../../../../../../styles/pages/clans/manage/discord/clan-discord-page.css";
import { div, effect, panel, paragraph, type Instance } from "../../../../../../factory";
import { storeFor } from "../../../../../../../state/discord-byo-bot/stores/byo-bot-store.js";
import { serversStoreFor } from "../../../../../../../state/discord/servers-store.js";
import { identityStore } from "../../../../../../../state/identity/stores/identity-store.js";
import type { DiscordServer } from "../../../../../../../state/discord/client.js";
import { DISCORD_PLACEHOLDER_HINT_CLASS } from "../../../../../../../shared/constants/clan-manage-discord/route-constants.js";
import { LOADING_TEXT } from "../../../../../../../shared/constants/clan-manage-discord/byo-bot-text.js";
import {
    makeRebuildFn,
    makeTrackHandlers,
    type ModeCtx,
} from "../../../../../../../state/discord/byo-bot/mode-wiring.js";
import { defineDiscordMode } from "../../registry";

function buildCtx(slug: string, server: DiscordServer, content: Instance): ModeCtx {
    return {
        slug,
        server,
        content,
        store: storeFor(slug),
        serversStore: serversStoreFor(slug),
        openPanelRef: { p: null },
        rebuild: () => undefined,
    };
}

export function buildMode(slug: string, server: DiscordServer): Instance {
    const content = div({ classes: [], context: null, meta: null }, [
        paragraph({ classes: [DISCORD_PLACEHOLDER_HINT_CLASS], text: LOADING_TEXT, context: null, meta: null }),
    ]);
    const ctx = buildCtx(slug, server, content);
    const track = makeTrackHandlers(ctx);
    ctx.rebuild = makeRebuildFn(ctx, track);
    void ctx.store.ensure();
    void ctx.serversStore.ensure();
    const root = panel({ context: null, meta: null }, [content]);
    root.trackDispose(
        effect(() => {
            ctx.store.status$();
            ctx.serversStore.servers();
            identityStore.session$();
            ctx.rebuild();
        }),
    );
    return root;
}

defineDiscordMode({ key: "byo-bot", label: "BYO Bot", order: 90, build: (ctx) => buildMode(ctx.slug, ctx.server) });
