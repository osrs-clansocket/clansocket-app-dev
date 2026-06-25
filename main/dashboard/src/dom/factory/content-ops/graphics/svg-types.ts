const ATTR_ARIA_LABEL = "aria-label";
const ATTR_ARIA_HIDDEN = "aria-hidden";
const ATTR_TITLE = "title";

export const SVG_PROP_TO_ATTR: Readonly<Record<string, string>> = {
    strokeWidth: "stroke-width",
    strokeLinecap: "stroke-linecap",
    strokeLinejoin: "stroke-linejoin",
    strokeDasharray: "stroke-dasharray",
    strokeOpacity: "stroke-opacity",
    fillOpacity: "fill-opacity",
    clipPath: "clip-path",
    clipRule: "clip-rule",
    fillRule: "fill-rule",
    colorInterpolationFilters: "color-interpolation-filters",
    pointerEvents: "pointer-events",
};

export const SVG_TYPED_PROPS = [
    "id",
    "transform",
    "filter",
    "mask",
    "opacity",
    "viewBox",
    "preserveAspectRatio",
    "xmlns",
    "x",
    "y",
    "width",
    "height",
    "cx",
    "cy",
    "r",
    "rx",
    "ry",
    "x1",
    "y1",
    "x2",
    "y2",
    "points",
    "d",
    "fill",
    "stroke",
    "strokeWidth",
    "strokeLinecap",
    "strokeLinejoin",
    "strokeDasharray",
    "strokeOpacity",
    "fillOpacity",
    "clipPath",
    "clipRule",
    "fillRule",
    "colorInterpolationFilters",
    "pointerEvents",
    "in",
    "in2",
    "result",
    "stdDeviation",
    "type",
    "baseFrequency",
    "numOctaves",
    "seed",
    "scale",
    "xChannelSelector",
    "yChannelSelector",
    "values",
    "tableValues",
    "mode",
    "amplitude",
    "exponent",
    "offset",
    "slope",
    "intercept",
] as const;

type SvgTypedKey = (typeof SVG_TYPED_PROPS)[number];
type SvgTypedProps = { [K in SvgTypedKey]?: string };

export type SvgChild = SVGElement | string | SvgInstance;

export interface SvgInstance<T extends SVGElement = SVGElement> {
    el: T;
    addChild(child: SvgChild): SvgInstance<T>;
    setChildren(...children: readonly SvgChild[]): SvgInstance<T>;
    setAttr(name: string, value: string | null): SvgInstance<T>;
    clear(): SvgInstance<T>;
    destroy(): void;
}

export interface SvgSpec extends SvgTypedProps {
    tag: string;
    attrs?: Record<string, string>;
    ariaLabel?: string;
    ariaHidden?: string;
    title?: string;
    classes?: readonly string[];
    children?: readonly SvgChild[];
}

export type SvgProps = SvgTypedProps & {
    attrs?: Record<string, string>;
    ariaLabel?: string;
    ariaHidden?: string;
    title?: string;
    classes?: readonly string[];
};

export function applyTypedProps<T extends SVGElement>(el: T, spec: SvgSpec): void {
    for (const key of SVG_TYPED_PROPS) {
        const value = (spec as unknown as Record<string, unknown>)[key];
        if (typeof value !== "string") continue;
        const attrName = SVG_PROP_TO_ATTR[key] ?? key;
        el.setAttribute(attrName, value);
    }
}

export function applyAriaTitle<T extends SVGElement>(el: T, spec: SvgSpec): void {
    if (spec.ariaLabel !== undefined) el.setAttribute(ATTR_ARIA_LABEL, spec.ariaLabel);
    if (spec.ariaHidden !== undefined) el.setAttribute(ATTR_ARIA_HIDDEN, spec.ariaHidden);
    if (spec.title !== undefined) el.setAttribute(ATTR_TITLE, spec.title);
}
