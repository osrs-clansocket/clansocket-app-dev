import { div, type Instance } from "../../factory";
import { clanModelIcon } from "../../factory/data-ops/identity/clan-model-icon.js";
import { siteOwnerStore } from "../../../state/identity/stores/site-owner-store.js";
import { ROUTE_HOME_HERO_LOGO_CLASS } from "../../../shared/constants/route/route-home-constants.js";
import {
    MOBILE_LOGO_PAN_X,
    SITE_LOGO_RECORD_URL,
    SITE_LOGO_SLUG,
    SITE_LOGO_THUMBNAIL_URL,
} from "../../../shared/constants/home/render-home-data.js";

function withVersion(url: string, version: string): string {
    if (version.length === 0) return url;
    const sep = url.includes("?") ? "&" : "?";
    return `${url}${sep}v=${version}`;
}

export function buildHeroLogo(): Instance {
    const version = siteOwnerStore.logoVersion();
    const logoWrapper = div({ classes: [ROUTE_HOME_HERO_LOGO_CLASS], context: null, meta: null });
    logoWrapper.addChild(
        clanModelIcon({
            slug: SITE_LOGO_SLUG,
            recordUrl: withVersion(SITE_LOGO_RECORD_URL, version),
            thumbnailUrl: withVersion(SITE_LOGO_THUMBNAIL_URL, version),
            mobilePanX: MOBILE_LOGO_PAN_X,
            context: null,
            meta: null,
        }),
    );
    return logoWrapper;
}
