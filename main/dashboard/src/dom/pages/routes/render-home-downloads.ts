import {
    anchor,
    div,
    heading,
    icon,
    paragraph,
    section,
    span,
    type Instance,
    baseProps,
    textProps,
} from "../../factory";
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
import type { IconEntry } from "../../../icons/providers.js";

function downloadIcon(entry: IconEntry): Instance {
    return icon({
        provider: entry.provider,
        name: entry.name,
        classes: [ROUTE_HOME_DOWNLOAD_ICON_CLASS],
        ariaHidden: true,
        context: null,
        meta: null,
    });
}

function buildDownloadLink(props: {
    href: string;
    label: string;
    icon: IconEntry;
    modifierClass: string;
    context: string;
}): Instance {
    return anchor(
        {
            href: props.href,
            classes: [ROUTE_HOME_DOWNLOAD_CLASS, props.modifierClass],
            ariaLabel: props.label,
            context: props.context,
            meta: ["action"],
        },
        [downloadIcon(props.icon), span(textProps([ROUTE_HOME_DOWNLOAD_LABEL_CLASS], props.label))],
    );
}

function buildDownloadsGrid(): Instance {
    return div(baseProps([ROUTE_HOME_DOWNLOAD_GRID_CLASS]), [
        buildDownloadLink({
            href: URL_DOWNLOAD_WIN,
            label: "Windows",
            icon: { provider: "ti", name: "brand-windows" },
            modifierClass: ROUTE_HOME_DOWNLOAD_WIN_CLASS,
            context: "download the Windows installer",
        }),
        buildDownloadLink({
            href: URL_DOWNLOAD_LINUX,
            label: "Linux",
            icon: { provider: "ph", name: "linux-logo" },
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
            paragraph(textProps([ROUTE_HOME_SECTION_BODY_CLASS], DOWNLOADS_BODY)),
            buildDownloadsGrid(),
        ],
    );
}
