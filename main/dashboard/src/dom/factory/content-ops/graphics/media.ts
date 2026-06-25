import { build, buildAttrs, type Instance, type AttrEntry } from "../../core/index.js";
import { applyEffects } from "../../effects/effect-applier.js";
import type { EffectProp } from "../../effects/effect-types.js";
import type { ContextProps } from "../../core/types.js";
import type { ReactiveValue } from "../../reactive/index.js";
import { buildIconClasses, buildIconSrc, ensureFamilyCss, getProvider } from "../../../../icons/providers.js";
import { picture, type PictureProps } from "./media-picture.js";
import { canvas, scratchCanvas, type CanvasProps, type ScratchCanvasProps } from "./media-canvas.js";
export { picture, canvas, scratchCanvas };
export type { PictureProps, CanvasProps, ScratchCanvasProps };

const TAG_I = "i";
const TAG_IMG = "img";
const LOADING_LAZY = "lazy";
const ATTR_SRC = "src";
const ATTR_ALT = "alt";
const ATTR_WIDTH = "width";
const ATTR_HEIGHT = "height";
const ATTR_LOADING = "loading";
const ATTR_TITLE = "title";
const ATTR_ARIA_HIDDEN = "aria-hidden";
const DEFAULT_ICON_PROVIDER = "bi";

interface IconProps extends ContextProps {
    name: string;
    provider?: string;
    classes?: readonly string[];
    effects?: EffectProp | readonly EffectProp[];
    alt?: string;
    title?: string;
    ariaHidden?: boolean;
}

interface ImageProps extends ContextProps {
    src: ReactiveValue<string>;
    alt?: ReactiveValue<string>;
    title?: ReactiveValue<string>;
    width?: number;
    height?: number;
    lazy?: boolean;
    classes?: readonly string[];
}

function asStr(n: number | undefined): string | undefined {
    return n === undefined ? undefined : String(n);
}

function rasterIcon(provider: string, props: IconProps, ariaHiddenAttr: string | undefined): Instance<HTMLElement> {
    const src = buildIconSrc(provider, props.name) ?? "";
    return build({
        tag: TAG_IMG,
        classes: props.classes && props.classes.length > 0 ? props.classes : undefined,
        attrs: buildAttrs([
            [ATTR_SRC, src],
            [ATTR_ALT, props.alt ?? props.name],
            [ATTR_TITLE, props.title ?? props.name],
            [ATTR_LOADING, LOADING_LAZY],
            [ATTR_ARIA_HIDDEN, ariaHiddenAttr],
        ]),
        effects: props.effects,
        context: props.context,
        meta: props.meta,
    });
}

function icon(props: IconProps): Instance<HTMLElement> {
    const provider = props.provider ?? DEFAULT_ICON_PROVIDER;
    ensureFamilyCss(provider, props.name);
    const cfg = getProvider(provider);
    const ariaHiddenAttr = props.ariaHidden ? "true" : undefined;
    if (cfg && cfg.kind === "raster") return rasterIcon(provider, props, ariaHiddenAttr);
    const providerClasses = buildIconClasses(provider, props.name);
    const classes =
        props.classes && props.classes.length > 0 ? [...providerClasses, ...props.classes] : providerClasses;
    return build({
        classes,
        tag: TAG_I,
        attrs: ariaHiddenAttr ? { [ATTR_ARIA_HIDDEN]: ariaHiddenAttr } : undefined,
        effects: props.effects,
        context: props.context,
        meta: props.meta,
    });
}

function baseAttrs(props: ImageProps): AttrEntry[] {
    const loading = props.lazy === false ? undefined : LOADING_LAZY;
    return [
        [ATTR_WIDTH, asStr(props.width)],
        [ATTR_HEIGHT, asStr(props.height)],
        [ATTR_LOADING, loading],
    ];
}

function buildTagged<T extends HTMLElement>(
    tag: string,
    classes: readonly string[] | undefined,
    attrs: Record<string, string>,
    ctx: ContextProps,
): Instance<T> {
    return build<T>({ tag, classes, attrs, context: ctx.context, meta: ctx.meta });
}

function image(props: ImageProps): Instance<HTMLImageElement> {
    const inst = buildTagged<HTMLImageElement>(TAG_IMG, props.classes, buildAttrs(baseAttrs(props)), props);
    inst.setAttr(ATTR_SRC, props.src);
    if (props.alt !== undefined) inst.setAttr(ATTR_ALT, props.alt);
    if (props.title !== undefined) inst.setAttr(ATTR_TITLE, props.title);
    inst.el.addEventListener("load", () => applyEffects(inst.el, { name: "fade-in", once: true }), { once: true });
    return inst;
}

export { icon, image };
export type { IconProps, ImageProps };
