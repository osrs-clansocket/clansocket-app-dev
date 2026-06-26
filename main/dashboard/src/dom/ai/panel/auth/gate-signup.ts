import { anchor, button, div, heading, input, paragraph, type Instance, baseProps, textProps } from "../../../factory";
import { performSignin, performSignup } from "./gate-signup-actions.js";
import { FORM_HINT, FORM_INPUT } from "../../../forms/form-classes.js";
import { ACCOUNT_EMPTY_CLASS } from "../../../../shared/constants/account-constants.js";
import {
    GLASS_CONFIRM_HINT_TEXT_CLASS,
    GLASS_CONFIRM_MESSAGE_CLASS,
    GLASS_CONFIRM_TITLE_CLASS,
} from "../../../../shared/constants/glass-constants.js";
import { AI_BAR_AUTH_SIGNUP_PANEL_CLASS } from "../../../../shared/constants/ai-bar-constants.js";

const FORM_HINT_RIGHT_CLASS = "form__hint--right";
const NAME_MAXLEN = "64";

function buildSignupInputs(): { nameInput: Instance<HTMLInputElement>; deviceInput: Instance<HTMLInputElement> } {
    const nameInput = input({
        classes: [FORM_INPUT],
        ariaLabel: "display name",
        type: "text",
        placeholder: "display name",
        autocomplete: "off",
        maxlength: NAME_MAXLEN,
        context: "enter display name",
        meta: ["input", "account"],
    });
    const deviceInput = input({
        classes: [FORM_INPUT],
        ariaLabel: "device name (optional)",
        type: "text",
        placeholder: "device name (optional)",
        autocomplete: "off",
        maxlength: NAME_MAXLEN,
        context: "enter device name",
        meta: ["input", "account"],
    });
    return { nameInput, deviceInput };
}

function buildSignupSubmit(args: {
    nameInput: Instance<HTMLInputElement>;
    deviceInput: Instance<HTMLInputElement>;
    status: Instance;
}): () => void {
    const { nameInput, deviceInput, status } = args;
    return (): void => {
        const display = nameInput.el.value.trim();
        if (display.length === 0) {
            status.el.hidden = false;
            status.setText("display name required.");
            nameInput.el.focus();
            return;
        }
        void performSignup(display, deviceInput.el.value.trim() || null);
    };
}

function buildSigninLink(): Instance {
    return div(baseProps([FORM_HINT, FORM_HINT_RIGHT_CLASS]), [
        paragraph(textProps([GLASS_CONFIRM_HINT_TEXT_CLASS], "already registered ur device? ")),
        paragraph({ context: null, meta: null }, [
            anchor({
                href: "#",
                text: "sign in here",
                onClick: (e) => {
                    e.preventDefault();
                    void performSignin();
                },
                context: "sign in with existing device passkey",
                meta: ["action", "account"],
            }),
        ]),
    ]);
}

function buildRecoverLink(): Instance {
    return div(baseProps([FORM_HINT]), [
        paragraph(textProps([GLASS_CONFIRM_HINT_TEXT_CLASS], "Lost access to all ur devices? ")),
        paragraph({ context: null, meta: null }, [
            anchor({
                href: "/recover",
                text: "Recover with a backup code",
                onClick: (e) => {
                    e.preventDefault();
                    window.location.assign("/recover");
                },
                context: "open recover flow",
                meta: ["nav", "account"],
            }),
        ]),
    ]);
}

function buildSignupHeader(): Instance[] {
    return [
        heading("h3", {
            classes: [GLASS_CONFIRM_TITLE_CLASS],
            text: "Create ClanSocket account",
            context: null,
            meta: null,
        }),
        paragraph(textProps([GLASS_CONFIRM_MESSAGE_CLASS], "No ClanSocket passkey found on this device.")),
    ];
}

export function buildSignupPanel(): Instance {
    const { nameInput, deviceInput } = buildSignupInputs();
    const status = paragraph(baseProps([ACCOUNT_EMPTY_CLASS]));
    status.el.hidden = true;
    const continueBtn = button({
        text: "Continue",
        context: "submit signup",
        meta: ["submit", "account"],
        onClick: buildSignupSubmit({ nameInput, deviceInput, status }),
    });
    return div(baseProps([AI_BAR_AUTH_SIGNUP_PANEL_CLASS]), [
        ...buildSignupHeader(),
        nameInput,
        deviceInput,
        status,
        buildSigninLink(),
        continueBtn,
        buildRecoverLink(),
    ]);
}
