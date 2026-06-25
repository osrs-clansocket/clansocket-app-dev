import { build, buildAttrs, type Instance, type AttrEntry } from "../../core/index.js";
import type { ContextProps } from "../../core/types.js";

const TAG_CANVAS = "canvas";
const ATTR_WIDTH = "width";
const ATTR_HEIGHT = "height";
const ATTR_ARIA_LABEL = "aria-label";
const ATTR_DATA_CHART_KIND = "data-chart-kind";
const ATTR_DATA_CHART_DATA = "data-chart-data";
const ATTR_DATA_CHART_KEY = "data-chart-key";
const CANVAS_BASE_CLASS = "factory-canvas";

export interface CanvasProps extends ContextProps {
    chartKind: string;
    chartData: string;
    chartKey: string;
    width: number;
    height: number;
    title?: string;
    classes?: readonly string[];
}

export interface ScratchCanvasProps extends ContextProps {
    width: number;
    height: number;
    classes?: readonly string[];
}

function canvasAttrEntries(props: CanvasProps): AttrEntry[] {
    return [
        [ATTR_WIDTH, String(props.width)],
        [ATTR_HEIGHT, String(props.height)],
        [ATTR_DATA_CHART_KIND, props.chartKind],
        [ATTR_DATA_CHART_DATA, props.chartData],
        [ATTR_DATA_CHART_KEY, props.chartKey],
        [ATTR_ARIA_LABEL, props.title],
    ];
}

export function canvas(props: CanvasProps): Instance<HTMLCanvasElement> {
    const classes =
        props.classes && props.classes.length > 0 ? [CANVAS_BASE_CLASS, ...props.classes] : [CANVAS_BASE_CLASS];
    return build<HTMLCanvasElement>({
        classes,
        tag: TAG_CANVAS,
        attrs: buildAttrs(canvasAttrEntries(props)),
        context: props.context,
        meta: props.meta,
    });
}

export function scratchCanvas(props: ScratchCanvasProps): Instance<HTMLCanvasElement> {
    const classes =
        props.classes && props.classes.length > 0 ? [CANVAS_BASE_CLASS, ...props.classes] : [CANVAS_BASE_CLASS];
    const inst = build<HTMLCanvasElement>({
        classes,
        tag: TAG_CANVAS,
        context: props.context,
        meta: props.meta,
    });
    inst.el.width = props.width;
    inst.el.height = props.height;
    return inst;
}
