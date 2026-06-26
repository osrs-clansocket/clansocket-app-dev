import "../../../../../../../styles/pages/clans/manage/discord/clan-discord-page.css";
import { div, effect, type Instance, baseProps } from "../../../../../../factory";
import { guildDataVersion } from "../../../../../../../state/discord/guild-state-cache.js";
import { inspectorOverride$ } from "../../../../../../../state/discord/inspector-override.js";
import { HOST_CLASS, ROWS_LIST_CLASS } from "./mode-constants.js";
import { freshPermissionsCtx, makePermissionsRerender, subscribePermissionsFeed } from "./mode-data.js";
import { wireHoverHighlight } from "./mode-hover.js";
import { buildSwatchPanel } from "./mode-swatch.js";
import type { ModeContext } from "../../registry";

export function buildPermissionsMode(guildId: string): Instance {
    const rowsList = div(baseProps([ROWS_LIST_CLASS]));
    const rowsHost = div(baseProps([HOST_CLASS]), [rowsList]);
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

export const build = (ctx: ModeContext): Instance => buildPermissionsMode(ctx.server.guild_id);
