import { createInstance, div, heading, modal, paragraph, type Instance } from "../../../factory/index.js";
import { ACCOUNT_EMPTY_CLASS } from "../../../../shared/constants/account-constants.js";
import { buildActionBtn, buildRecoverLink, buildSigninLink, buildTextInput } from "./glass-signup-parts.js";

type SignupPromptResult = { kind: "signup"; displayName: string; deviceName: string | null } | { kind: "signin" };

const OVERLAY_CLASS = "glass-confirm__overlay";
const DIALOG_CLASS = "glass-confirm";
const OPEN_CLASS = "glass-confirm--open";
const TITLE_CLASS = "glass-confirm__title";
const MESSAGE_CLASS = "glass-confirm__message";
const ACTIONS_CLASS = "glass-confirm__actions";
const NAME_MAXLEN = 64;
const CLOSE_RESOLVE_DELAY_MS = 220;

interface SignupFields {
    nameInput: Instance<HTMLInputElement>;
    deviceInput: Instance<HTMLInputElement>;
    status: Instance;
}

function buildSignupFields(): SignupFields {
    const nameInput = buildTextInput("display name", NAME_MAXLEN);
    const deviceInput = buildTextInput("device name (optional)", NAME_MAXLEN);
    const status = paragraph({ classes: [ACCOUNT_EMPTY_CLASS], context: null, meta: null });
    status.el.hidden = true;
    return { nameInput, deviceInput, status };
}

function makeSignupSubmit(fields: SignupFields, settle: (r: SignupPromptResult | null) => void): () => void {
    return () => {
        const display = fields.nameInput.el.value.trim();
        if (display.length === 0) {
            fields.status.el.hidden = false;
            fields.status.setText("display name required.");
            fields.nameInput.el.focus();
            return;
        }
        settle({ kind: "signup", displayName: display, deviceName: fields.deviceInput.el.value.trim() || null });
    };
}

function buildSignupContent(args: {
    fields: SignupFields;
    actions: Instance;
    settle: (r: SignupPromptResult | null) => void;
}): Instance[] {
    const { fields, actions, settle } = args;
    return [
        heading("h2", { classes: [TITLE_CLASS], text: "Create ClanSocket account", context: null, meta: null }),
        paragraph({
            classes: [MESSAGE_CLASS],
            text: "No ClanSocket passkey found on this device.",
            context: null,
            meta: null,
        }),
        fields.nameInput,
        fields.deviceInput,
        fields.status,
        buildSigninLink(() => settle({ kind: "signin" })),
        actions,
        buildRecoverLink(),
    ];
}

function buildSignupModal(
    fields: SignupFields,
    settle: (r: SignupPromptResult | null) => void,
    submit: () => void,
): ReturnType<typeof modal> {
    const actions = div({ classes: [ACTIONS_CLASS], context: null, meta: null }, [
        buildActionBtn("Cancel", "cancel", () => settle(null)),
        buildActionBtn("Continue", "confirm", submit),
    ]);
    return modal(
        {
            overlayClasses: [OVERLAY_CLASS],
            dialogClasses: [DIALOG_CLASS],
            openClass: OPEN_CLASS,
            context: null,
            meta: null,
            onClose: () => settle(null),
            initialFocus: () => fields.nameInput.el,
        },
        buildSignupContent({ fields, actions, settle }),
    );
}

function promptPasskeySignup(): Promise<SignupPromptResult | null> {
    return new Promise((resolve) => {
        let settled = false;
        const fields = buildSignupFields();
        const mRef: { m: ReturnType<typeof modal> | null } = { m: null };
        const settle = (result: SignupPromptResult | null): void => {
            if (settled) return;
            settled = true;
            mRef.m?.dismiss();
            window.setTimeout(() => resolve(result), CLOSE_RESOLVE_DELAY_MS);
        };
        const submit = makeSignupSubmit(fields, settle);
        const m = buildSignupModal(fields, settle, submit);
        mRef.m = m;
        m.dialogEl.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                submit();
            }
        });
        createInstance(document.body).addChild(m);
        m.open();
    });
}

export { promptPasskeySignup };
export type { SignupPromptResult };
