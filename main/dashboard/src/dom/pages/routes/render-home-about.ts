import { div, icon, paragraph, section, span, type Instance, baseProps, textProps } from "../../factory";
import {
    ROUTE_HOME_ABOUT_TILE_CLASS,
    ROUTE_HOME_CAPABILITY_DESC_CLASS,
    ROUTE_HOME_CAPABILITY_GRID_CLASS,
    ROUTE_HOME_CAPABILITY_ICON_CLASS,
    ROUTE_HOME_CAPABILITY_TILE_CLASS,
    ROUTE_HOME_CAPABILITY_TITLE_CLASS,
    ROUTE_HOME_SECTION_CLASS,
} from "../../../shared/constants/route/route-home-constants.js";
import { CAPABILITIES, type CapabilityCard } from "../../../shared/constants/home/render-home-data.js";

function buildCapabilityTile(c: CapabilityCard): Instance {
    return div(baseProps([ROUTE_HOME_CAPABILITY_TILE_CLASS]), [
        icon({
            provider: c.icon.provider,
            name: c.icon.name,
            classes: [ROUTE_HOME_CAPABILITY_ICON_CLASS],
            ariaHidden: true,
            context: null,
            meta: null,
        }),
        span(textProps([ROUTE_HOME_CAPABILITY_TITLE_CLASS], c.title)),
        paragraph(textProps([ROUTE_HOME_CAPABILITY_DESC_CLASS], c.desc)),
    ]);
}

export function buildAbout(): Instance {
    const grid = div(
        { classes: [ROUTE_HOME_CAPABILITY_GRID_CLASS], context: null, meta: null },
        CAPABILITIES.map(buildCapabilityTile),
    );
    return section(baseProps([ROUTE_HOME_SECTION_CLASS, ROUTE_HOME_ABOUT_TILE_CLASS]), [grid]);
}
