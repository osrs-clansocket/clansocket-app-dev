import {
    KIND_CHANNEL,
    KIND_WEBHOOK,
    readSelectValue,
    type ToolbarOpts,
} from "../../../../dom/pages/clans/manage/discord/modes/channels/create-dropdown/create-dropdown-constants.js";
import type { FormRefs } from "../../../../dom/pages/clans/manage/discord/modes/channels/create-dropdown/create-dropdown-fields.js";
import { submitChannelKind, submitWebhookKind } from "./create-dropdown-kinds.js";

export { applyChannelVisibility, applyKindVisibility } from "./create-dropdown-visibility.js";

export async function handleSubmit(opts: ToolbarOpts, refs: FormRefs): Promise<string | undefined> {
    if (refs.kindSelect === null) return "Form not ready.";
    const kind = readSelectValue(refs.kindSelect);
    if (kind === KIND_CHANNEL) return submitChannelKind(opts, refs);
    if (kind === KIND_WEBHOOK) return submitWebhookKind(opts, refs);
    return "Unknown create type.";
}
