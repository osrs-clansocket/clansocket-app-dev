import { div, input, type Instance, baseProps } from "../../../../factory";
import { MIN_SEARCH_LEN, SEARCH_DEBOUNCE_MS } from "./constants.js";
import { buildMgmtBtns, buildMgmtForm, submitManagerRequests, type ReqMgmtRefs } from "./mgmt-form.js";
import {
    buildClanField,
    buildHintEl,
    buildOpenBtn,
    fillRefsControllers,
    makeEmptyRefs,
    makeResetForm,
} from "./mgmt-shell.js";
import { ACCOUNT_ADD_CLAN_CLASS } from "../../../../../shared/constants/account-constants.js";

function makeInputHandler(refs: ReqMgmtRefs, debounceRef: { t: ReturnType<typeof setTimeout> | null }): () => void {
    return () => {
        const q = refs.clanInput.el.value.trim();
        if (debounceRef.t !== null) clearTimeout(debounceRef.t);
        if (q.length < MIN_SEARCH_LEN) {
            refs.search.closeAndClear();
            return;
        }
        debounceRef.t = setTimeout(() => void refs.search.runSearch(q), SEARCH_DEBOUNCE_MS);
    };
}

function buildSearchInput(
    refs: ReqMgmtRefs,
    debounceRef: { t: ReturnType<typeof setTimeout> | null },
): Instance<HTMLInputElement> {
    return input({
        type: "text",
        autocomplete: "off",
        placeholder: "Type a clan name",
        ariaLabel: "Clan name",
        context: "search for a clan by name",
        meta: ["input", "clan"],
        onInput: makeInputHandler(refs, debounceRef),
        onKeydown: (e) => {
            if (e.key === "Backspace" && refs.clanInput.el.value.length === 0 && refs.chips.selectedClans.size > 0) {
                e.preventDefault();
                refs.chips.removeLast();
            }
        },
    });
}

export function buildRequestManagement(onResolved: () => void): Instance {
    const formElRef: { el: Instance | null } = { el: null };
    const openBtnRef: { btn: Instance<HTMLButtonElement> | null } = { btn: null };
    const openBtn = buildOpenBtn({ formElRef, openBtnRef });
    const debounceRef: { t: ReturnType<typeof setTimeout> | null } = { t: null };
    const refs = makeEmptyRefs(openBtn, formElRef);
    const clanInput = buildSearchInput(refs, debounceRef);
    refs.clanInput = clanInput;
    const { clanField, dropdown } = buildClanField(clanInput);
    fillRefsControllers(refs, clanField, clanInput, dropdown);
    const resetForm = makeResetForm(refs, clanInput);
    const { submitBtn, cancelBtn } = buildMgmtBtns({ refs, openBtn, resetForm });
    const formEl = buildMgmtForm({
        refs,
        clanField,
        dropdown,
        submitBtn,
        cancelBtn,
        hintEl: buildHintEl(),
        onSubmit: () => submitManagerRequests(refs, resetForm, onResolved),
    });
    formEl.el.hidden = true;
    formElRef.el = formEl;
    return div(baseProps([ACCOUNT_ADD_CLAN_CLASS]), [openBtn, formEl]);
}
