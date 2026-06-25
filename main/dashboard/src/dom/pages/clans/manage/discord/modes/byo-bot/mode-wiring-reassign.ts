import type { SlidePanelInstance } from "../../../../../../factory";
import {
    type linkerGate,
    reassignLinker,
    type ByoBotStatus,
} from "../../../../../../../state/discord-byo-bot/clients/byo-bot-client.js";
import { buildReassignPanel } from "./mode-reassign.js";
import type { ModeCtx, Track } from "./mode-wiring-context.js";

export function linkedReassignPanel(
    ctx: ModeCtx,
    track: Track,
    status: Extract<ByoBotStatus, { linked: true }>,
    gate: ReturnType<typeof linkerGate>,
): SlidePanelInstance | null {
    if (!gate.canReassign) return null;
    return buildReassignPanel({
        slug: ctx.slug,
        currentLinkerId: status.owner_site_account_id,
        onSelect: async (newLinkerUserId) => {
            const result = await reassignLinker(ctx.slug, { newLinkerUserId });
            if (!result.ok) throw new Error(result.reason ?? "unknown");
            await ctx.store.refresh();
        },
        onPanelOpen: track.trackOpen,
        onPanelClose: track.trackClose,
    });
}
