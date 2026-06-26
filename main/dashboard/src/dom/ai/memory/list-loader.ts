import { div, span, type Instance, baseProps } from "../../factory";
import { AI_MEMORY_LOADER_CLASS, AI_MEMORY_LOADER_DOT_CLASS } from "../../../shared/constants/ai-memory-constants.js";

const LOADER_DOT_COUNT = 3;

export function buildLoader(): Instance {
    const dots: Instance[] = [];
    for (let i = 0; i < LOADER_DOT_COUNT; i++) dots.push(span(baseProps([AI_MEMORY_LOADER_DOT_CLASS])));
    return div({ classes: [AI_MEMORY_LOADER_CLASS], ariaLabel: "Loading memories", context: null, meta: null }, dots);
}
