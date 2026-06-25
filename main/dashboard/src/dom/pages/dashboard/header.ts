import { anchor, button, div, header, heading, image, nav, span } from "../../factory";
import { buildZoomControl } from "./zoom-control.js";
import { buildLoginGroup, buildLogoutBtn } from "./header-login.js";
import {
    DASH_BRAND_CLASS,
    DASH_CONTROLS_CLASS,
    DASH_HEADER_CLASS,
    DASH_LOGO_CLASS,
    DASH_LOGO_LINK_CLASS,
    DASH_NAV_CLASS,
    DASH_NAV_ICON_CLASS,
    DASH_NAV_ICON_TEMPLATE_CLASS,
    DASH_NAV_RAIL_CLASS,
    DASH_NAV_VIEWPORT_CLASS,
    DASH_SUBTITLE_CLASS,
    DASH_TITLE_CLASS,
} from "../../../shared/constants/dashboard-shell-constants.js";

const BS_ICON = "bi";

function buildNavSection(): HTMLElement {
    const navRail = div({ classes: [DASH_NAV_RAIL_CLASS], data: { "nav-rail": "" }, context: null, meta: null });
    const navIconTemplate = button(
        {
            classes: [DASH_NAV_ICON_CLASS, DASH_NAV_ICON_TEMPLATE_CLASS],
            ariaLabel: "Navigation item",
            hidden: "",
            data: { "nav-icon-template": "" },
            context: "navigate to this clan's page",
            meta: ["nav", "clan"],
        },
        [
            span({ classes: [BS_ICON], ariaHidden: "true", data: { "nav-icon-glyph": "" }, context: null, meta: null })
                .el,
        ],
    );
    return nav(
        { classes: [DASH_NAV_CLASS], ariaLabel: "Site navigation", role: "navigation", context: null, meta: null },
        [div({ classes: [DASH_NAV_VIEWPORT_CLASS], context: null, meta: null }, [navRail.el]).el, navIconTemplate.el],
    ).el;
}

function buildBrand(): HTMLElement {
    return div({ classes: [DASH_BRAND_CLASS], context: null, meta: null }, [
        anchor(
            {
                href: "/",
                classes: [DASH_LOGO_LINK_CLASS],
                ariaLabel: "Home",
                title: "Home",
                context: "navigate to the homepage",
                meta: ["nav"],
            },
            [
                image({
                    src: "/favicon.ico",
                    alt: "ClanSocket logo",
                    classes: [DASH_LOGO_CLASS],
                    context: null,
                    meta: null,
                }).el,
            ],
        ).el,
        heading("h1", { classes: [DASH_TITLE_CLASS], text: "ClanSocket", context: null, meta: null }).el,
        span({ classes: [DASH_SUBTITLE_CLASS], key: "dash-subtitle", text: "", context: null, meta: null }).el,
    ]).el;
}

function buildControls(): HTMLElement {
    return div({ classes: [DASH_CONTROLS_CLASS], context: null, meta: null }, [
        buildZoomControl(),
        buildLoginGroup(),
        buildLogoutBtn(),
    ]).el;
}

export function buildHeader(): HTMLElement {
    return header({ classes: [DASH_HEADER_CLASS], context: null, meta: null }, [
        buildBrand(),
        buildNavSection(),
        buildControls(),
    ]).el;
}
