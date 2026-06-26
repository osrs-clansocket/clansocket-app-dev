import { BTN_VARIANT_PRIMARY, button, wireClick, type Instance } from "../../../../../../../factory";
import type { AutoHookRow } from "../../../../../../../../state/discord/auto-hooks/client.js";
import { SAVE_BTN_LABEL } from "../../../../../../../../shared/constants/clan-manage-discord/auto-hook-constants.js";
import { serializeConditions } from "../condition-editor.js";
import { serializeEmbedTemplate } from "../../../../../../../../state/discord/auto-hooks/card/card-embed.js";
import type { CardCallbacks } from "./card-header.js";
import type { CardState } from "../../../../../../../../state/discord/auto-hooks/card/card-state.js";

function buildSavePayload(state: CardState, row: AutoHookRow): AutoHookRow {
    return {
        ...row,
        auto_hook_name: state.name,
        trigger_type: state.triggerType,
        webhook_id: state.webhookId,
        content_template: state.contentTemplate.length > 0 ? state.contentTemplate : null,
        use_embed: state.useEmbed ? 1 : 0,
        embed_template_json: state.useEmbed ? serializeEmbedTemplate(state.embed) : null,
        conditions_json: serializeConditions(state.conditions),
        webhook_username_override: state.webhookUsernameOverride,
        webhook_avatar_url_override: state.webhookAvatarUrlOverride,
    };
}

export function buildSaveBtn(state: CardState, row: AutoHookRow, cb: CardCallbacks): Instance {
    const saveBtn = button({
        variant: BTN_VARIANT_PRIMARY,

        text: SAVE_BTN_LABEL,
        context: "save the auto-hook edits",
        meta: ["action", "submit"],
    });
    wireClick(saveBtn.el, () => void cb.onSave(buildSavePayload(state, row)));
    return saveBtn;
}
