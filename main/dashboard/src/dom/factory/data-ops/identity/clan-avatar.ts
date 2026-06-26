import { icon, image } from "../../content-ops/graphics/media.js";
import { isRasterProvider, resolveIcon } from "../../../../icons/providers";
import type { Instance } from "../../core";
import type { ContextProps } from "../../core/types.js";
import type { ReactiveValue } from "../../reactive/index.js";

const FALLBACK_ICON = "shield";

type IconKindProp = "builtin" | "image" | null | undefined;

interface AvatarProps extends ContextProps {
    slug?: string;
    iconKind: IconKindProp;
    iconValue: string | null | undefined;
    imageVersion?: number;
    imgClass: string;
    glyphClass: string;
    src?: ReactiveValue<string>;
    width?: number;
    height?: number;
}

function staticImageSrc(slug: string | undefined, imageVersion: number | undefined): string {
    const s = slug ?? "";
    const versioned = imageVersion !== undefined ? `?v=${imageVersion}` : "";
    return `/api/clans/${encodeURIComponent(s)}/icon${versioned}`;
}

function builtinAvatarIcon(props: AvatarProps): Instance {
    const stored = props.iconKind === "builtin" && props.iconValue ? props.iconValue : FALLBACK_ICON;
    const { provider, name } = resolveIcon(stored);
    const isRaster = isRasterProvider(provider);
    return icon({
        provider,
        name,
        classes: [isRaster ? props.imgClass : props.glyphClass],
        alt: "",
        ariaHidden: true,
        context: props.context,
        meta: props.meta,
    });
}

function clanAvatarInner(props: AvatarProps): Instance {
    if (props.iconKind === "image") {
        const src: ReactiveValue<string> = props.src ?? staticImageSrc(props.slug, props.imageVersion);
        return image({
            src,
            alt: "",
            classes: [props.imgClass],
            width: props.width,
            height: props.height,
            context: props.context,
            meta: props.meta,
        });
    }
    return builtinAvatarIcon(props);
}

export { clanAvatarInner };
export type { AvatarProps };
