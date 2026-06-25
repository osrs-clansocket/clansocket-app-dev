import { BTN_VARIANT_OUTLINE, button, div, input, paragraph, type Instance } from "../../../../factory";
import { FORM_ERROR, FORM_HINT, FORM_INPUT } from "../../../../forms/form-classes.js";
import { createChipController } from "./chips.js";
import { createSearchController } from "./search-dropdown.js";
import type { ReqMgmtRefs } from "./mgmt-form.js";
import {
    ACCOUNT_AUTOCOMPLETE_CLASS,
    ACCOUNT_INSTRUCTIONS_CLASS,
    ACCOUNT_STATUS_CLASS,
} from "../../../../../shared/constants/account-constants.js";

export function buildOpenBtn(
    refs: Pick<ReqMgmtRefs, "formElRef"> & { openBtnRef: { btn: Instance<HTMLButtonElement> | null } },
): Instance<HTMLButtonElement> {
    const btn: Instance<HTMLButtonElement> = button({
        variant: BTN_VARIANT_OUTLINE,
        compact: true,
        text: "Join clan as manager",
        context: "open the join-clan-as-manager form",
        meta: ["action", "clan"],
        onClick: () => {
            if (refs.formElRef.el) refs.formElRef.el.el.hidden = false;
            btn.el.hidden = true;
        },
    });
    refs.openBtnRef.btn = btn;
    return btn;
}

export function buildClanField(clanInput: Instance<HTMLInputElement>): { clanField: Instance; dropdown: Instance } {
    const clanField = div(
        {
            classes: [FORM_INPUT],
            context: null,
            meta: null,
            onClick: (e) => {
                if (e.target === clanField.el) clanInput.el.focus();
            },
        },
        [clanInput],
    );
    const dropdown = div({ classes: [ACCOUNT_AUTOCOMPLETE_CLASS], context: null, meta: null });
    dropdown.el.hidden = true;
    return { clanField, dropdown };
}

export function buildHintEl(): Instance {
    return paragraph({
        classes: [ACCOUNT_INSTRUCTIONS_CLASS],
        text: "Select one or more clans. Auto-granted if your verified RSN has a whitelisted rank in the clan. Otherwise existing managers approve. The RSN field is optional context.",
        context: null,
        meta: null,
    });
}

export function makeEmptyRefs(openBtn: Instance<HTMLButtonElement>, formElRef: { el: Instance | null }): ReqMgmtRefs {
    return {
        openBtn,
        formElRef,
        clanInput: null as unknown as Instance<HTMLInputElement>,
        chips: null as unknown as ReturnType<typeof createChipController>,
        search: null as unknown as ReturnType<typeof createSearchController>,
        rsnInput: null as unknown as Instance<HTMLInputElement>,
        statusEl: null as unknown as Instance,
        errorEl: null as unknown as Instance,
    };
}

export function fillRefsControllers(
    refs: ReqMgmtRefs,
    clanField: Instance,
    clanInput: Instance<HTMLInputElement>,
    dropdown: Instance,
): void {
    refs.chips = createChipController(clanField, clanInput);
    refs.search = createSearchController(dropdown, refs.chips, clanInput);
    refs.rsnInput = input({
        classes: [FORM_INPUT],
        type: "text",
        autocomplete: "off",
        placeholder: "RSN (optional)",
        ariaLabel: "Your RSN (optional)",
        context: "enter your RSN as optional context for the request",
        meta: ["input", "rsn"],
    });
    refs.statusEl = div({ classes: [FORM_HINT, ACCOUNT_STATUS_CLASS], context: null, meta: null });
    refs.statusEl.el.hidden = true;
    refs.errorEl = paragraph({ classes: [FORM_ERROR], context: null, meta: null });
    refs.errorEl.el.hidden = true;
}

export function makeResetForm(refs: ReqMgmtRefs, clanInput: Instance<HTMLInputElement>): () => void {
    return (): void => {
        for (const slug of [...refs.chips.selectedClans.keys()]) refs.chips.removeChip(slug);
        clanInput.el.value = "";
        refs.rsnInput.el.value = "";
        refs.search.closeAndClear();
    };
}
