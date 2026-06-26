import { button, div, span, type Instance, baseProps, textProps } from "../../../../factory/index.js";
import { DATA_KEY_NAV_DIR, GD_NAV, GD_NAV_BTN, GD_TITLE } from "./classes.js";
import { monthTitle } from "./date-month-utils.js";

export function buildNavRow(viewDate: Date): Instance {
    const prev = button({
        classes: [GD_NAV_BTN],
        ariaLabel: "Previous month",
        type: "button",
        data: { [DATA_KEY_NAV_DIR]: "-1" },
        text: "‹",
        context: "show the previous month",
        meta: ["action"],
    });
    const next = button({
        classes: [GD_NAV_BTN],
        ariaLabel: "Next month",
        type: "button",
        data: { [DATA_KEY_NAV_DIR]: "1" },
        text: "›",
        context: "show the next month",
        meta: ["action"],
    });
    const title = span(textProps([GD_TITLE], monthTitle(viewDate)));
    return div(baseProps([GD_NAV]), [prev, title, next]);
}
