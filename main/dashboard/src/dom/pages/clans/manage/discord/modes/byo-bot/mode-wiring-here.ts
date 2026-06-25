import type { SlidePanelInstance } from "../../../../../../factory";
import {
    type linkerGate,
    type ByoBotStatus,
} from "../../../../../../../state/discord-byo-bot/clients/byo-bot-client.js";
import { linkedHereView } from "./mode-views.js";
import {
    REVOKE_BTN,
    REVOKE_OVERRIDE_BTN,
} from "../../../../../../../shared/constants/clan-manage-discord/byo-bot-text.js";
import { buildRevokePanel, buildUnbindPanel } from "./mode-wiring-confirms.js";
import type { ModeCtx, Track } from "./mode-wiring-context.js";

export function renderLinkedHere(args: {
    ctx: ModeCtx;
    track: Track;
    status: Extract<ByoBotStatus, { linked: true }>;
    uid: string;
    gate: ReturnType<typeof linkerGate>;
    relinkPanel: SlidePanelInstance;
    reassignPanel: SlidePanelInstance | null;
}): void {
    const { ctx, track, status, uid, gate, relinkPanel, reassignPanel } = args;
    const revokeLabel = gate.isOwnerOverride ? REVOKE_OVERRIDE_BTN : REVOKE_BTN;
    ctx.content.setChildren(
        linkedHereView({
            status,
            relinkPanel,
            reassignPanel,
            currentUserId: uid,
            server: ctx.server,
            revokeConfirmPanel: buildRevokePanel(ctx, track, revokeLabel),
            unbindConfirmPanel: buildUnbindPanel(ctx, track),
        }),
    );
}
