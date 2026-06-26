import "../../../styles/components/cards/card-grid-component.css";
import "../../../styles/components/cards/surface-card-component.css";
import "./panels";
import { div, heading, section, type Instance, baseProps } from "../../factory";
import { accountPanelDefs } from "./registry";
import { ACCOUNT_CARD_CLASS, ACCOUNT_SECTION_TITLE_CLASS } from "../../../shared/constants/account-constants.js";
import { CARD_GRID_CLASS, SURFACE_CARD_CLASS } from "../../../shared/constants/card-component-constants.js";

function wrapAsCard(child: Instance): Instance {
    return div(baseProps([SURFACE_CARD_CLASS]), [child]);
}

export function accountSection(): Instance {
    const cards = accountPanelDefs().map((def) => wrapAsCard(def.build()));
    return section(baseProps([ACCOUNT_CARD_CLASS]), [
        heading("h2", {
            classes: [ACCOUNT_SECTION_TITLE_CLASS],
            text: "Your ClanSocket account",
            context: null,
            meta: null,
        }),
        div(baseProps([CARD_GRID_CLASS]), cards),
    ]);
}
