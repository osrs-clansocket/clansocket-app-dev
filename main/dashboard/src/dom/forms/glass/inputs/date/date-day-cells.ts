import { button, span, type Instance, textProps } from "../../../../factory/index.js";
import { DATA_KEY_DATE, GD_DAY, GD_DAY_MUTED, GD_DAY_SELECTED, GD_DAY_TODAY, GD_DOW } from "./classes.js";
import { isoDate } from "./iso.js";
import { DAYS_PER_WEEK, DOW_LABELS, WEEKS_SHOWN } from "./date-month-utils.js";

interface DayCtx {
    iso: string;
    inMonth: boolean;
    today: string;
    selectedIso: string;
    label: string;
}

function buildDayBtn(ctx: DayCtx): Instance {
    const classes = [
        GD_DAY,
        ...(ctx.inMonth ? [] : [GD_DAY_MUTED]),
        ...(ctx.iso === ctx.today ? [GD_DAY_TODAY] : []),
        ...(ctx.iso === ctx.selectedIso ? [GD_DAY_SELECTED] : []),
    ];
    return button({
        classes,
        type: "button",
        data: { [DATA_KEY_DATE]: ctx.iso },
        text: ctx.label,
        context: "select this date",
        meta: ["choice"],
    });
}

export function buildDayCells(start: Date, month: number, today: string, selectedIso: string): Instance[] {
    const cells: Instance[] = DOW_LABELS.map((l) => span(textProps([GD_DOW], l)));
    const cursor = new Date(start);
    for (let i = 0; i < WEEKS_SHOWN * DAYS_PER_WEEK; i++) {
        cells.push(
            buildDayBtn({
                today,
                selectedIso,
                iso: isoDate(cursor),
                inMonth: cursor.getUTCMonth() === month,
                label: String(cursor.getUTCDate()),
            }),
        );
        cursor.setUTCDate(cursor.getUTCDate() + 1);
    }
    return cells;
}
