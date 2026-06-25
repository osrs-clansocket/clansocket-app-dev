import { build, buildAttrs, type Instance } from "../../core/index.js";
import { applyEffects } from "../../effects/effect-applier.js";
import type { ContextProps } from "../../core/types.js";

const TAG_IMG = "img";
const TAG_PICTURE = "picture";
const TAG_SOURCE = "source";
const LOADING_LAZY = "lazy";
const ATTR_SRC = "src";
const ATTR_ALT = "alt";
const ATTR_TITLE = "title";
const ATTR_WIDTH = "width";
const ATTR_HEIGHT = "height";
const ATTR_LOADING = "loading";
const ATTR_SRCSET = "srcset";
const ATTR_TYPE = "type";
const AVIF_MIME = "image/avif";

const AVIF_FALLBACK_EXTS = [".webp", ".png", ".jpg", ".jpeg"];

export interface PictureProps extends ContextProps {
    src: string;
    alt?: string;
    title?: string;
    width?: number;
    height?: number;
    lazy?: boolean;
    classes?: readonly string[];
}

function pictureNumStr(n: number | undefined): string | undefined {
    return n === undefined ? undefined : String(n);
}

function pictureAvifUrl(src: string): string | null {
    const lower = src.toLowerCase();
    for (const ext of AVIF_FALLBACK_EXTS) {
        if (lower.endsWith(ext)) return src.slice(0, -ext.length) + ".avif";
    }
    return null;
}

function buildPictureSource(avifUrl: string): Instance<HTMLSourceElement> {
    return build<HTMLSourceElement>({
        tag: TAG_SOURCE,
        attrs: buildAttrs([
            [ATTR_SRCSET, avifUrl],
            [ATTR_TYPE, AVIF_MIME],
        ]),
        context: null,
        meta: null,
    });
}

function buildPictureImg(props: PictureProps): Instance<HTMLImageElement> {
    const img = build<HTMLImageElement>({
        tag: TAG_IMG,
        attrs: buildAttrs([
            [ATTR_SRC, props.src],
            [ATTR_ALT, props.alt],
            [ATTR_TITLE, props.title],
            [ATTR_WIDTH, pictureNumStr(props.width)],
            [ATTR_HEIGHT, pictureNumStr(props.height)],
            [ATTR_LOADING, props.lazy === false ? undefined : LOADING_LAZY],
        ]),
        context: null,
        meta: null,
    });
    img.el.addEventListener("load", () => applyEffects(img.el, { name: "fade-in", once: true }), { once: true });
    return img;
}

export function picture(props: PictureProps): Instance<HTMLPictureElement> {
    const inst = build<HTMLPictureElement>({
        tag: TAG_PICTURE,
        classes: props.classes,
        context: props.context,
        meta: props.meta,
    });
    const avifUrl = pictureAvifUrl(props.src);
    if (avifUrl !== null) inst.addChild(buildPictureSource(avifUrl));
    inst.addChild(buildPictureImg(props));
    return inst;
}
