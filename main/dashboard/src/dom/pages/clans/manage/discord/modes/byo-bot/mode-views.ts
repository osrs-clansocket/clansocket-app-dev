import { div, type Instance, type SlidePanelInstance } from "../../../../../../factory";
import { linkerGate, type ByoBotStatus } from "../../../../../../../state/discord-byo-bot/clients/byo-bot-client.js";
import type { DiscordServer } from "../../../../../../../state/discord/client.js";
import { compactInviteBtn, hintPara } from "./mode-buttons.js";
import { formatDate, statusRow } from "./mode-status-row.js";
import { NOT_LINKED_LEDE } from "../../../../../../../shared/constants/clan-manage-discord/byo-bot-text.js";
import {
    ROOT_CLASS,
    ROOT_OVERRIDE_CLASS,
} from "../../../../../../../shared/constants/clan-manage-discord/byo-bot-classes.js";

export { linkedElsewhereView, type LinkedElsewhereOpts } from "./mode-view-elsewhere.js";

export function notLinkedView(linkPanel: Instance, server: DiscordServer): Instance {
    const lede = `${NOT_LINKED_LEDE} On submit, the bot will be bound to ${server.guild_name}.`;
    return div({ classes: [ROOT_CLASS], context: null, meta: null }, [hintPara(lede), linkPanel]);
}

function linkedStatusRows(status: Extract<ByoBotStatus, { linked: true }>): Instance[] {
    return [
        statusRow("Bot", status.username),
        statusRow("Bot ID", status.bot_id),
        statusRow("Application ID", status.application_id),
        statusRow("Linked by", status.owner_display_name),
        statusRow("Last verified", formatDate(status.last_verified_at)),
        statusRow("Verify status", status.last_verified_status),
    ];
}

export interface LinkedHereOpts {
    status: Extract<ByoBotStatus, { linked: true }>;
    currentUserId: string;
    server: DiscordServer;
    relinkPanel: Instance;
    reassignPanel: Instance | null;
    revokeConfirmPanel: SlidePanelInstance;
    unbindConfirmPanel: SlidePanelInstance;
}

export function linkedHereView(opts: LinkedHereOpts): Instance {
    const { status, currentUserId, server, relinkPanel, reassignPanel, revokeConfirmPanel, unbindConfirmPanel } = opts;
    const gate = linkerGate(status, currentUserId);
    const rootClasses = gate.isOwnerOverride ? [ROOT_CLASS, ROOT_OVERRIDE_CLASS] : [ROOT_CLASS];
    const sections: Instance[] = [hintPara(`Linked. Serving ${server.guild_name}.`), ...linkedStatusRows(status)];
    if (!gate.canMutate) {
        sections.push(
            hintPara(
                `Linked by ${status.owner_display_name}. Only they (or the clan owner) can re-link, revoke, or move routing.`,
            ),
        );
        return div({ classes: rootClasses, context: null, meta: null }, sections);
    }
    sections.push(relinkPanel);
    sections.push(compactInviteBtn(status.application_id));
    sections.push(unbindConfirmPanel);
    sections.push(revokeConfirmPanel);
    if (reassignPanel !== null && gate.canReassign) sections.push(reassignPanel);
    return div({ classes: rootClasses, context: null, meta: null }, sections);
}
