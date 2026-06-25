import { div, snapshot, span, type Child, type Instance } from "../../../../factory";
import { fmtSpan } from "../../../../../state/clans/audit/format.js";
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
        span({
            classes: [AUDIT_STATS_TOTAL_CLASS],
            text: `${total} ${total === 1 ? "entry" : "entries"}`,
            context: null,
            meta: null,
        }),
    ];
    const breakdown = breakdownText(stats);
    if (breakdown.length > 0) {
        children.push(span({ classes: [AUDIT_STATS_BREAKDOWN_CLASS], text: breakdown, context: null, meta: null }));
    }
    const span_ = fmtSpan(stats.earliestTs, stats.latestTs);
    if (span_.length > 0) {
        children.push(
            span({ classes: [AUDIT_STATS_SPAN_CLASS], text: snapshot(`Spanning ${span_}`), context: null, meta: null }),
        );
    }
    return div({ classes: [AUDIT_STATS_CLASS], context: null, meta: null }, children);
}
