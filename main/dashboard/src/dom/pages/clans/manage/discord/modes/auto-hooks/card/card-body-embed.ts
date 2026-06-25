import type { Instance } from "../../../../../../../factory";
import { buildGlassCheck } from "../../../../../../../forms/glass/inputs/glass-check.js";
import { buildEmbedEditor, type EmbedState } from "../embed-editor.js";
import { buildEmojiPicker } from "../emoji-picker.js";
import { EMBED_LABEL } from "../../../../../../../../shared/constants/clan-manage-discord/auto-hook-constants.js";

interface EmbedAccessoriesArgs {
    guildId: string;
    getTriggerType: () => string;
    buildTokenChips: (getTrigger: () => string, ta: HTMLTextAreaElement) => Instance;
    insertAtCursor: (ta: HTMLTextAreaElement, text: string) => void;
}

function descAccessoriesFor(args: {
    guildId: string;
    getTriggerType: () => string;
    buildTokenChips: (getTrigger: () => string, ta: HTMLTextAreaElement) => Instance;
    insertAtCursor: (ta: HTMLTextAreaElement, text: string) => void;
}): (textareaEl: HTMLTextAreaElement) => Instance[] {
    const { guildId, getTriggerType, buildTokenChips, insertAtCursor } = args;
    return (textareaEl) => [
        buildTokenChips(getTriggerType, textareaEl),
        buildEmojiPicker({ guildId, getTriggerType, onInsert: (text) => insertAtCursor(textareaEl, text) }),
    ];
}

export function makeMountEmbed(args: {
    guildId: string;
    embedState: EmbedState;
    getTriggerType: () => string;
    onEmbedChange: (next: EmbedState) => void;
    buildTokenChips: (getTrigger: () => string, ta: HTMLTextAreaElement) => Instance;
    insertAtCursor: (ta: HTMLTextAreaElement, text: string) => void;
}): () => Instance {
    const { embedState, onEmbedChange } = args;
    const buildDescAccessories = descAccessoriesFor(args);
    return () =>
        buildEmbedEditor(
            embedState,
            {
                onChange: (next) => {
                    Object.assign(embedState, next);
                    onEmbedChange({ ...embedState });
                },
            },
            { buildDescAccessories },
        );
}

export interface EmbedToggleArgs {
    useEmbedRef: { v: boolean };
    embedState: EmbedState;
    formatTextarea: Instance<HTMLTextAreaElement>;
    onContentChange: (value: string) => void;
    onEmbedChange: (next: EmbedState) => void;
    onUseEmbedChange: (useEmbed: boolean) => void;
    syncMode: () => void;
}

export function buildEmbedControl(args: EmbedToggleArgs): Instance {
    const { useEmbedRef, embedState, formatTextarea, onContentChange, onEmbedChange, onUseEmbedChange, syncMode } =
        args;
    return buildGlassCheck({
        name: "embed-toggle",
        checked: () => useEmbedRef.v,
        ariaLabel: EMBED_LABEL,
        onChange: (next) => {
            useEmbedRef.v = next;
            if (next && embedState.description.length === 0 && formatTextarea.el.value.length > 0) {
                embedState.description = formatTextarea.el.value;
                onEmbedChange({ ...embedState });
                formatTextarea.el.value = "";
                onContentChange("");
            }
            onUseEmbedChange(next);
            syncMode();
        },
    });
}

export function makeSyncMode(args: {
    useEmbedRef: { v: boolean };
    contentSection: Instance;
    embedHost: Instance;
    mountEmbed: () => Instance;
}): () => void {
    const { useEmbedRef, contentSection, embedHost, mountEmbed } = args;
    return (): void => {
        if (useEmbedRef.v) {
            contentSection.el.style.display = "none";
            embedHost.setChildren(mountEmbed());
        } else {
            contentSection.el.style.display = "";
            embedHost.clear();
        }
    };
}

export type { EmbedAccessoriesArgs };
