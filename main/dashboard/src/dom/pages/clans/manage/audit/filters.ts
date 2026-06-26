import { button, div, span, type Instance, baseProps, textProps } from "../../../../factory";
import { KIND_FILTERS, RANGE_FILTERS } from "../../../../../state/clans/audit/filter-defs.js";
import { AUDIT_FILTERS_CLASS } from "../../../../../shared/constants/clan/audit-route-constants.js";
import {
    TOOLBAR_CHIP_ACTIVE_CLASS,
    TOOLBAR_CHIP_CLASS,
    TOOLBAR_CLASS,
    TOOLBAR_GROUP_CLASS,
    TOOLBAR_LABEL_CLASS,
} from "../../../../../shared/constants/toolbar-component-constants.js";

export interface FilterBarState {
    activeKind: string;
    activeRange: string;
}

interface FilterChipOpts {
    state: FilterBarState;
    f: { key: string; label: string };
    activeKeyField: "activeKind" | "activeRange";
    dataKey: "filter-key" | "filter-range";
    onChange: (key: string) => void;
}

function buildFilterChip({ state, f, activeKeyField, dataKey, onChange }: FilterChipOpts): Instance {
    return button({
        classes: [TOOLBAR_CHIP_CLASS, ...(f.key === state[activeKeyField] ? [TOOLBAR_CHIP_ACTIVE_CLASS] : [])],
        text: f.label,
        data: { [dataKey]: f.key },
        context: `filter the audit log by ${f.label}`,
        meta: ["choice", "audit"],
        onClick: () => onChange(f.key),
    });
}

function chipGroup(label: string, chips: Instance[]): Instance {
    return div(baseProps([TOOLBAR_GROUP_CLASS]), [span(textProps([TOOLBAR_LABEL_CLASS], label)), ...chips]);
}

export function buildFilterBar(
    state: FilterBarState,
    onKindChange: (key: string) => void,
    onRangeChange: (key: string) => void,
    integrityHost: Instance,
): Instance {
    const kindChips = KIND_FILTERS.map((f) =>
        buildFilterChip({ state, f, activeKeyField: "activeKind", dataKey: "filter-key", onChange: onKindChange }),
    );
    const rangeChips = RANGE_FILTERS.map((f) =>
        buildFilterChip({ state, f, activeKeyField: "activeRange", dataKey: "filter-range", onChange: onRangeChange }),
    );
    return div(baseProps([TOOLBAR_CLASS, AUDIT_FILTERS_CLASS]), [
        chipGroup("Kind", kindChips),
        chipGroup("Since", rangeChips),
        integrityHost,
    ]);
}
