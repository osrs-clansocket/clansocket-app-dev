import { div, heading, section, span, type Instance } from "../../factory";
import {
    ROUTE_HOME_RESOURCE_CLASS,
    ROUTE_HOME_RESOURCE_DESC_CLASS,
    ROUTE_HOME_RESOURCE_ICON_CLASS,
    ROUTE_HOME_RESOURCE_TITLE_CLASS,
    ROUTE_HOME_RESOURCES_CLASS,
    ROUTE_HOME_RESOURCES_TILE_CLASS,
    ROUTE_HOME_SECTION_CLASS,
    ROUTE_HOME_SECTION_TITLE_CLASS,
} from "../../../shared/constants/route/route-home-constants.js";
import { RESOURCES, type ResourceLink } from "../../../shared/constants/home/render-home-data.js";
import { externalAnchor } from "./home-external-anchor.js";

function buildResourceLink(r: ResourceLink): Instance {
    return externalAnchor({
        href: r.href,
        classes: [ROUTE_HOME_RESOURCE_CLASS],
        context: `open ${r.title} in a new tab`,
        children: [
            span({
                classes: [...r.iconClasses, ROUTE_HOME_RESOURCE_ICON_CLASS],
                ariaHidden: "true",
                context: null,
                meta: null,
            }),
            span({ classes: [ROUTE_HOME_RESOURCE_TITLE_CLASS], text: r.title, context: null, meta: null }),
            span({ classes: [ROUTE_HOME_RESOURCE_DESC_CLASS], text: r.desc, context: null, meta: null }),
        ],
    });
}

export function buildResources(): Instance {
    const grid = div(
        { classes: [ROUTE_HOME_RESOURCES_CLASS], context: null, meta: null },
        RESOURCES.map(buildResourceLink),
    );
    return section(
        { classes: [ROUTE_HOME_SECTION_CLASS, ROUTE_HOME_RESOURCES_TILE_CLASS], context: null, meta: null },
        [
            heading("h2", { classes: [ROUTE_HOME_SECTION_TITLE_CLASS], text: "Resources", context: null, meta: null }),
            grid,
        ],
    );
}
