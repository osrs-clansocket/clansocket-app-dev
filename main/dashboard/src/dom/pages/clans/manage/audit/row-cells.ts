import { icon, snapshot, span, type Instance } from "../../../../factory";
import type { ClanAuditEntry } from "../../../../../state/clans/clans-client/index.js";
import { present } from "../../../../../state/clans/audit-presenters/index.js";
import type { ClusterRow } from "../../../../../state/clans/audit/cluster-defs.js";
import { fmtActor, fmtRelative } from "../../../../../state/clans/audit/format.js";
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
        name: presented.icon.replace("bi-", ""),
        classes: [AUDIT_ICON_CLASS],
        context: null,
        meta: null,
    });
    const tsInst = span({
        classes: [AUDIT_TS_CLASS],
        text: snapshot(fmtRelative(entry.ts)),
        context: null,
        meta: null,
    });
    const titleInst = span({
        classes: [AUDIT_ACTION_CLASS],
        text: titleText(entry, cluster.count),
        context: null,
        meta: null,
    }).setAttr("title", entry.action);
    return { iconInst, tsInst, titleInst };
}

export function buildAuditCells(cluster: ClusterRow, presented: ReturnType<typeof present>): AuditCells {
    const entry = cluster.head;
    const { iconInst, tsInst, titleInst } = buildTitleCells(entry, cluster, presented);
    const actor = fmtActor(entry);
    const actorInst = span({ classes: [AUDIT_ACTOR_CLASS], text: snapshot(actor), context: null, meta: null });
    const detailInst = span({
        classes: [AUDIT_TARGET_CLASS],
        text: snapshot(presented.detail),
        context: null,
        meta: null,
    });
    const durationInst = span({
        classes: [AUDIT_DURATION_CLASS],
        text: typeof entry.elapsedMs === "number" ? `${entry.elapsedMs}ms` : "",
        context: null,
        meta: null,
    });
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
