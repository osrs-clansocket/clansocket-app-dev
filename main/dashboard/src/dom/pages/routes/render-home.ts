import "../../../styles/pages/routes/route-home-page.css";
import { div, type Instance } from "../../factory";
import { ROUTE_HOME_CLASS } from "../../../shared/constants/route/route-constants.js";
import {
    ROUTE_HOME_BENTO_CLASS,
    ROUTE_HOME_CONTAINER_CLASS,
    ROUTE_HOME_HERO_BAND_CLASS,
} from "../../../shared/constants/route/route-home-constants.js";
import { buildHero, buildHeroControls, buildHeroLogo } from "./render-home-hero.js";
import {
    buildAbout,
    buildCommunity,
    buildDownloads,
    buildResources,
} from "../../../state/home/render-home-sections.js";
import { buildLegal } from "./render-home-footer.js";

function renderHome(): Instance {
    const logoWrapper = buildHeroLogo();
    const heroBand = div({ classes: [ROUTE_HOME_HERO_BAND_CLASS], context: null, meta: null }, [
        logoWrapper,
        buildHero(),
    ]);
    const heroControls = buildHeroControls();
    const bento = div({ classes: [ROUTE_HOME_BENTO_CLASS], context: null, meta: null }, [
        buildAbout(),
        buildCommunity(),
        buildDownloads(),
        buildResources(),
        buildLegal(),
    ]);
    const container = div({ classes: [ROUTE_HOME_CONTAINER_CLASS], context: null, meta: null }, [bento]);
    return div({ classes: [ROUTE_HOME_CLASS], context: null, meta: null }, [heroBand, heroControls, container]);
}

export { renderHome };
