import { div, snapshot, span, type Child, type Instance, baseProps, textProps } from "../../../../factory";
import { fmtSpan } from "../../../../../state/clans/audit/formatter-audit.js";
import {
    AUDIT_STATS_BREAKDOWN_CLASS,
    AUDIT_STATS_CLASS,
    AUDIT_STATS_SPAN_CLASS,
    AUDIT_STATS_TOTAL_CLASS,
} from "../../../../../shared/constants/clan/audit-route-constants.js";
import type { AggregateStats } from "../../../../../state/clans/audit/side-info-stats.js";

function breakdownText(stats: AggregateStats): string {
    const parts = [
        (stats.bySemantic.write ?? 0) > 0 ? `${stats.bySemantic.write} writes` : null,
        (stats.bySemantic.destructive ?? 0) > 0 ? `${stats.bySemantic.destructive} destructive` : null,
        (stats.bySemantic.read ?? 0) > 0 ? `${stats.bySemantic.read} reads` : null,
        (stats.bySemantic.chain ?? 0) > 0 ? `${stats.bySemantic.chain} client` : null,
    ].filter((s): s is string => s !== null);
    return parts.join(" · ");
}

export function buildAnalyticsStrip(stats: AggregateStats): Instance {
    const total = stats.total;
    const children: Child[] = [
        span(textProps([AUDIT_STATS_TOTAL_CLASS], `${total} ${total === 1 ? "entry" : "entries"}`)),
    ];
    const breakdown = breakdownText(stats);
    if (breakdown.length > 0) {
        children.push(span(textProps([AUDIT_STATS_BREAKDOWN_CLASS], breakdown)));
    }
    const span_ = fmtSpan(stats.earliestTs, stats.latestTs);
    if (span_.length > 0) {
        children.push(span(textProps([AUDIT_STATS_SPAN_CLASS], snapshot(`Spanning ${span_}`))));
    }
    return div(baseProps([AUDIT_STATS_CLASS]), children);
}
