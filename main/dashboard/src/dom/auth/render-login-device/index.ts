import { div, heading, paragraph, type Instance, baseProps, textProps } from "../../factory";
import { buildRecoverLink, buildSigninCard } from "./signin-card.js";
import {
    ACCOUNT_SECTION_HINT_CLASS,
    ACCOUNT_SECTION_TITLE_CLASS,
} from "../../../shared/constants/account-constants.js";
import { ROUTE_ACCOUNT_CLASS, ROUTE_ROOT_CLASS } from "../../../shared/constants/route/route-constants.js";

export async function renderLoginDevice(): Promise<Instance> {
    const fallbackHost = div({ context: null, meta: null });
    return div(baseProps([ROUTE_ROOT_CLASS, ROUTE_ACCOUNT_CLASS]), [
        heading("h2", {
            classes: [ACCOUNT_SECTION_TITLE_CLASS],
            text: "Sign in with device",
            context: null,
            meta: null,
        }),
        paragraph(
            textProps(
                [ACCOUNT_SECTION_HINT_CLASS],
                "Passkeys are stored on this device (biometric / PIN / security key). No email needed.",
            ),
        ),
        buildSigninCard(fallbackHost),
        fallbackHost,
        buildRecoverLink(),
    ]);
}
