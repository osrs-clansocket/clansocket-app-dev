import { button, icon, span, textProps } from "../../factory";
import {
    DASH_LOGIN_OPTION_CLASS,
    DASH_LOGIN_OPTION_TEXT_CLASS,
} from "../../../shared/constants/dashboard-shell-constants.js";

interface LoginOptionSpec {
    provider: string;
    iconName: string;
    label: string;
}

export const LOGIN_OPTIONS: ReadonlyArray<LoginOptionSpec> = [
    { provider: "github", iconName: "github", label: "GitHub" },
    { provider: "discord", iconName: "discord", label: "Discord" },
    { provider: "device", iconName: "fingerprint", label: "Device" },
];

export function buildLoginOption(spec: LoginOptionSpec): HTMLElement {
    return button(
        {
            classes: [DASH_LOGIN_OPTION_CLASS],
            data: { "login-provider": spec.provider },
            ariaLabel: `Sign in with ${spec.label}`,
            context: `sign in with ${spec.label}`,
            meta: ["action", "account"],
        },
        [
            icon({ provider: "bi", name: spec.iconName, ariaHidden: true, context: null, meta: null }).el,
            span(textProps([DASH_LOGIN_OPTION_TEXT_CLASS], spec.label)).el,
        ],
    ).el;
}
