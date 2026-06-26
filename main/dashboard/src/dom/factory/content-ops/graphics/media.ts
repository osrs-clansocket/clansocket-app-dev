import { build, buildAttrs, type Instance, type AttrEntry } from "../../core/index.js";
import { applyEffects } from "../../effects/effect-applier.js";
import type { EffectProp } from "../../effects/effect-types.js";
import type { ContextProps } from "../../core/types.js";
import type { ReactiveValue } from "../../reactive/index.js";
import { buildIconSrc, getProvider } from "../../../../icons/providers.js";
import { picture, type PictureProps } from "./media-picture.js";
import { canvas, scratchCanvas, type CanvasProps, type ScratchCanvasProps } from "./media-canvas.js";
import { svg, use } from "./svg.js";
export { picture, canvas, scratchCanvas };
export type { PictureProps, CanvasProps, ScratchCanvasProps };

const TAG_I = "i";
const TAG_IMG = "img";
const TAG_SPAN = "span";
const LOADING_LAZY = "lazy";
const ATTR_SRC = "src";
const ATTR_ALT = "alt";
const ATTR_WIDTH = "width";
const ATTR_HEIGHT = "height";
const ATTR_LOADING = "loading";
const ATTR_TITLE = "title";
const ATTR_ARIA_HIDDEN = "aria-hidden";
const ATTR_STYLE = "style";
const ATTR_FETCHPRIORITY = "fetchpriority";
const ATTR_SRCSET = "srcset";
const ATTR_SIZES = "sizes";
const DEFAULT_ICON_PROVIDER = "bi";

const SVG_ICON_STYLE = "display:inline-block;inline-size:1em;block-size:1em;line-height:0;";

type FetchPriority = "high" | "low" | "auto";

interface IconProps extends ContextProps {
    name: string;
    provider?: string;
    classes?: readonly string[];
    effects?: EffectProp | readonly EffectProp[];
    alt?: string;
    title?: string;
    ariaHidden?: boolean;
    fullSprite?: boolean;
}

interface ImageProps extends ContextProps {
    src: ReactiveValue<string>;
    srcset?: string;
    sizes?: string;
    alt?: ReactiveValue<string>;
    title?: ReactiveValue<string>;
    width?: number;
    height?: number;
    lazy?: boolean;
    fetchPriority?: FetchPriority;
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

function svgIcon(provider: string, props: IconProps, ariaHiddenAttr: string | undefined): Instance<HTMLElement> {
    const spriteBase = props.fullSprite === true ? "/svg-sprite-full/" : "/svg-sprite/";
    const href = `${spriteBase}${provider}.svg#${props.name}`;
    const inner = svg({ attrs: { width: "1em", height: "1em", fill: "currentColor" } }, [use({ attrs: { href } })]);
    const host = build({
        tag: TAG_SPAN,
        classes: props.classes && props.classes.length > 0 ? props.classes : undefined,
        attrs: buildAttrs([
            [ATTR_STYLE, SVG_ICON_STYLE],
            [ATTR_TITLE, props.title ?? props.name],
            [ATTR_ARIA_HIDDEN, ariaHiddenAttr],
        ]),
        effects: props.effects,
        context: props.context,
        meta: props.meta,
    });
    host.el.appendChild(inner.el);
    return host;
}

function icon(props: IconProps): Instance<HTMLElement> {
    const provider = props.provider ?? DEFAULT_ICON_PROVIDER;
    const cfg = getProvider(provider);
    const ariaHiddenAttr = props.ariaHidden ? "true" : undefined;
    if (cfg && cfg.kind === "raster") return rasterIcon(provider, props, ariaHiddenAttr);
    if (cfg && cfg.kind === "svg") return svgIcon(provider, props, ariaHiddenAttr);
    return build({
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
        [ATTR_FETCHPRIORITY, props.fetchPriority],
        [ATTR_SRCSET, props.srcset],
        [ATTR_SIZES, props.sizes],
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
export type { IconProps, ImageProps, FetchPriority };
