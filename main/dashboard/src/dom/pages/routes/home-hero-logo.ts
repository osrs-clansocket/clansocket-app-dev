import { div, type Instance, baseProps } from "../../factory";
import { clanIcon } from "../../factory/data-ops/identity/clan-icon.js";
import { ROUTE_HOME_HERO_LOGO_CLASS } from "../../../shared/constants/route/route-home-constants.js";
import {
    SITE_LOGO_THUMBNAIL_SIZES,
    SITE_LOGO_SLUG,
    SITE_LOGO_THUMBNAIL_SRCSET,
    SITE_LOGO_THUMBNAIL_URL,
} from "../../../shared/constants/home/render-home-data.js";

export function buildHeroLogo(): Instance {
    const logoWrapper = div(baseProps([ROUTE_HOME_HERO_LOGO_CLASS]));
    logoWrapper.addChild(
        clanIcon({
            slug: SITE_LOGO_SLUG,
            thumbnailUrl: SITE_LOGO_THUMBNAIL_URL,
            thumbnailSrcset: SITE_LOGO_THUMBNAIL_SRCSET,
            thumbnailSizes: SITE_LOGO_THUMBNAIL_SIZES,
            eager: true,
            context: null,
            meta: null,
        }),
    );
    return logoWrapper;
}
