import { div, form, label, paragraph, span, type Instance } from "../../../../factory";
import { FORM_CLAIM_FORM, FORM_FIELD, FORM_FIELD_LABEL, FORM_FORM_ROW } from "../../../../forms/form-classes.js";
import { ACCOUNT_INSTRUCTIONS_CLASS } from "../../../../../shared/constants/account-constants.js";

const INSTRUCTIONS_TEXT =
    "Log into RuneLite as the RSN that holds Owner or Deputy Owner in this clan, then submit. The plugin will report ur active clan automatically and a confirm prompt appears in the side panel within seconds.";

function buildClaimBody(args: {
    rsnInput: Instance;
    errorEl: Instance;
    submitBtn: Instance;
    cancelBtn: Instance;
}): Instance[] {
    return [
        paragraph({ classes: [ACCOUNT_INSTRUCTIONS_CLASS], text: INSTRUCTIONS_TEXT, context: null, meta: null }),
        label({ classes: [FORM_FIELD], context: null, meta: null }, [
            span({ classes: [FORM_FIELD_LABEL], text: "Your RSN", context: null, meta: null }),
            args.rsnInput,
        ]),
        args.errorEl,
        div({ classes: [FORM_FORM_ROW], context: null, meta: null }, [args.submitBtn, args.cancelBtn]),
    ];
}

export function buildClaimEl(args: {
    rsnInput: Instance;
    errorEl: Instance;
    submitBtn: Instance;
    cancelBtn: Instance;
    handleSubmit: () => Promise<void>;
}): Instance {
    return form(
        {
            classes: [FORM_CLAIM_FORM],
            context: "claim-a-clan form — submit to request owner/deputy verification via the plugin",
            meta: ["submit", "clan"],
            onSubmit: () => args.handleSubmit(),
        },
        buildClaimBody(args),
    );
}
