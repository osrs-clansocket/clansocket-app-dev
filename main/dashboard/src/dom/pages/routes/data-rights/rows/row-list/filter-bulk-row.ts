import {
    BTN_VARIANT_OUTLINE,
    button,
    div,
    INLINE_CONFIRM_HOST_CLASS,
    inlineConfirm,
    type Instance,
    baseProps,
} from "../../../../../factory/index.js";
import type { RowListHandlers, RowListState } from "./types.js";

export function buildBulkRow(state: RowListState, handlers: RowListHandlers): Instance {
    const bulkHost = div(baseProps([INLINE_CONFIRM_HOST_CLASS]));
    const bulk = button({
        variant: BTN_VARIANT_OUTLINE,
        text: "Delete range",
        context: "delete all rows in the selected date range",
        meta: ["destructive", "data"],
        onClick: async () => {
            const ok = await inlineConfirm(bulkHost, {
                cancelLabel: "Cancel",
                confirmLabel: "Delete range",
                danger: true,
                cancelContext: `keep rows in ${state.table}`,
                confirmContext: `confirm deleting rows from ${state.table}`,
            });
            if (ok) handlers.onBulkDelete(state.from!, state.to!);
        },
    });
    bulkHost.addChild(bulk);
    return bulkHost;
}
