import { icon, snapshot, span, type Instance, textProps } from "../../../../factory";
import type { ClanAuditEntry } from "../../../../../state/clans/clans-client/index.js";
import { present } from "../../../../../state/clans/audit-presenters/index.js";
import type { ClusterRow } from "../../../../../state/clans/audit/cluster-defs.js";
import { fmtActor, fmtRelative } from "../../../../../state/clans/audit/formatter-audit.js";
import {
    AUDIT_ACTION_CLASS,
    AUDIT_ACTOR_CLASS,
    AUDIT_DURATION_CLASS,
    AUDIT_ICON_CLASS,
    AUDIT_ROW_CLASS,
    AUDIT_ROW_CLUSTERED_CLASS,
    AUDIT_ROW_EXPANDABLE_CLASS,
    AUDIT_TARGET_CLASS,
    AUDIT_TS_CLASS,
} from "../../../../../shared/constants/clan/audit-route-constants.js";

export interface AuditCells {
    iconInst: Instance;
    tsInst: Instance;
    titleInst: Instance;
    actorInst: Instance;
    detailInst: Instance;
    durationInst: Instance;
    actor: string;
}

export function titleText(entry: ClanAuditEntry, count: number): string {
    const base = present(entry).title;
    return count > 1 ? `${base} ×${count}` : base;
}

function buildTitleCells(
    entry: ClusterRow["head"],
    cluster: ClusterRow,
    presented: ReturnType<typeof present>,
): { iconInst: Instance; tsInst: Instance; titleInst: Instance } {
    const iconInst = icon({
        provider: presented.icon.provider,
        name: presented.icon.name,
        classes: [AUDIT_ICON_CLASS],
        context: null,
        meta: null,
    });
    const tsInst = span(textProps([AUDIT_TS_CLASS], snapshot(fmtRelative(entry.ts))));
    const titleInst = span(textProps([AUDIT_ACTION_CLASS], titleText(entry, cluster.count))).setAttr(
        "title",
        entry.action,
    );
    return { iconInst, tsInst, titleInst };
}

export function buildAuditCells(cluster: ClusterRow, presented: ReturnType<typeof present>): AuditCells {
    const entry = cluster.head;
    const { iconInst, tsInst, titleInst } = buildTitleCells(entry, cluster, presented);
    const actor = fmtActor(entry);
    const actorInst = span(textProps([AUDIT_ACTOR_CLASS], snapshot(actor)));
    const detailInst = span(textProps([AUDIT_TARGET_CLASS], snapshot(presented.detail)));
    const durationInst = span(
        textProps([AUDIT_DURATION_CLASS], typeof entry.elapsedMs === "number" ? `${entry.elapsedMs}ms` : ""),
    );
    return { iconInst, tsInst, titleInst, actorInst, detailInst, durationInst, actor };
}

export function auditRowClasses(presented: ReturnType<typeof present>, cluster: ClusterRow): string[] {
    const rowClasses = [AUDIT_ROW_CLASS, `${AUDIT_ROW_CLASS}--${presented.semantic}`];
    if (presented.hasExpansion) rowClasses.push(AUDIT_ROW_EXPANDABLE_CLASS);
    if (cluster.count > 1) rowClasses.push(AUDIT_ROW_CLUSTERED_CLASS);
    return rowClasses;
}

export function makeAuditAria(id: number, title: string, actor: string | null): string {
    const actorSuffix = actor && actor !== "system" ? ` · by ${actor}` : "";
    return `audit #${id} · ${title}${actorSuffix}`;
}
