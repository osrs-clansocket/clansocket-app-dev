import { linkerGate } from "../../discord-byo-bot/clients/byo-bot-client.js";
import { identityStore } from "../../identity/stores/identity-store.js";
import { buildLinkPanel } from "../../../dom/pages/clans/manage/discord/modes/byo-bot/mode-link.js";
import { notLinkedView } from "../../../dom/pages/clans/manage/discord/modes/byo-bot/mode-views.js";
import {
    LINK_BTN,
    RELINK_BTN,
    RELINK_OVERRIDE_BTN,
} from "../../../shared/constants/clan-manage-discord/byo-bot-text.js";
import { makeLinkSubmit } from "./mode-wiring-link.js";
import { renderLinkedHere } from "../../../dom/pages/clans/manage/discord/modes/byo-bot/mode-wiring-here.js";
import { renderLinkedElsewhere } from "./mode-wiring-elsewhere.js";
import { linkedReassignPanel } from "../../../dom/pages/clans/manage/discord/modes/byo-bot/mode-wiring-reassign.js";
import type { ModeCtx, Track } from "../../../dom/pages/clans/manage/discord/modes/byo-bot/mode-wiring-context.js";

export function renderUnlinkedView(ctx: ModeCtx, track: Track): void {
    const linkPanel = buildLinkPanel({
        triggerLabel: LINK_BTN,
        onSubmit: makeLinkSubmit(ctx),
        onPanelOpen: track.trackOpen,
        onPanelClose: track.trackClose,
    });
    ctx.content.setChildren(notLinkedView(linkPanel, ctx.server));
}

export function renderLinked(ctx: ModeCtx, track: Track): void {
    const status = ctx.store.status$();
    if (!status.linked) return;
    const uid = identityStore.session$()?.id ?? "";
    const gate = linkerGate(status, uid);
    const relinkPanel = buildLinkPanel({
        triggerLabel: gate.isOwnerOverride ? RELINK_OVERRIDE_BTN : RELINK_BTN,
        onSubmit: makeLinkSubmit(ctx),
        onPanelOpen: track.trackOpen,
        onPanelClose: track.trackClose,
    });
    const reassignPanel = linkedReassignPanel(ctx, track, status, gate);
    if (ctx.server.bot_id === status.bot_id)
        renderLinkedHere({ ctx, track, status, uid, gate, relinkPanel, reassignPanel });
    else renderLinkedElsewhere(ctx, track, status, uid);
}
