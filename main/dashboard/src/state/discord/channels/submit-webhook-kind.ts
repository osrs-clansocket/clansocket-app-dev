import {
    readSelectValue,
    type ToolbarOpts,
} from "../../../dom/pages/clans/manage/discord/modes/channels/create-dropdown/create-dropdown-constants.js";
import type { FormRefs } from "../../../dom/pages/clans/manage/discord/modes/channels/create-dropdown/create-dropdown-fields.js";
import { submitWebhookCreate } from "./create-dropdown/create-dropdown-creators.js";

export async function submitWebhookKind(opts: ToolbarOpts, refs: FormRefs): Promise<string | undefined> {
    if (refs.webhookChannelSelect === null || refs.webhookNameInput === null) return "Form not ready.";
    const channelId = readSelectValue(refs.webhookChannelSelect);
    if (channelId === "") return "No webhook-capable channels available.";
    const ok = await submitWebhookCreate(opts.guildId, channelId, refs.webhookNameInput.el.value);
    return ok ? undefined : "Failed to create webhook.";
}
