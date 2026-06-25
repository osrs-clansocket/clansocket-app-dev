import { div, paragraph, section, span, type Instance } from "../../factory";
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
    return div({ classes: [ROUTE_HOME_CAPABILITY_TILE_CLASS], context: null, meta: null }, [
        span({
            classes: [...c.iconClasses, ROUTE_HOME_CAPABILITY_ICON_CLASS],
            ariaHidden: "true",
            context: null,
            meta: null,
        }),
        span({ classes: [ROUTE_HOME_CAPABILITY_TITLE_CLASS], text: c.title, context: null, meta: null }),
        paragraph({ classes: [ROUTE_HOME_CAPABILITY_DESC_CLASS], text: c.desc, context: null, meta: null }),
    ]);
}

export function buildAbout(): Instance {
    const grid = div(
        { classes: [ROUTE_HOME_CAPABILITY_GRID_CLASS], context: null, meta: null },
        CAPABILITIES.map(buildCapabilityTile),
    );
    return section({ classes: [ROUTE_HOME_SECTION_CLASS, ROUTE_HOME_ABOUT_TILE_CLASS], context: null, meta: null }, [
        grid,
    ]);
}
