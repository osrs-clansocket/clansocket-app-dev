import { div, heading, paragraph, section, type Instance } from "../../factory";
import {
    ROUTE_HOME_HERO_CLASS,
    ROUTE_HOME_HERO_COPY_CLASS,
    ROUTE_HOME_HERO_TAGLINE_CLASS,
    ROUTE_HOME_HERO_TITLE_CLASS,
} from "../../../shared/constants/route/route-home-constants.js";

export { externalAnchor } from "./home-external-anchor.js";
export { buildHeroControls } from "./home-hero-controls.js";
export { buildHeroLogo } from "./home-hero-logo.js";

export function buildHero(): Instance {
    const title = heading("h1", {
        classes: [ROUTE_HOME_HERO_TITLE_CLASS],
        text: "ClanSocket",
        context: null,
        meta: null,
    });
    const tagline = paragraph({
        classes: [ROUTE_HOME_HERO_TAGLINE_CLASS],
        text: "Live, Open-Source platform for Old School RuneScape clans",
        context: null,
        meta: null,
    });
    const copy = div({ classes: [ROUTE_HOME_HERO_COPY_CLASS], context: null, meta: null }, [title, tagline]);
    return section({ classes: [ROUTE_HOME_HERO_CLASS], context: null, meta: null }, [copy]);
}
