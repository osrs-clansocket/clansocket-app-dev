import "../../../../../../../styles/pages/clans/manage/discord/clan-discord-page.css";
import { div, effect, type Instance } from "../../../../../../factory";
import { guildDataVersion } from "../../../../../../../state/discord/guild-state-cache.js";
import { inspectorOverride$ } from "../../../../../../../state/discord/inspector-override.js";
import { HOST_CLASS, ROWS_LIST_CLASS } from "./mode-constants.js";
import { freshPermissionsCtx, makePermissionsRerender, subscribePermissionsFeed } from "./mode-data.js";
import { wireHoverHighlight } from "./mode-hover.js";
import { buildSwatchPanel } from "./mode-swatch.js";
import { defineDiscordMode } from "../../registry";

export function buildPermissionsMode(guildId: string): Instance {
    const rowsList = div({ classes: [ROWS_LIST_CLASS], context: null, meta: null });
    const rowsHost = div({ classes: [HOST_CLASS], context: null, meta: null }, [rowsList]);
    const ctx = freshPermissionsCtx({ guildId, rowsHost, rowsList });
    wireHoverHighlight(ctx);
    const rowState = new Map<string, Instance>();
    const rerender = makePermissionsRerender({ ctx, rowState });
    const unsubscribe = subscribePermissionsFeed(guildId, ctx.latestRef, rerender);
    rowsHost.trackDispose(
        effect(() => {
            guildDataVersion();
            rerender();
        }),
    );
    inspectorOverride$.set(() => buildSwatchPanel(guildId));
    rowsHost.trackDispose({
        dispose: () => {
            unsubscribe();
            inspectorOverride$.set(null);
        },
    });
    return rowsHost;
}

defineDiscordMode({
    key: "permissions",
    label: "Permissions",
    order: 80,
    build: (ctx) => buildPermissionsMode(ctx.server.guild_id),
});
