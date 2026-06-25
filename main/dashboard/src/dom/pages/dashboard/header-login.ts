import { button, div } from "../../factory";
import {
    DASH_LOGIN_CLASS,
    DASH_LOGIN_GROUP_CLASS,
    DASH_LOGIN_POPOVER_CLASS,
    ICONBTN_CLASS,
} from "../../../shared/constants/dashboard-shell-constants.js";
import { bsSpan } from "./header-bs-span.js";
import { LOGIN_OPTIONS, buildLoginOption } from "./header-login-options.js";

export { buildLogoutBtn } from "./header-logout-btn.js";

export function buildLoginGroup(): HTMLElement {
    const loginBtn = button(
        {
            classes: [DASH_LOGIN_CLASS, ICONBTN_CLASS],
            ariaLabel: "Sign in",
            title: "Sign in",
            hidden: "",
            data: { login: "" },
            context: "open the sign-in provider menu",
            meta: ["action", "account"],
        },
        [bsSpan("bi-box-arrow-in-right")],
    );
    const popover = div(
        {
            classes: [DASH_LOGIN_POPOVER_CLASS],
            hidden: "",
            data: { "login-popover": "" },
            context: null,
            meta: null,
        },
        LOGIN_OPTIONS.map(buildLoginOption),
    );
    return div({ classes: [DASH_LOGIN_GROUP_CLASS], context: null, meta: null }, [loginBtn.el, popover.el]).el;
}
