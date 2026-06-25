import { reconcile } from "../../../../../../factory/live-ops/reconcile.js";
import { overwritesFeed } from "../../../../../../../state/discord/channel-overwrites/channel-overwrites-feed.js";
import { PERMISSION_FLAG_NAMES } from "../../../../../../../shared/constants/clan-manage-discord/permission-flags-constants.js";
import { targetIdOf } from "../../../../../../discord/inspector/util/permission-cycle.js";
import type { DiscordChannelOverwrite } from "../../../../../../../state/discord/client.js";
import type { Instance } from "../../../../../../factory";
import { type PermissionsCtx } from "./mode-constants.js";
import { clearHoverHighlight } from "./mode-hover.js";
import { createWireOverlay } from "./mode-overlay.js";
import { permissionRow } from "./mode-row.js";

function applyDeltaBatch(
    latest: readonly DiscordChannelOverwrite[],
    batch: { deltas: ReadonlyArray<{ op: string; row?: unknown; key: string }> },
): DiscordChannelOverwrite[] {
    const byKey = new Map<string, DiscordChannelOverwrite>();
    for (const o of latest) byKey.set(`${o.channel_id}:${targetIdOf(o)}`, o);
    for (const d of batch.deltas) {
        if (d.op === "upsert" && d.row) {
            const row = d.row as DiscordChannelOverwrite;
            byKey.set(`${row.channel_id}:${targetIdOf(row)}`, row);
        } else if (d.op === "remove") {
            byKey.delete(d.key);
        }
    }
    return [...byKey.values()];
}

export function subscribePermissionsFeed(
    guildId: string,
    latestRef: { v: readonly DiscordChannelOverwrite[] },
    rerender: () => void,
): () => void {
    const feed = overwritesFeed(guildId);
    return feed.source.subscribe(
        (snap) => {
            latestRef.v = snap.rows as DiscordChannelOverwrite[];
            rerender();
        },
        (batch) => {
            latestRef.v = applyDeltaBatch(latestRef.v, batch);
            rerender();
        },
    );
}

interface RowItem {
    bit: number;
    flagName: string;
}

export function makePermissionsRerender(args: { ctx: PermissionsCtx; rowState: Map<string, Instance> }): () => void {
    const { ctx, rowState } = args;
    return (): void => {
        clearHoverHighlight(ctx);
        const items: RowItem[] = PERMISSION_FLAG_NAMES.map((flagName, bit) => ({ bit, flagName }));
        reconcile<RowItem>({
            items,
            container: ctx.rowsList,
            state: rowState,
            keyOf: (i) => String(i.bit),
            create: (i) => permissionRow(ctx, i.bit, i.flagName),
        });
    };
}

export function freshPermissionsCtx(args: { guildId: string; rowsHost: Instance; rowsList: Instance }): PermissionsCtx {
    const { guildId, rowsHost, rowsList } = args;
    const latestRef: { v: readonly DiscordChannelOverwrite[] } = { v: [] };
    const overlay = createWireOverlay(rowsHost);
    const ctx: PermissionsCtx = {
        guildId,
        rowsHost,
        rowsList,
        overlay,
        latestRef,
        getLatest: () => latestRef.v,
        clearHover: () => clearHoverHighlight(ctx),
    };
    return ctx;
}
