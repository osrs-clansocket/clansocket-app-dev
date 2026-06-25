import { div } from "../structural/container.js";
import type { Instance } from "../../core/index.js";
import type { SlidePanelProps } from "./slide-panel-types.js";

const ROOT_CLASS = "slide-panel";
const ROOT_BANNER_CLASS = "slide-panel--banner";

export function buildPanelRoot(
    props: SlidePanelProps,
    bannerMode: boolean,
    trigger: Instance,
    panel: Instance,
): Instance {
    const baseClasses = [ROOT_CLASS, ...(props.rootClasses ?? [])];
    if (bannerMode) baseClasses.push(ROOT_BANNER_CLASS);
    return bannerMode
        ? div({ classes: baseClasses, context: props.context, meta: props.meta }, [trigger])
        : div({ classes: baseClasses, context: props.context, meta: props.meta }, [trigger, panel]);
}
