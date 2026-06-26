import { button, icon } from "../../factory";
import { DASH_LOGOUT_CLASS, ICONBTN_CLASS } from "../../../shared/constants/dashboard-shell-constants.js";

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
        [icon({ provider: "bi", name: "box-arrow-right", ariaHidden: true, context: null, meta: null }).el],
    ).el;
}
