import { BTN_VARIANT_CHIP, button, div, wireInput, type Instance, baseProps } from "../../../../../../../factory";
import { glassTextarea } from "../../../../../../../forms/glass/inputs/glass-textarea.js";
import { buildEmojiPicker } from "../emoji-picker.js";
import { tokensForTrigger } from "../../../../../../../../shared/constants/clan-manage-discord/token-list.js";
import {
    AUTO_HOOKS_TOKEN_CHIPS_CLASS,
    FORMAT_LABEL,
} from "../../../../../../../../shared/constants/clan-manage-discord/auto-hook-constants.js";
import type { CardBodyCallbacks, CardBodyState } from "./card-body-types.js";

export function insertAtCursor(ta: HTMLTextAreaElement, text: string): void {
    const pos = ta.selectionStart ?? ta.value.length;
    ta.value = ta.value.slice(0, pos) + text + ta.value.slice(pos);
    ta.focus();
    ta.dispatchEvent(new Event("input", { bubbles: true }));
}

export function buildTokenChips(getTrigger: () => string, ta: HTMLTextAreaElement): Instance {
    const tokens = tokensForTrigger(getTrigger());
    const chips = tokens.map((t) => {
        const inst = button({
            variant: BTN_VARIANT_CHIP,
            text: t.label,
            context: `insert ${t.token} (sample: ${t.sampleValue})`,
            meta: ["action", "input"],
            onClick: () => insertAtCursor(ta, t.token),
        });
        inst.setAttr("title", `${t.token} → e.g. ${t.sampleValue}`);
        return inst;
    });
    return div(baseProps([AUTO_HOOKS_TOKEN_CHIPS_CLASS]), chips);
}

export interface ContentSectionParts {
    formatTextarea: Instance<HTMLTextAreaElement>;
    contentSection: Instance;
}

export function buildContentSection(args: {
    guildId: string;
    initial: CardBodyState;
    cb: CardBodyCallbacks;
}): ContentSectionParts {
    const { guildId, initial, cb } = args;
    const formatTextarea = glassTextarea({
        value: initial.contentTemplate,
        ariaLabel: FORMAT_LABEL,
        context: "edit the message content template",
        meta: ["input"],
    });
    wireInput(formatTextarea.el, () => cb.onContentChange(formatTextarea.el.value));
    const chips = buildTokenChips(cb.getTriggerType, formatTextarea.el);
    const emojiPicker = buildEmojiPicker({
        guildId,
        getTriggerType: cb.getTriggerType,
        onInsert: (text) => insertAtCursor(formatTextarea.el, text),
    });
    return {
        formatTextarea,
        contentSection: div(baseProps([]), [formatTextarea, chips, emojiPicker]),
    };
}
