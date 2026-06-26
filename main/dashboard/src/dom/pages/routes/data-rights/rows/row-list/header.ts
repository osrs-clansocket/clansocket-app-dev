import {
    BTN_VARIANT_OUTLINE,
    button,
    div,
    span,
    type Instance,
    baseProps,
    textProps,
} from "../../../../../factory/index.js";
import type { RowListHandlers, RowListState } from "./types.js";
import {
    DR_PANE_HEADER_CLASS,
    DR_PANE_TITLE_CLASS,
    DR_ROW_META_CLASS,
} from "../../../../../../shared/constants/rights-constants.js";

export interface HeaderRefs {
    instance: Instance;
    countSpan: Instance | null;
}

function backBtn(onBack: () => void): Instance {
    return button({
        variant: BTN_VARIANT_OUTLINE,
        text: "← Databases",
        context: "go back to the databases tree",
        meta: ["nav", "data"],
        onClick: onBack,
    });
}

function countLabel(state: RowListState): Instance {
    return span(
        textProps([DR_ROW_META_CLASS], `${state.rows.length}${state.hasMore ? "+" : ""} of ${state.info!.total}`),
    );
}

export function buildHeader(state: RowListState, handlers: RowListHandlers): HeaderRefs {
    const children: Instance[] = [];
    if (handlers.onBack) children.push(backBtn(handlers.onBack));
    children.push(span(textProps([DR_PANE_TITLE_CLASS], state.table)));
    const countSpan = state.info ? countLabel(state) : null;
    if (countSpan) children.push(countSpan);
    return {
        instance: div(baseProps([DR_PANE_HEADER_CLASS]), children),
        countSpan,
    };
}
