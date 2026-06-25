import { div, expandWithFade, snapshot, span, type Instance } from "../../../../factory";
import type { ClanAuditEntry } from "../../../../../state/clans/clans-client/index.js";
import { present } from "../../../../../state/clans/audit-presenters/index.js";
import type { ClusterRow } from "../../../../../state/clans/audit/cluster-defs.js";
import { fmtRelative } from "../../../../../state/clans/audit/format.js";
import { canRevertEntry, loadRevertExpansion } from "./expansion.js";
import { auditRowClasses, buildAuditCells, makeAuditAria, titleText } from "./row-cells.js";
import {
    AUDIT_CHEVRON_CLASS,
    AUDIT_EXPANSION_CLASS,
    AUDIT_REVERT_CONFIRMED_CLASS,
    AUDIT_ROW_CLUSTERED_CLASS,
    AUDIT_ROW_EXPANDABLE_CLASS,
    AUDIT_ROW_OPEN_CLASS,
    AUDIT_ROW_REVERTED_CLASS,
} from "../../../../../shared/constants/clan/audit-route-constants.js";

interface RowRefs {
    title: Instance;
    ts: Instance;
    detail: Instance;
}

const rowRefs = new WeakMap<HTMLElement, RowRefs>();

function revertClusterRow(expansion: Instance, row: Instance): void {
    row.toggleClass(AUDIT_ROW_REVERTED_CLASS, true);
    expansion.setChildren(
        span({ classes: [AUDIT_REVERT_CONFIRMED_CLASS], text: "Reverted.", context: null, meta: null }),
    );
}

function attachClusterExpansion(row: Instance, entry: ClanAuditEntry, slug: string): (e: MouseEvent) => void {
    const chevron = span({ classes: [AUDIT_CHEVRON_CLASS], text: "▸", context: null, meta: null });
    const expansion = div({ classes: [AUDIT_EXPANSION_CLASS], hidden: "", context: null, meta: null });
    row.addChild(chevron);
    row.addChild(expansion);
    let loaded = false;
    let open = false;
    const doToggle = async (): Promise<void> => {
        open = !open;
        row.toggleClass(AUDIT_ROW_OPEN_CLASS, open);
        chevron.setText(open ? "▾" : "▸");
        expandWithFade(expansion.el, open);
        if (!open || loaded) return;
        loaded = true;
        const content = await loadRevertExpansion(entry, slug, () => revertClusterRow(expansion, row));
        expansion.setChildren(content);
    };
    return (e: MouseEvent): void => {
        if (!(e.target instanceof Node) || expansion.el.contains(e.target)) return;
        void doToggle();
    };
}

export function mountClusterRow(cluster: ClusterRow, slug: string): Instance {
    const entry = cluster.head;
    const presented = present(entry);
    const cells = buildAuditCells(cluster, presented);
    const toggleRef: { fn: ((e: MouseEvent) => void) | null } = { fn: null };
    const row = div(
        {
            classes: auditRowClasses(presented, cluster),
            key: `audit-${entry.id}`,
            ariaLabel: makeAuditAria(entry.id, presented.title, cells.actor),
            context: "expand or collapse this audit entry's details",
            meta: ["disclosure", "audit"],
            onClick: (e) => toggleRef.fn?.(e),
        },
        [cells.iconInst, cells.tsInst, cells.titleInst, cells.actorInst, cells.detailInst, cells.durationInst],
    );
    rowRefs.set(row.el, { title: cells.titleInst, ts: cells.tsInst, detail: cells.detailInst });
    if (presented.hasExpansion || canRevertEntry(entry)) {
        row.toggleClass(AUDIT_ROW_EXPANDABLE_CLASS, true);
        toggleRef.fn = attachClusterExpansion(row, entry, slug);
    }
    return row;
}

export function patchClusterRow(inst: Instance, cluster: ClusterRow): void {
    const refs = rowRefs.get(inst.el);
    if (!refs) return;
    const entry = cluster.head;
    refs.title.setText(titleText(entry, cluster.count));
    refs.ts.setText(snapshot(fmtRelative(entry.ts)));
    refs.detail.setText(present(entry).detail);
    inst.toggleClass(AUDIT_ROW_CLUSTERED_CLASS, cluster.count > 1);
    inst.setAttr("data-key", `audit-${entry.id}`);
}
