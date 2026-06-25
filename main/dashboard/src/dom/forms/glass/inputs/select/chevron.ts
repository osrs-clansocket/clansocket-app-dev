import { path, svg } from "../../../../factory/index.js";

const CLASS_CHEVRON = "glass-select__chevron";
const CHEVRON_PATH = "M3.5 6L8 10.5L12.5 6";

export function buildSelectChevron(): SVGSVGElement {
    return svg({ classes: [CLASS_CHEVRON], ariaHidden: "true", viewBox: "0 0 16 16", fill: "none" }, [
        path({
            d: CHEVRON_PATH,
            stroke: "currentColor",
            strokeWidth: "1.75",
            strokeLinecap: "round",
            strokeLinejoin: "round",
        }),
    ]).el;
}
