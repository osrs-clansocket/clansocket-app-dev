import { button, span } from "../../factory";
import {
    DASH_LOGIN_OPTION_CLASS,
    DASH_LOGIN_OPTION_TEXT_CLASS,
} from "../../../shared/constants/dashboard-shell-constants.js";
import { bsSpan } from "./header-bs-span.js";

interface LoginOptionSpec {
    provider: string;
    iconClass: string;
    label: string;
}

export const LOGIN_OPTIONS: ReadonlyArray<LoginOptionSpec> = [
    { provider: "github", iconClass: "bi-github", label: "GitHub" },
    { provider: "discord", iconClass: "bi-discord", label: "Discord" },
    { provider: "device", iconClass: "bi-fingerprint", label: "Device" },
];

export function buildLoginOption(spec: LoginOptionSpec): HTMLElement {
    return button(
        {
            classes: [DASH_LOGIN_OPTION_CLASS],
            data: { "login-provider": spec.provider },
            context: `sign in with ${spec.label}`,
            meta: ["action", "account"],
        },
        [
            bsSpan(spec.iconClass),
            span({ classes: [DASH_LOGIN_OPTION_TEXT_CLASS], text: spec.label, context: null, meta: null }).el,
        ],
    ).el;
}
