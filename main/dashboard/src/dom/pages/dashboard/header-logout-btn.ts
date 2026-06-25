import { button } from "../../factory";
import { DASH_LOGOUT_CLASS, ICONBTN_CLASS } from "../../../shared/constants/dashboard-shell-constants.js";
import { bsSpan } from "./header-bs-span.js";

export function buildLogoutBtn(): HTMLElement {
    return button(
        {
            classes: [DASH_LOGOUT_CLASS, ICONBTN_CLASS],
            ariaLabel: "Sign out",
            title: "Sign out",
            hidden: "",
            data: { logout: "" },
            context: "sign out of your account",
            meta: ["action", "account"],
        },
        [bsSpan("bi-box-arrow-right")],
    ).el;
}
