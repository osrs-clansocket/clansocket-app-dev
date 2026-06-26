import {
    BTN_VARIANT_OUTLINE,
    button,
    div,
    span,
    wireKey,
    type Instance,
    baseProps,
    textProps,
} from "../../../../../factory/index.js";
import { glassDate } from "../../../../../forms/glass/inputs/date/index.js";
import { glassInput } from "../../../../../forms/glass/inputs/glass-input.js";
import { dateInputValue } from "../../../../../../state/data-rights/page-state/formatters/date-input-formatter.js";
import { parseDate } from "../../../../../../state/data-rights/page-state/parsers/date-parser.js";
import type { RowListHandlers, RowListState } from "./types.js";
import { DR_FILTER_BAR_CLASS, DR_LABEL_CLASS } from "../../../../../../shared/constants/rights-constants.js";
import { buildBulkRow } from "./filter-bulk-row.js";

function normalizeRsn(raw: string): string | null {
    const trimmed = raw.trim();
    return trimmed.length === 0 ? null : trimmed;
}

interface FilterRefs {
    fromVal: { v: string };
    toVal: { v: string };
    rsnVal: { v: string };
    fromInp: Instance;
    toInp: Instance;
    rsnInp: Instance<HTMLInputElement>;
}

function buildDateRange(state: RowListState): {
    fromVal: { v: string };
    toVal: { v: string };
    fromInp: Instance;
    toInp: Instance;
} {
    const fromVal = { v: dateInputValue(state.from) };
    const toVal = { v: dateInputValue(state.to) };
    const fromInp = glassDate({
        value: fromVal.v,
        placeholder: "From",
        onChange: (v) => {
            fromVal.v = v;
        },
    });
    const toInp = glassDate({
        value: toVal.v,
        placeholder: "To",
        onChange: (v) => {
            toVal.v = v;
        },
    });
    return { fromVal, toVal, fromInp, toInp };
}

function buildFilterInputs(state: RowListState): FilterRefs {
    const { fromVal, toVal, fromInp, toInp } = buildDateRange(state);
    const rsnVal = { v: state.rsn ?? "" };
    const rsnInp = glassInput({
        value: rsnVal.v,
        placeholder: "Filter by RSN…",
        ariaLabel: "Filter by RSN substring",
        autocomplete: "off",
        onInput: (e) => {
            rsnVal.v = (e.target as HTMLInputElement).value;
        },
    });
    rsnInp.el.style.flex = "1";
    rsnInp.el.style.minInlineSize = "0";
    return { fromVal, toVal, rsnVal, fromInp, toInp, rsnInp };
}

function resetFilterRefs(refs: FilterRefs, handlers: RowListHandlers): void {
    refs.fromVal.v = "";
    refs.toVal.v = "";
    refs.rsnVal.v = "";
    refs.rsnInp.el.value = "";
    handlers.onFilterChange(null, null, null);
}

function buildFilterButtons(args: { refs: FilterRefs; handlers: RowListHandlers; applyFilter: () => void }): {
    apply: Instance;
    clear: Instance;
} {
    const { refs, handlers, applyFilter } = args;
    const apply = button({
        variant: BTN_VARIANT_OUTLINE,
        text: "Apply",
        context: "apply the date range and RSN filter",
        meta: ["action", "data"],
        onClick: applyFilter,
    });
    const clear = button({
        variant: BTN_VARIANT_OUTLINE,
        text: "Clear",
        context: "clear the date range and RSN filter",
        meta: ["action", "data"],
        onClick: () => resetFilterRefs(refs, handlers),
    });
    return { apply, clear };
}

function assembleFilterChildren(refs: FilterRefs, apply: Instance, clear: Instance): Instance[] {
    return [span(textProps([DR_LABEL_CLASS], "Range")), refs.fromInp, refs.toInp, refs.rsnInp, apply, clear];
}

export function buildFilterBar(state: RowListState, handlers: RowListHandlers): Instance {
    const refs = buildFilterInputs(state);
    const applyFilter = (): void => {
        handlers.onFilterChange(
            parseDate(refs.fromVal.v, false),
            parseDate(refs.toVal.v, true),
            normalizeRsn(refs.rsnVal.v),
        );
    };
    wireKey(refs.rsnInp.el, "keydown", (e) => {
        if (e.key === "Enter") applyFilter();
    });
    const { apply, clear } = buildFilterButtons({ refs, handlers, applyFilter });
    const children = assembleFilterChildren(refs, apply, clear);
    if (state.info?.canBulkDelete && state.from !== null && state.to !== null) {
        children.push(buildBulkRow(state, handlers));
    }
    return div(baseProps([DR_FILTER_BAR_CLASS]), children);
}
