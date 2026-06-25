import { anchor, div, heading, paragraph, section, span, type Instance } from "../../factory";
import {
    ROUTE_HOME_DOWNLOAD_CLASS,
    ROUTE_HOME_DOWNLOAD_GRID_CLASS,
    ROUTE_HOME_DOWNLOAD_ICON_CLASS,
    ROUTE_HOME_DOWNLOAD_LABEL_CLASS,
    ROUTE_HOME_DOWNLOAD_LINUX_CLASS,
    ROUTE_HOME_DOWNLOAD_WIN_CLASS,
    ROUTE_HOME_DOWNLOADS_CLASS,
    ROUTE_HOME_DOWNLOADS_TILE_CLASS,
    ROUTE_HOME_SECTION_BODY_CLASS,
    ROUTE_HOME_SECTION_CLASS,
    ROUTE_HOME_SECTION_TITLE_CLASS,
} from "../../../shared/constants/route/route-home-constants.js";
import {
    DOWNLOADS_BODY,
    URL_DOWNLOAD_LINUX,
    URL_DOWNLOAD_WIN,
} from "../../../shared/constants/home/render-home-data.js";

function buildDownloadLink(props: {
    href: string;
    label: string;
    iconClasses: readonly string[];
    modifierClass: string;
    context: string;
}): Instance {
    const iconEl = span({
        classes: [...props.iconClasses, ROUTE_HOME_DOWNLOAD_ICON_CLASS],
        ariaHidden: "true",
        context: null,
        meta: null,
    });
    const labelEl = span({ classes: [ROUTE_HOME_DOWNLOAD_LABEL_CLASS], text: props.label, context: null, meta: null });
    return anchor(
        {
            href: props.href,
            classes: [ROUTE_HOME_DOWNLOAD_CLASS, props.modifierClass],
            ariaLabel: props.label,
            context: props.context,
            meta: ["action"],
        },
        [iconEl, labelEl],
    );
}

function buildDownloadsGrid(): Instance {
    return div({ classes: [ROUTE_HOME_DOWNLOAD_GRID_CLASS], context: null, meta: null }, [
        buildDownloadLink({
            href: URL_DOWNLOAD_WIN,
            label: "Windows",
            iconClasses: ["ti", "ti-brand-windows"],
            modifierClass: ROUTE_HOME_DOWNLOAD_WIN_CLASS,
            context: "download the Windows installer",
        }),
        buildDownloadLink({
            href: URL_DOWNLOAD_LINUX,
            label: "Linux",
            iconClasses: ["ph", "ph-linux-logo"],
            modifierClass: ROUTE_HOME_DOWNLOAD_LINUX_CLASS,
            context: "download the Linux tar.gz",
        }),
    ]);
}

export function buildDownloads(): Instance {
    return section(
        {
            classes: [ROUTE_HOME_SECTION_CLASS, ROUTE_HOME_DOWNLOADS_CLASS, ROUTE_HOME_DOWNLOADS_TILE_CLASS],
            context: null,
            meta: null,
        },
        [
            heading("h2", {
                classes: [ROUTE_HOME_SECTION_TITLE_CLASS],
                text: "Desktop app",
                context: null,
                meta: null,
            }),
            paragraph({ classes: [ROUTE_HOME_SECTION_BODY_CLASS], text: DOWNLOADS_BODY, context: null, meta: null }),
            buildDownloadsGrid(),
        ],
    );
}
