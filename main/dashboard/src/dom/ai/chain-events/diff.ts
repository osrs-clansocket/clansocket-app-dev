import { div, span, type Instance } from "../../factory";
import {
    AI_BAR_DIFF_CLASS,
    AI_BAR_DIFF_LINE_CLASS,
    AI_BAR_DIFF_MARKER_CLASS,
    AI_BAR_DIFF_TEXT_CLASS,
} from "../../../shared/constants/ai-bar-constants.js";
import { DIFF_ADD, DIFF_CONTEXT, DIFF_REMOVE, type DiffKind, type DiffLine } from "./diff-kind.js";
import { lineDiff } from "./diff-lcs.js";

const MARKER_FOR_KIND: Record<DiffKind, string> = {
    [DIFF_ADD]: "+",
    [DIFF_REMOVE]: "-",
    [DIFF_CONTEXT]: " ",
};

function buildDiffLine(line: DiffLine): Instance {
    return div(
        { classes: [AI_BAR_DIFF_LINE_CLASS, `${AI_BAR_DIFF_LINE_CLASS}--${line.kind}`], context: null, meta: null },
        [
            span({ classes: [AI_BAR_DIFF_MARKER_CLASS], text: MARKER_FOR_KIND[line.kind], context: null, meta: null }),
            span({ classes: [AI_BAR_DIFF_TEXT_CLASS], text: line.text, context: null, meta: null }),
        ],
    );
}

function buildDiffBlock(lines: DiffLine[]): Instance {
    return div({ classes: [AI_BAR_DIFF_CLASS], context: null, meta: null }, lines.map(buildDiffLine));
}

function buildDiff(before: string, after: string): Instance {
    return buildDiffBlock(lineDiff(before, after));
}

function buildSingleSide(content: string, kind: DiffKind): Instance {
    const lines = content.split("\n").map((text) => ({ kind, text }));
    return buildDiffBlock(lines);
}

export { buildDiff, buildSingleSide, DIFF_ADD, DIFF_REMOVE };
