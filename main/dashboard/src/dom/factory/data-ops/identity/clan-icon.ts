import "../../../../styles/components/data/clan-icon-component.css";
import { image } from "../../content-ops/graphics/media.js";
import { div } from "../../layout-ops/structural/container.js";
import type { Instance } from "../../core";
import type { ContextProps } from "../../core/types.js";
import { applyTransformCss, bindTransformEvents, type ClanIconTransform } from "./clan-icon-transform.js";
import { defaultThumbSrc, defaultThumbUrl } from "./clan-icon-url.js";

const BLOCK_CLASS = "clan-icon";
const IMAGE_CLASS = "clan-icon__image";

interface ClanIconProps extends ContextProps {
    slug: string;
    initialTransform?: ClanIconTransform;
    imageVersion?: number;
    thumbnailUrl?: string;
    thumbnailSrcset?: string;
    thumbnailSizes?: string;
    eager?: boolean;
}

function clanIcon(props: ClanIconProps): Instance {
    const host = div({ classes: [BLOCK_CLASS], context: props.context, meta: props.meta });
    const fallbackImg = image({
        src: defaultThumbSrc(props.thumbnailUrl ?? defaultThumbUrl(props.slug), props.imageVersion),
        srcset: props.thumbnailSrcset,
        sizes: props.thumbnailSizes,
        alt: "",
        classes: [IMAGE_CLASS],
        lazy: props.eager ? false : undefined,
        fetchPriority: props.eager ? "high" : undefined,
        context: null,
        meta: null,
    });
    host.addChild(fallbackImg);
    if (props.initialTransform) applyTransformCss(fallbackImg.el, props.initialTransform);
    bindTransformEvents(host, fallbackImg, props.slug);
    return host;
}

export { clanIcon };
export type { ClanIconProps };
