import { icon, image } from "../../content-ops/graphics/media.js";
import { isRasterProvider, resolveIcon } from "../../../../icons/providers";
import type { Instance } from "../../core";
import type { ContextProps } from "../../core/types.js";
import type { ReactiveValue } from "../../reactive/index.js";
import { clanModelIcon } from "./clan-model-icon.js";

const FALLBACK_ICON = "bi-shield";

type IconKindProp = "builtin" | "image" | "voxlab" | null | undefined;

interface AvatarProps extends ContextProps {
    slug?: string;
    iconKind: IconKindProp;
    iconValue: string | null | undefined;
    imageVersion?: number;
    imgClass: string;
    glyphClass: string;
    src?: ReactiveValue<string>;
}

function staticImageSrc(slug: string | undefined, imageVersion: number | undefined): string {
    const s = slug ?? "";
    const versioned = imageVersion !== undefined ? `?v=${imageVersion}` : "";
    return `/api/clans/${encodeURIComponent(s)}/icon${versioned}`;
}

function voxlabAvatar(props: AvatarProps): Instance {
    if (!props.slug) {
        const src: ReactiveValue<string> = staticImageSrc(props.slug, props.imageVersion);
        return image({ src, alt: "", classes: [props.imgClass], context: props.context, meta: props.meta });
    }
    const host = clanModelIcon({
        slug: props.slug,
        imageVersion: props.imageVersion,
        context: props.context,
        meta: props.meta,
    });
    host.el.classList.add(props.imgClass);
    return host;
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
    if (props.iconKind === "voxlab") return voxlabAvatar(props);
    if (props.iconKind === "image") {
        const src: ReactiveValue<string> = props.src ?? staticImageSrc(props.slug, props.imageVersion);
        return image({ src, alt: "", classes: [props.imgClass], context: props.context, meta: props.meta });
    }
    return builtinAvatarIcon(props);
}

export { clanAvatarInner };
export type { AvatarProps };
