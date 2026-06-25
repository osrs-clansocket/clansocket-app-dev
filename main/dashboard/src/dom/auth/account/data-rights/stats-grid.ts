import { div, paragraph, span, type Instance } from "../../../factory";
import type { UserDataStats } from "../../../../state/data-rights/data-rights-client/index.js";
import { formatBytes, formatCount, formatSince } from "./format.js";
import { FORM_HINT } from "../../../forms/form-classes.js";
import {
    ACCOUNT_STAT_CLASS,
    ACCOUNT_STAT_LABEL_CLASS,
    ACCOUNT_STAT_VALUE_CLASS,
    ACCOUNT_STATS_CLASS,
} from "../../../../shared/constants/account-constants.js";

function buildStat(label: string, valueText: string, titleText?: string): Instance {
    const value = span({ classes: [ACCOUNT_STAT_VALUE_CLASS], text: valueText, context: null, meta: null });
    if (titleText) value.setAttr("title", titleText);
    return div({ classes: [ACCOUNT_STAT_CLASS], context: null, meta: null }, [
        span({ classes: [ACCOUNT_STAT_LABEL_CLASS], text: label, context: null, meta: null }),
        value,
    ]);
}

function emptyStatsPara(text: string): ReturnType<typeof paragraph> {
    return paragraph({ text, classes: [FORM_HINT], context: null, meta: null });
}

function statsPlaceholder(stats: UserDataStats | null): ReturnType<typeof paragraph> | null {
    if (!stats) return emptyStatsPara("Couldnt load stats.");
    if (stats.totalRows === 0) return emptyStatsPara("No game data linked to ur account.");
    return null;
}

export function buildStatsGrid(): { el: HTMLElement; set(stats: UserDataStats | null): void } {
    const wrap = div({ classes: [ACCOUNT_STATS_CLASS], context: null, meta: null }, [emptyStatsPara("Loading…")]);
    return {
        el: wrap.el,
        set(stats: UserDataStats | null): void {
            const placeholder = statsPlaceholder(stats);
            if (placeholder !== null) {
                wrap.setChildren(placeholder);
                return;
            }
            const sinceTitle = stats!.firstEntryAt ? new Date(stats!.firstEntryAt).toISOString() : undefined;
            wrap.setChildren(
                buildStat("rows", formatCount(stats!.totalRows)),
                buildStat("size", formatBytes(stats!.totalBytes)),
                buildStat("dbs", formatCount(stats!.totalDbs)),
                buildStat("since", formatSince(stats!.firstEntryAt), sinceTitle),
            );
        },
    };
}
