import { div, form, type Instance, baseProps } from "../../../../factory";
import { FORM_CLAIM_FORM, FORM_FORM_ROW } from "../../../../forms/form-classes.js";
import type { ReqMgmtRefs } from "./mgmt-types.js";

export type { ReqMgmtRefs } from "./mgmt-types.js";
export { submitManagerRequests } from "./mgmt-submit.js";
export { buildMgmtBtns, type MgmtBtnDeps } from "./mgmt-buttons.js";

export interface BuildMgmtArgs {
    refs: ReqMgmtRefs;
    clanField: Instance;
    dropdown: Instance;
    submitBtn: Instance;
    cancelBtn: Instance;
    hintEl: Instance;
    onSubmit: () => Promise<void> | void;
}

export function buildMgmtForm(args: BuildMgmtArgs): Instance {
    return form(
        {
            classes: [FORM_CLAIM_FORM],
            context: "join-clan-as-manager form — submit to request management of the selected clans",
            meta: ["submit", "clan"],
            onSubmit: () => args.onSubmit(),
        },
        [
            args.hintEl,
            args.clanField,
            args.dropdown,
            args.refs.rsnInput,
            args.refs.statusEl,
            args.refs.errorEl,
            div(baseProps([FORM_FORM_ROW]), [args.submitBtn, args.cancelBtn]),
        ],
    );
}
