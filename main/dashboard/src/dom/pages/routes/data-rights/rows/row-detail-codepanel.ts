import { button, icon, slidePanel, type Instance } from "../../../../factory/index.js";
import { DR_EXPAND_CLASS } from "../../../../../shared/constants/rights-constants.js";
import { codePanel } from "./row-detail-code.js";

export { formatValue } from "../../../../../state/data-rights/page/rows/detail-format-value.js";
export { buildAssetIcon } from "./detail-asset-icon.js";

export function buildExpandIcon(col: string, text: string, isSecret: boolean): Instance {
    const expandIcon = icon({ name: "arrows-angle-expand", context: null, meta: null });
    const trigger = button(
        {
            classes: [DR_EXPAND_CLASS],
            type: "button",
            ariaLabel: `View full ${col}`,
            title: "View full",
            context: "open the full field value in a slide panel viewer",
            meta: ["action", "data"],
        },
        [expandIcon],
    );
    const panel = codePanel(col, text, isSecret);
    return slidePanel({ context: null, meta: null }, trigger, panel);
}
