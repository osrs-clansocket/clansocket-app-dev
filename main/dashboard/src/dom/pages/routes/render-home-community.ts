import { heading, icon, paragraph, section, span, type Instance, textProps } from "../../factory";
import {
    ROUTE_HOME_COMMUNITY_CLASS,
    ROUTE_HOME_COMMUNITY_CTA_CLASS,
    ROUTE_HOME_COMMUNITY_CTA_ICON_CLASS,
    ROUTE_HOME_COMMUNITY_CTA_LABEL_CLASS,
    ROUTE_HOME_COMMUNITY_DISCLAIMER_CLASS,
    ROUTE_HOME_COMMUNITY_TILE_CLASS,
    ROUTE_HOME_SECTION_BODY_CLASS,
    ROUTE_HOME_SECTION_CLASS,
    ROUTE_HOME_SECTION_TITLE_CLASS,
} from "../../../shared/constants/route/route-home-constants.js";
import {
    COMMUNITY_BODY,
    COMMUNITY_DISCLAIMER,
    URL_DISCORD_INVITE,
} from "../../../shared/constants/home/render-home-data.js";
import { externalAnchor } from "./home-external-anchor.js";

function buildCommunityCta(): Instance {
    return externalAnchor({
        href: URL_DISCORD_INVITE,
        classes: [ROUTE_HOME_COMMUNITY_CTA_CLASS],
        context: "open the Clan Central discord invite in a new tab",
        children: [
            icon({
                provider: "ti",
                name: "brand-discord",
                classes: [ROUTE_HOME_COMMUNITY_CTA_ICON_CLASS],
                ariaHidden: true,
                context: null,
                meta: null,
            }),
            span(textProps([ROUTE_HOME_COMMUNITY_CTA_LABEL_CLASS], "Join Clan Central →")),
        ],
    });
}

export function buildCommunity(): Instance {
    return section(
        {
            classes: [ROUTE_HOME_SECTION_CLASS, ROUTE_HOME_COMMUNITY_CLASS, ROUTE_HOME_COMMUNITY_TILE_CLASS],
            context: null,
            meta: null,
        },
        [
            heading("h2", {
                classes: [ROUTE_HOME_SECTION_TITLE_CLASS],
                text: "Clan Central",
                context: null,
                meta: null,
            }),
            paragraph(textProps([ROUTE_HOME_SECTION_BODY_CLASS], COMMUNITY_BODY)),
            buildCommunityCta(),
            paragraph(textProps([ROUTE_HOME_COMMUNITY_DISCLAIMER_CLASS], COMMUNITY_DISCLAIMER)),
        ],
    );
}
