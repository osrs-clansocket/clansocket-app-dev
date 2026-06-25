import { div, type Instance } from "../../../../factory/index.js";
import { GD_GRID } from "./classes.js";
import { isoDate } from "./iso.js";
import { DAYS_PER_WEEK, monthFirstUTC } from "./date-month-utils.js";
import { buildNavRow } from "./date-nav-row.js";
import { buildDayCells } from "./date-day-cells.js";

export * from "./classes.js";
export { isoDate, parseIso } from "./iso.js";

export function buildPopupContents(viewDate: Date, selectedIso: string): Instance {
    const today = isoDate(new Date());
    const month = viewDate.getUTCMonth();
    const first = monthFirstUTC(viewDate.getUTCFullYear(), month);
    const firstDow = (first.getUTCDay() + DAYS_PER_WEEK - 1) % DAYS_PER_WEEK;
    const start = new Date(first);
    start.setUTCDate(1 - firstDow);
    const cells = buildDayCells(start, month, today, selectedIso);
    return div({ context: null, meta: null }, [
        buildNavRow(viewDate),
        div({ classes: [GD_GRID], context: null, meta: null }, cells),
    ]);
}
