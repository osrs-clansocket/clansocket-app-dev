import {
    CATEGORY_TYPE,
    NO_PARENT_VALUE,
    isWebhookCapable,
    readSelectValue,
    type ToolbarOpts,
} from "../../../dom/pages/clans/manage/discord/modes/channels/create-dropdown/create-dropdown-constants.js";
import type { FormRefs } from "../../../dom/pages/clans/manage/discord/modes/channels/create-dropdown/create-dropdown-fields.js";
import { submitChannelOnly } from "./submit-channel-only.js";
import { submitJoint } from "./submit-joint.js";

export async function submitChannelKind(opts: ToolbarOpts, refs: FormRefs): Promise<string | undefined> {
    if (refs.channelTypeSelect === null || refs.channelParentSelect === null || refs.channelNameInput === null)
        return "Form not ready.";
    const typeValue = Number(readSelectValue(refs.channelTypeSelect));
    const parentValue = readSelectValue(refs.channelParentSelect);
    const parentId = parentValue === NO_PARENT_VALUE || typeValue === CATEGORY_TYPE ? null : parentValue;
    const channelName = refs.channelNameInput.el.value;
    const wantJoint = refs.getJointChecked !== null && refs.getJointChecked() && isWebhookCapable(typeValue);
    if (!wantJoint) return submitChannelOnly(opts, typeValue, parentId, channelName);
    if (refs.jointWebhookNameInput === null) return "Form not ready.";
    const webhookName = refs.jointWebhookNameInput.el.value;
    return submitJoint({ opts, typeValue, parentId, channelName, webhookName });
}
