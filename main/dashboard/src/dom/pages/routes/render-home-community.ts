import { heading, paragraph, section, span, type Instance } from "../../factory";
import {
    ROUTE_HOME_COMMUNITY_CLASS,
    ROUTE_HOME_COMMUNITY_CTA_CLASS,
    ROUTE_HOME_COMMUNITY_CTA_ICON_CLASS,
    ROUTE_HOME_COMMUNITY_CTA_LABEL_CLASS,
    ROUTE_HOME_COMMUNITY_TILE_CLASS,
    ROUTE_HOME_SECTION_BODY_CLASS,
    ROUTE_HOME_SECTION_CLASS,
    ROUTE_HOME_SECTION_TITLE_CLASS,
    TI_BASE_CLASS,
    TI_BRAND_DISCORD_CLASS,
} from "../../../shared/constants/route/route-home-constants.js";
import { COMMUNITY_BODY, URL_DISCORD_INVITE } from "../../../shared/constants/home/render-home-data.js";
import { externalAnchor } from "./home-external-anchor.js";

function buildCommunityCta(): Instance {
    return externalAnchor({
        href: URL_DISCORD_INVITE,
        classes: [ROUTE_HOME_COMMUNITY_CTA_CLASS],
        context: "open the Clan Central discord invite in a new tab",
        children: [
            span({
                classes: [TI_BASE_CLASS, TI_BRAND_DISCORD_CLASS, ROUTE_HOME_COMMUNITY_CTA_ICON_CLASS],
                ariaHidden: "true",
                context: null,
                meta: null,
            }),
            span({
                classes: [ROUTE_HOME_COMMUNITY_CTA_LABEL_CLASS],
                text: "Join Clan Central →",
                context: null,
                meta: null,
            }),
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
            paragraph({ classes: [ROUTE_HOME_SECTION_BODY_CLASS], text: COMMUNITY_BODY, context: null, meta: null }),
            buildCommunityCta(),
        ],
    );
}
