import { div, heading, paragraph, section, type Instance, baseProps, textProps } from "../../factory";
import {
    ROUTE_HOME_HERO_CLASS,
    ROUTE_HOME_HERO_COPY_CLASS,
    ROUTE_HOME_HERO_TAGLINE_CLASS,
    ROUTE_HOME_HERO_TITLE_CLASS,
} from "../../../shared/constants/route/route-home-constants.js";
import { buildHeroLogo } from "./home-hero-logo.js";

export { externalAnchor } from "./home-external-anchor.js";
export { buildHeroLogo } from "./home-hero-logo.js";

export function buildHero(): Instance {
    const logo = buildHeroLogo();
    const title = heading("h1", {
        classes: [ROUTE_HOME_HERO_TITLE_CLASS],
        text: "ClanSocket",
        context: null,
        meta: null,
    });
    const tagline = paragraph(
        textProps([ROUTE_HOME_HERO_TAGLINE_CLASS], "Live, Open-Source platform for Old School RuneScape clans"),
    );
    const copy = div(baseProps([ROUTE_HOME_HERO_COPY_CLASS]), [title, tagline]);
    return section(baseProps([ROUTE_HOME_HERO_CLASS]), [logo, copy]);
}
