import "../../../styles/pages/routes/route-home-page.css";
import { div, type Instance, baseProps } from "../../factory";
import { ROUTE_HOME_CLASS } from "../../../shared/constants/route/route-constants.js";
import {
    ROUTE_HOME_BENTO_CLASS,
    ROUTE_HOME_CONTAINER_CLASS,
    ROUTE_HOME_HERO_BAND_CLASS,
} from "../../../shared/constants/route/route-home-constants.js";
import { buildHero } from "./render-home-hero.js";
import {
    buildAbout,
    buildCommunity,
    buildDownloads,
    buildResources,
} from "../../../state/home/render-home-sections.js";
import { buildLegal } from "./render-home-footer.js";

function renderHome(): Instance {
    const heroBand = div(baseProps([ROUTE_HOME_HERO_BAND_CLASS]), [buildHero()]);
    const heroControlsHost = div({ context: null, meta: null });
    void import("./home-hero-controls.js").then(({ buildHeroControls }) => {
        heroControlsHost.addChild(buildHeroControls());
    });
    const bento = div(baseProps([ROUTE_HOME_BENTO_CLASS]), [
        buildAbout(),
        buildCommunity(),
        buildDownloads(),
        buildResources(),
        buildLegal(),
    ]);
    const container = div(baseProps([ROUTE_HOME_CONTAINER_CLASS]), [bento]);
    return div(baseProps([ROUTE_HOME_CLASS]), [heroBand, heroControlsHost, container]);
}

export { renderHome };
