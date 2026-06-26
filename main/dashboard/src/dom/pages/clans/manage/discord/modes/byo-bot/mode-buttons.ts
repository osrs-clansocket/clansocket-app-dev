import { anchor, BTN_VARIANT_OUTLINE, button, paragraph, type Instance } from "../../../../../../factory";
import { inviteUrl } from "../../../../../../../state/discord-byo-bot/builders/invite-builder.js";
import { DISCORD_PLACEHOLDER_HINT_CLASS } from "../../../../../../../shared/constants/clan-manage-discord/route-constants.js";
import {
    INVITE_BTN,
    INVITE_BTN_CONTEXT,
} from "../../../../../../../shared/constants/clan-manage-discord/byo-bot-text.js";
import { TOOLBAR_BTN_CLASS } from "../../../../../../../shared/constants/clan-manage-discord/byo-bot-classes.js";

export function compactBtn(text: string, ctx: string, onClick: () => void): Instance {
    return button({
        text,
        onClick,
        classes: [],
        variant: BTN_VARIANT_OUTLINE,

        context: ctx,
        meta: ["action"],
    });
}

export function compactInviteBtn(applicationId: string): Instance {
    return anchor({
        href: inviteUrl(applicationId),
        text: INVITE_BTN,
        target: "_blank",
        rel: "noopener noreferrer",
        classes: [TOOLBAR_BTN_CLASS],
        context: INVITE_BTN_CONTEXT,
        meta: ["action", "nav"],
    });
}

export function hintPara(text: string): Instance {
    return paragraph({ text, classes: [DISCORD_PLACEHOLDER_HINT_CLASS], context: null, meta: null });
}
