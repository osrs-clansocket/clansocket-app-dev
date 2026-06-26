import { anchor, div, footer, icon, span, type Instance, baseProps, textProps } from "../../factory";
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
} from "../../../shared/constants/route/route-home-constants.js";
import {
    URL_BMAC,
    URL_DISCORD_CONTACT,
    URL_GITHUB_DEV,
    URL_LINKEDIN,
    URL_PRIVACY,
    URL_TERMS,
} from "../../../shared/constants/home/render-home-data.js";
import type { IconEntry } from "../../../icons/providers.js";
import { externalAnchor } from "./render-home-hero.js";

function buildSocialLink(props: { href: string; icon: IconEntry; ariaLabel: string }): Instance {
    const link = anchor(
        {
            href: props.href,
            classes: [ROUTE_HOME_LEGAL_SOCIAL_CLASS],
            ariaLabel: props.ariaLabel,
            context: `open ${props.ariaLabel} in a new tab`,
            meta: ["nav", "external"],
        },
        [icon({ provider: props.icon.provider, name: props.icon.name, ariaHidden: true, context: null, meta: null })],
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
            icon({
                provider: "ti",
                name: "coffee",
                classes: [ROUTE_HOME_LEGAL_BMAC_ICON_CLASS],
                ariaHidden: true,
                context: null,
                meta: null,
            }),
            span(textProps([ROUTE_HOME_LEGAL_BMAC_LABEL_CLASS], "Buy me a coffee")),
        ],
    });
    return div(baseProps([ROUTE_HOME_LEGAL_LEFT_CLASS]), [bmac]);
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
    return div(baseProps([ROUTE_HOME_LEGAL_CENTER_CLASS]), [privacy, terms]);
}

function buildLegalRight(): Instance {
    return div(baseProps([ROUTE_HOME_LEGAL_RIGHT_CLASS]), [
        buildSocialLink({ href: URL_GITHUB_DEV, icon: { provider: "ti", name: "brand-github" }, ariaLabel: "GitHub" }),
        buildSocialLink({
            href: URL_DISCORD_CONTACT,
            icon: { provider: "ti", name: "brand-discord" },
            ariaLabel: "Discord",
        }),
        buildSocialLink({
            href: URL_LINKEDIN,
            icon: { provider: "ti", name: "brand-linkedin" },
            ariaLabel: "LinkedIn",
        }),
    ]);
}

export function buildLegal(): Instance {
    return footer(baseProps([ROUTE_HOME_LEGAL_CLASS]), [buildLegalLeft(), buildLegalCenter(), buildLegalRight()]);
}
