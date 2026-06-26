import { div, type Instance, type SlidePanelInstance, baseProps } from "../../../../../../factory";
import { linkerGate, type ByoBotStatus } from "../../../../../../../state/discord-byo-bot/clients/byo-bot-client.js";
import type { DiscordServer } from "../../../../../../../state/discord/client.js";
import { compactInviteBtn, hintPara } from "./mode-buttons.js";
import {
    ROOT_CLASS,
    ROOT_OVERRIDE_CLASS,
} from "../../../../../../../shared/constants/clan-manage-discord/byo-bot-classes.js";
import { statusRow } from "./mode-status-row.js";

export interface LinkedElsewhereOpts {
    status: Extract<ByoBotStatus, { linked: true }>;
    currentUserId: string;
    server: DiscordServer;
    otherGuildNames: string[];
    bindConfirmPanel: SlidePanelInstance;
}

export function linkedElsewhereView(opts: LinkedElsewhereOpts): Instance {
    const { status, currentUserId, server, otherGuildNames, bindConfirmPanel } = opts;
    const gate = linkerGate(status, currentUserId);
    const rootClasses = gate.isOwnerOverride ? [ROOT_CLASS, ROOT_OVERRIDE_CLASS] : [ROOT_CLASS];
    const elsewhereLabel = otherGuildNames.length === 0 ? "another server" : otherGuildNames.join(", ");
    const sections: Instance[] = [
        hintPara(
            `BYO bot '${status.username}' is linked to this clan but currently serves ${elsewhereLabel}. ${server.guild_name} routes through clansocket-default.`,
        ),
        statusRow("Bot", status.username),
        statusRow("Bot ID", status.bot_id),
        statusRow("Linked by", status.owner_display_name),
    ];
    if (!gate.canMutate) {
        sections.push(
            hintPara(`Linked by ${status.owner_display_name}. Only they (or the clan owner) can move routing.`),
        );
        return div(baseProps(rootClasses), sections);
    }
    sections.push(compactInviteBtn(status.application_id));
    sections.push(bindConfirmPanel);
    return div(baseProps(rootClasses), sections);
}
