import { div, type Instance } from "../../../../../../factory";
import type { DiscordChannelOverwrite } from "../../../../../../../state/discord/client.js";
import { ADD_FORM_ACTIONS_CLASS, ADD_FORM_CLASS } from "./mode-constants.js";
import { buildField } from "./mode-addform-selects.js";
import { makeFormParts, wireFormSubmit } from "./mode-addform-parts.js";

export function buildAddForm(
    guildId: string,
    bit: number,
    getLatest: () => readonly DiscordChannelOverwrite[],
    onClose: () => void,
): Instance {
    const parts = makeFormParts({ guildId, bit, onClose });
    wireFormSubmit({ parts, guildId, bit, getLatest, onClose });
    return div({ classes: [ADD_FORM_CLASS], context: null, meta: null }, [
        buildField("Target", `perm-add-target-field-${bit}`, parts.selects.targetSelect),
        buildField("Channel", `perm-add-channel-field-${bit}`, parts.selects.channelSelect),
        buildField("Branch", `perm-add-branch-field-${bit}`, parts.selects.branchSelect),
        parts.errorEl,
        div({ classes: [ADD_FORM_ACTIONS_CLASS], context: null, meta: null }, [parts.cancelBtn, parts.submitBtn]),
    ]);
}
