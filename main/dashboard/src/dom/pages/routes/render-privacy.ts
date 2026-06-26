import "../../../styles/pages/routes/route-legal-page.css";
import { anchor, div, heading, paragraph, type Instance, baseProps, textProps } from "../../factory";
import {
    ROUTE_LEGAL_BACK_CLASS,
    ROUTE_LEGAL_BODY_CLASS,
    ROUTE_LEGAL_CLASS,
    ROUTE_LEGAL_TITLE_CLASS,
} from "../../../shared/constants/route/route-constants.js";

const BODY_TEXT = "privacy policy placeholder. real content lands here once the legal text is written.";

function buildBackLink(): Instance {
    return anchor({
        href: "/",
        data: { route: "" },
        classes: [ROUTE_LEGAL_BACK_CLASS],
        text: "← Back to home",
        context: "return to the home page",
        meta: ["nav"],
    });
}

async function renderPrivacy(): Promise<Instance> {
    return div(baseProps([ROUTE_LEGAL_CLASS]), [
        heading("h1", {
            classes: [ROUTE_LEGAL_TITLE_CLASS],
            text: "Privacy Policy",
            context: null,
            meta: null,
        }),
        paragraph(textProps([ROUTE_LEGAL_BODY_CLASS], BODY_TEXT)),
        buildBackLink(),
    ]);
}

export { renderPrivacy };
