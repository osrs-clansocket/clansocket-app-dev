import { div, span, type Instance, baseProps, textProps } from "../../../../../../../factory";
import { buildConditionEditor } from "../condition-editor.js";
import type { EmbedState } from "../embed-editor.js";
import { buildOverridesEditor } from "../overrides-editor.js";
import { buildEmbedControl, makeMountEmbed, makeSyncMode } from "./card-body-embed.js";
import {
    AUTO_HOOKS_CARD_BODY_STACK_CLASS,
    AUTO_HOOKS_CARD_LABEL_CLASS,
    AUTO_HOOKS_EMBED_TOGGLE_CLASS,
    EMBED_LABEL,
} from "../../../../../../../../shared/constants/clan-manage-discord/auto-hook-constants.js";
import { buildContentSection, buildTokenChips, insertAtCursor } from "./card-content.js";
import type { CardBodyCallbacks, CardBodyState } from "./card-body-types.js";

export type { CardBodyCallbacks, CardBodyState } from "./card-body-types.js";

function buildCondOverrides(
    initial: CardBodyState,
    cb: CardBodyCallbacks,
): { conditionEditor: Instance; overridesEditor: Instance } {
    const conditionEditor = buildConditionEditor(initial.conditions, {
        onChange: (next) => cb.onConditionsChange(next),
        getTriggerType: cb.getTriggerType,
        getValueOptions: cb.getValueOptions,
        subscribeValueOptions: cb.subscribeValueOptions,
        subscribeTriggerChange: cb.subscribeTriggerChange,
    });
    const overridesEditor = buildOverridesEditor(
        {
            webhookUsernameOverride: initial.webhookUsernameOverride,
            webhookAvatarUrlOverride: initial.webhookAvatarUrlOverride,
        },
        {
            onUsernameChange: cb.onWebhookUsernameOverrideChange,
            onAvatarUrlChange: cb.onWebhookAvatarUrlOverrideChange,
        },
    );
    return { conditionEditor, overridesEditor };
}

function setupEmbedMount(args: {
    guildId: string;
    initial: CardBodyState;
    cb: CardBodyCallbacks;
    contentSection: Instance;
}): { useEmbedRef: { v: boolean }; embedHost: Instance; embedState: EmbedState; syncMode: () => void } {
    const { guildId, initial, cb, contentSection } = args;
    const useEmbedRef = { v: initial.useEmbed };
    const embedHost = div(baseProps([]));
    const embedState: EmbedState = { ...initial.embed };
    const mountEmbed = makeMountEmbed({
        guildId,
        embedState,
        buildTokenChips,
        insertAtCursor,
        getTriggerType: cb.getTriggerType,
        onEmbedChange: cb.onEmbedChange,
    });
    const syncMode = makeSyncMode({ useEmbedRef, contentSection, embedHost, mountEmbed });
    return { useEmbedRef, embedHost, embedState, syncMode };
}

function buildEmbedRow(args: {
    guildId: string;
    initial: CardBodyState;
    cb: CardBodyCallbacks;
    formatTextarea: Instance<HTMLTextAreaElement>;
    contentSection: Instance;
}): { toggleRow: Instance; embedHost: Instance } {
    const { formatTextarea, cb } = args;
    const { useEmbedRef, embedHost, embedState, syncMode } = setupEmbedMount(args);
    const embedToggle = buildEmbedControl({
        useEmbedRef,
        embedState,
        formatTextarea,
        syncMode,
        onContentChange: cb.onContentChange,
        onEmbedChange: cb.onEmbedChange,
        onUseEmbedChange: cb.onUseEmbedChange,
    });
    syncMode();
    const toggleRow = div(baseProps([AUTO_HOOKS_EMBED_TOGGLE_CLASS]), [
        embedToggle,
        span(textProps([AUTO_HOOKS_CARD_LABEL_CLASS], EMBED_LABEL)),
    ]);
    return { toggleRow, embedHost };
}

export function buildCardBody(
    guildId: string,
    initial: CardBodyState,
    cb: CardBodyCallbacks,
    extras: { selects: readonly Instance[] },
): { root: Instance; formatTextarea: Instance<HTMLTextAreaElement> } {
    const { formatTextarea, contentSection } = buildContentSection({ guildId, initial, cb });
    const { toggleRow, embedHost } = buildEmbedRow({ guildId, initial, cb, formatTextarea, contentSection });
    const { conditionEditor, overridesEditor } = buildCondOverrides(initial, cb);
    const root = div(baseProps([AUTO_HOOKS_CARD_BODY_STACK_CLASS]), [
        ...extras.selects,
        overridesEditor,
        contentSection,
        conditionEditor,
        toggleRow,
        embedHost,
    ]);
    return { root, formatTextarea };
}
