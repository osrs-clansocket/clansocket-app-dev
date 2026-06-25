import { derived, paragraph, signal, wireClick, type Instance } from "../../../../../../factory";
import { FORM_ERROR } from "../../../../../../forms/form-classes.js";
import type { DiscordChannelOverwrite } from "../../../../../../../state/discord/client.js";
import { type AddFormSelects, buildAddSelects } from "./mode-addform-selects.js";
import { buildAddButtons } from "./mode-addform-buttons.js";
import { trySubmit } from "../../../../../../../state/discord/permissions/mode-addform-submit.js";

export interface AddFormParts {
    selects: AddFormSelects;
    errorEl: Instance;
    cancelBtn: Instance;
    submitBtn: Instance<HTMLButtonElement>;
    showAddError: (msg: string) => void;
    submittedRef: { v: boolean };
}

export function makeFormParts(args: { guildId: string; bit: number; onClose: () => void }): AddFormParts {
    const selects = buildAddSelects(args.guildId, args.bit);
    const errorSig = signal<string>("");
    const errorEl = paragraph({
        classes: [FORM_ERROR],
        text: derived(() => errorSig()),
        hidden: "",
        context: null,
        meta: null,
    });
    const { cancelBtn, submitBtn } = buildAddButtons(args.onClose);
    const submittedRef = { v: false };
    const showAddError = (msg: string): void => {
        errorSig.set(msg);
        errorEl.el.hidden = false;
        submittedRef.v = false;
        submitBtn.el.disabled = false;
    };
    return { selects, errorEl, cancelBtn, submitBtn, showAddError, submittedRef };
}

async function runSubmit(args: {
    parts: AddFormParts;
    guildId: string;
    bit: number;
    getLatest: () => readonly DiscordChannelOverwrite[];
    onClose: () => void;
}): Promise<void> {
    const { parts, guildId, bit, getLatest, onClose } = args;
    if (parts.submittedRef.v) return;
    parts.submittedRef.v = true;
    parts.submitBtn.el.disabled = true;
    try {
        await trySubmit({ guildId, bit, getLatest, onClose, selects: parts.selects, showAddError: parts.showAddError });
    } catch (err) {
        void err;
        parts.showAddError(`Failed to add override: ${(err as Error).message}`);
    }
}

export function wireFormSubmit(args: {
    parts: AddFormParts;
    guildId: string;
    bit: number;
    getLatest: () => readonly DiscordChannelOverwrite[];
    onClose: () => void;
}): void {
    wireClick(args.parts.submitBtn.el, () => {
        void runSubmit(args);
    });
}
