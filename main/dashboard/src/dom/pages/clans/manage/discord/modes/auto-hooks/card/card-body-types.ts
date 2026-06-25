import type { ConditionRow } from "../condition-editor.js";
import type { EmbedState } from "../embed-editor.js";

export interface CardBodyState {
    contentTemplate: string;
    useEmbed: boolean;
    embed: EmbedState;
    conditions: readonly ConditionRow[];
    webhookUsernameOverride: string | null;
    webhookAvatarUrlOverride: string | null;
}

export interface CardBodyCallbacks {
    onContentChange: (value: string) => void;
    onUseEmbedChange: (useEmbed: boolean) => void;
    onEmbedChange: (next: EmbedState) => void;
    onConditionsChange: (next: readonly ConditionRow[]) => void;
    onWebhookUsernameOverrideChange: (next: string | null) => void;
    onWebhookAvatarUrlOverrideChange: (next: string | null) => void;
    getTriggerType: () => string;
    getValueOptions: (triggerType: string, field: string) => readonly string[];
    subscribeValueOptions: (listener: () => void) => () => void;
    subscribeTriggerChange: (listener: () => void) => () => void;
}
