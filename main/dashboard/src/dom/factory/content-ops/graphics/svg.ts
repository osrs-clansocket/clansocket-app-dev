import {
    applyAriaTitle,
    applyTypedProps,
    type SvgChild,
    type SvgInstance,
    type SvgProps,
    type SvgSpec,
} from "./svg-types.js";
export type { SvgInstance, SvgChild, SvgSpec } from "./svg-types.js";

const SVG_NS = "http://www.w3.org/2000/svg";

function toSvgNode(child: SvgChild): Node {
    if (typeof child === "string") return document.createTextNode(child);
    if (child instanceof Node) return child;
    return child.el;
}

function svgChain<T>(self: T, op: () => void): T {
    op();
    return self;
}

function createSvgInstance<T extends SVGElement>(el: T): SvgInstance<T> {
    const self: SvgInstance<T> = {
        el,
        addChild: (child) => svgChain(self, () => el.appendChild(toSvgNode(child))),
        setChildren: (...children) =>
            svgChain(self, () => {
                el.replaceChildren();
                for (const child of children) el.appendChild(toSvgNode(child));
            }),
        setAttr: (name, value) =>
            svgChain(self, () => {
                if (value === null) el.removeAttribute(name);
                else el.setAttribute(name, value);
            }),
        clear: () => svgChain(self, () => el.replaceChildren()),
        destroy: () => el.remove(),
    };
    return self;
}

function buildSvg<T extends SVGElement>(spec: SvgSpec): SvgInstance<T> {
    const el = document.createElementNS(SVG_NS, spec.tag) as T;
    if (spec.classes && spec.classes.length > 0) el.setAttribute("class", spec.classes.join(" "));
    if (spec.attrs) for (const [k, v] of Object.entries(spec.attrs)) el.setAttribute(k, v);
    applyTypedProps(el, spec);
    applyAriaTitle(el, spec);
    const inst = createSvgInstance(el);
    if (spec.children) for (const child of spec.children) inst.addChild(child);
    return inst;
}

type SvgPrimitive<T extends SVGElement = SVGElement> = (
    props?: SvgProps,
    children?: readonly SvgChild[],
) => SvgInstance<T>;

function svgPrimitive<T extends SVGElement = SVGElement>(tag: string): SvgPrimitive<T> {
    return (props = {}, children = []) =>
        buildSvg<T>({
            ...props,
            tag,
            children,
        });
}

const SVG_BASE_CLASS = "factory-svg";
const svg: SvgPrimitive<SVGSVGElement> = (props = {}, children = []) => {
    const classes = props.classes && props.classes.length > 0 ? [SVG_BASE_CLASS, ...props.classes] : [SVG_BASE_CLASS];
    return buildSvg<SVGSVGElement>({ ...props, classes, tag: "svg", children });
};
const defs = svgPrimitive("defs");
const path = svgPrimitive<SVGPathElement>("path");
const svgFilter = svgPrimitive("filter");
const feGaussianBlur = svgPrimitive("feGaussianBlur");
const feTurbulence = svgPrimitive("feTurbulence");
const feDisplacementMap = svgPrimitive("feDisplacementMap");
const feMerge = svgPrimitive("feMerge");
const feMergeNode = svgPrimitive("feMergeNode");
const feColorMatrix = svgPrimitive("feColorMatrix");
const feComponentTransfer = svgPrimitive("feComponentTransfer");
const feFuncR = svgPrimitive("feFuncR");
const feFuncG = svgPrimitive("feFuncG");
const feFuncB = svgPrimitive("feFuncB");

export {
    svg,
    defs,
    path,
    svgFilter,
    feGaussianBlur,
    feTurbulence,
    feDisplacementMap,
    feMerge,
    feMergeNode,
    feColorMatrix,
    feComponentTransfer,
    feFuncR,
    feFuncG,
    feFuncB,
    buildSvg,
    svgPrimitive,
    createSvgInstance,
};
export type { SvgPrimitive };
