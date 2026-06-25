import type {
    CardBodyCallbacks,
    CardBodyState,
} from "../../../../dom/pages/clans/manage/discord/modes/auto-hooks/card/card-body.js";
import { previewingChange, silentChange } from "./setters.js";
export { makeTriggerBus } from "./trigger-bus.js";

interface BodyCallbacksArgs {
    state: CardBodyState;
    publishPreview: () => void;
    getTriggerType: () => string;
    getValueOptions: (t: string, f: string) => readonly string[];
    subscribeValueOptions: (l: () => void) => () => void;
    subscribeTriggerChange: (l: () => void) => () => void;
}

export function makeBodyCallbacks(args: BodyCallbacksArgs): CardBodyCallbacks {
    const { state, publishPreview, getTriggerType, getValueOptions, subscribeValueOptions, subscribeTriggerChange } =
        args;
    return {
        onContentChange: previewingChange(state, "contentTemplate", publishPreview),
        onUseEmbedChange: previewingChange(state, "useEmbed", publishPreview),
        onEmbedChange: previewingChange(state, "embed", publishPreview),
        onConditionsChange: silentChange(state, "conditions"),
        onWebhookUsernameOverrideChange: silentChange(state, "webhookUsernameOverride"),
        onWebhookAvatarUrlOverrideChange: silentChange(state, "webhookAvatarUrlOverride"),
        getTriggerType,
        getValueOptions,
        subscribeValueOptions,
        subscribeTriggerChange,
    };
}
