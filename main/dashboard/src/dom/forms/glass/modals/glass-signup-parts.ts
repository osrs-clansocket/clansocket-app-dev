import { anchor, button, div, input, paragraph, type Instance } from "../../../factory/index.js";
import { FORM_HINT as HINT_CLASS, FORM_INPUT as INPUT_CLASS } from "../../form-classes.js";
import { GLASS_CONFIRM_HINT_TEXT_CLASS } from "../../../../shared/constants/glass-constants.js";

const BTN_CLASS = "glass-confirm__btn";
const HINT_RIGHT_CLASS = "form__hint--right";

export function buildTextInput(placeholder: string, maxlen: number): Instance<HTMLInputElement> {
    return input({
        placeholder,
        classes: [INPUT_CLASS],
        ariaLabel: placeholder,
        type: "text",
        autocomplete: "off",
        maxlength: String(maxlen),
        context: `enter ${placeholder}`,
        meta: ["input", "account"],
    });
}

export function buildActionBtn(
    label: string,
    variant: "confirm" | "cancel",
    onClick?: () => void,
): Instance<HTMLButtonElement> {
    return button({
        classes: [BTN_CLASS, `${BTN_CLASS}--${variant}`],
        text: label,
        context: variant === "confirm" ? "confirm and continue the signup" : "cancel the signup dialog",
        meta: variant === "confirm" ? ["submit", "account"] : ["action"],
        onClick,
    });
}

interface HintLinkOpts {
    prefix: string;
    linkText: string;
    href: string;
    onClick: (e: Event) => void;
    extraClasses?: readonly string[];
}

function buildHintLink({ prefix, linkText, href, onClick, extraClasses = [] }: HintLinkOpts): Instance {
    return div({ classes: [HINT_CLASS, ...extraClasses], context: null, meta: null }, [
        paragraph({ classes: [GLASS_CONFIRM_HINT_TEXT_CLASS], text: prefix, context: null, meta: null }),
        paragraph({ context: null, meta: null }, [
            anchor({ href, onClick, text: linkText, context: linkText, meta: ["nav", "account"] }),
        ]),
    ]);
}

export function buildRecoverLink(): Instance {
    return buildHintLink({
        prefix: "Lost access to all ur devices? ",
        linkText: "Recover with a backup code",
        href: "/recover",
        onClick: (e) => {
            e.preventDefault();
            window.location.assign("/recover");
        },
    });
}

export function buildSigninLink(onSignin: () => void): Instance {
    return buildHintLink({
        prefix: "already registered ur device? ",
        linkText: "sign in here",
        href: "#",
        onClick: (e) => {
            e.preventDefault();
            onSignin();
        },
        extraClasses: [HINT_RIGHT_CLASS],
    });
}
