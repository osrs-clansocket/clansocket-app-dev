import { anchor, div, footer, span, type Instance } from "../../factory";
import {
    ROUTE_HOME_LEGAL_BMAC_CLASS,
    ROUTE_HOME_LEGAL_BMAC_ICON_CLASS,
    ROUTE_HOME_LEGAL_BMAC_LABEL_CLASS,
    ROUTE_HOME_LEGAL_CENTER_CLASS,
    ROUTE_HOME_LEGAL_CLASS,
    ROUTE_HOME_LEGAL_LEFT_CLASS,
    ROUTE_HOME_LEGAL_LINK_CLASS,
    ROUTE_HOME_LEGAL_RIGHT_CLASS,
    ROUTE_HOME_LEGAL_SOCIAL_CLASS,
    TI_BASE_CLASS,
    TI_COFFEE_CLASS,
} from "../../../shared/constants/route/route-home-constants.js";
import {
    URL_BMAC,
    URL_DISCORD_CONTACT,
    URL_GITHUB_DEV,
    URL_LINKEDIN,
    URL_PRIVACY,
    URL_TERMS,
} from "../../../shared/constants/home/render-home-data.js";
import { externalAnchor } from "./render-home-hero.js";

function buildSocialLink(props: { href: string; iconClasses: readonly string[]; ariaLabel: string }): Instance {
    const link = anchor(
        {
            href: props.href,
            classes: [ROUTE_HOME_LEGAL_SOCIAL_CLASS],
            ariaLabel: props.ariaLabel,
            context: `open ${props.ariaLabel} in a new tab`,
            meta: ["nav", "external"],
        },
        [span({ classes: props.iconClasses, ariaHidden: "true", context: null, meta: null })],
    );
    link.setAttr("target", "_blank");
    link.setAttr("rel", "noopener noreferrer");
    return link;
}

function buildLegalLeft(): Instance {
    const bmac = externalAnchor({
        href: URL_BMAC,
        classes: [ROUTE_HOME_LEGAL_BMAC_CLASS],
        context: "support the project on Buy Me a Coffee in a new tab",
        children: [
            span({
                classes: [TI_BASE_CLASS, TI_COFFEE_CLASS, ROUTE_HOME_LEGAL_BMAC_ICON_CLASS],
                ariaHidden: "true",
                context: null,
                meta: null,
            }),
            span({ classes: [ROUTE_HOME_LEGAL_BMAC_LABEL_CLASS], text: "Buy me a coffee", context: null, meta: null }),
        ],
    });
    return div({ classes: [ROUTE_HOME_LEGAL_LEFT_CLASS], context: null, meta: null }, [bmac]);
}

function buildLegalCenter(): Instance {
    const privacy = anchor({
        href: URL_PRIVACY,
        data: { route: "" },
        classes: [ROUTE_HOME_LEGAL_LINK_CLASS],
        text: "Privacy",
        context: "open the privacy policy",
        meta: ["nav"],
    });
    const terms = anchor({
        href: URL_TERMS,
        data: { route: "" },
        classes: [ROUTE_HOME_LEGAL_LINK_CLASS],
        text: "Terms",
        context: "open the terms of service",
        meta: ["nav"],
    });
    return div({ classes: [ROUTE_HOME_LEGAL_CENTER_CLASS], context: null, meta: null }, [privacy, terms]);
}

function buildLegalRight(): Instance {
    return div({ classes: [ROUTE_HOME_LEGAL_RIGHT_CLASS], context: null, meta: null }, [
        buildSocialLink({ href: URL_GITHUB_DEV, iconClasses: ["ti", "ti-brand-github"], ariaLabel: "GitHub" }),
        buildSocialLink({ href: URL_DISCORD_CONTACT, iconClasses: ["ti", "ti-brand-discord"], ariaLabel: "Discord" }),
        buildSocialLink({ href: URL_LINKEDIN, iconClasses: ["ti", "ti-brand-linkedin"], ariaLabel: "LinkedIn" }),
    ]);
}

export function buildLegal(): Instance {
    return footer({ classes: [ROUTE_HOME_LEGAL_CLASS], context: null, meta: null }, [
        buildLegalLeft(),
        buildLegalCenter(),
        buildLegalRight(),
    ]);
}
