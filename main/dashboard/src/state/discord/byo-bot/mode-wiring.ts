import {
    makeTrackHandlers,
    type ModeCtx,
    type Track,
} from "../../../dom/pages/clans/manage/discord/modes/byo-bot/mode-wiring-context.js";
import { renderLinked, renderUnlinkedView } from "./mode-wiring-linked.js";

export type { ModeCtx, Track } from "../../../dom/pages/clans/manage/discord/modes/byo-bot/mode-wiring-context.js";
export { makeTrackHandlers } from "../../../dom/pages/clans/manage/discord/modes/byo-bot/mode-wiring-context.js";

void makeTrackHandlers;

export function makeRebuildFn(ctx: ModeCtx, track: Track): () => void {
    return () => {
        if (ctx.openPanelRef.p !== null && ctx.openPanelRef.p.isOpen()) return;
        if (!ctx.store.status$().linked) renderUnlinkedView(ctx, track);
        else renderLinked(ctx, track);
    };
}
