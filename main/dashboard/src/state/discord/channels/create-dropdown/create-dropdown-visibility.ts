import {
    CATEGORY_TYPE,
    KIND_CHANNEL,
    isWebhookCapable,
    readSelectValue,
} from "../../../../dom/pages/clans/manage/discord/modes/channels/create-dropdown/create-dropdown-constants.js";
import type { FormRefs } from "../../../../dom/pages/clans/manage/discord/modes/channels/create-dropdown/create-dropdown-fields.js";

export function applyChannelVisibility(refs: FormRefs): void {
    if (refs.channelTypeSelect === null || refs.channelParentField === null) return;
    const channelType = Number(readSelectValue(refs.channelTypeSelect));
    const isCategory = channelType === CATEGORY_TYPE;
    const capable = isWebhookCapable(channelType);
    const jointOn = refs.getJointChecked !== null && refs.getJointChecked();
    refs.channelParentField.el.hidden = isCategory;
    if (refs.jointCheckField !== null) refs.jointCheckField.el.hidden = !capable;
    if (refs.jointWebhookNameField !== null) refs.jointWebhookNameField.el.hidden = !(capable && jointOn);
}

export function applyKindVisibility(refs: FormRefs): void {
    if (refs.kindSelect === null) return;
    const kind = readSelectValue(refs.kindSelect);
    const isChannel = kind === KIND_CHANNEL;
    if (refs.channelSection !== null) refs.channelSection.el.hidden = !isChannel;
    if (refs.webhookSection !== null) refs.webhookSection.el.hidden = isChannel;
    if (isChannel) applyChannelVisibility(refs);
}
