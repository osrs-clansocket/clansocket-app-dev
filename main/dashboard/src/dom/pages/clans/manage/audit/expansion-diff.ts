import { div, paragraph, pre, snapshot, span, type Instance } from "../../../../factory";
import type { ClanAuditEntry, ClanRosterDiff } from "../../../../../state/clans/clans-client/index.js";
import { fmtDiff, fmtDiffEvent } from "../../../../../state/clans/audit/format.js";
import {
    AUDIT_BA_AFTER_CLASS,
    AUDIT_BA_ARROW_CLASS,
    AUDIT_BA_BEFORE_CLASS,
    AUDIT_BA_FIELD_CLASS,
    AUDIT_BA_ROW_CHANGED_CLASS,
    AUDIT_BA_ROW_CLASS,
    AUDIT_DIFF_EMPTY_CLASS,
    AUDIT_DIFF_EVENT_CLASS,
    AUDIT_DIFF_LIST_CLASS,
    AUDIT_DIFF_MEMBER_CLASS,
    AUDIT_DIFF_ROW_CLASS,
    AUDIT_RAW_CLASS,
    AUDIT_RAW_PRE_CLASS,
} from "../../../../../shared/constants/clan/audit-route-constants.js";

export function emptyDiff(text: string): Instance {
    return paragraph({ text, classes: [AUDIT_DIFF_EMPTY_CLASS], context: null, meta: null });
}

export function buildDiffList(diffs: ClanRosterDiff[]): Instance {
    if (diffs.length === 0) return emptyDiff("No diff detail.");
    return div(
        { classes: [AUDIT_DIFF_LIST_CLASS], context: null, meta: null },
        diffs.map((d) =>
            div({ classes: [AUDIT_DIFF_ROW_CLASS], context: null, meta: null }, [
                span({ classes: [AUDIT_DIFF_MEMBER_CLASS], text: d.memberName, context: null, meta: null }),
                span({
                    classes: [AUDIT_DIFF_EVENT_CLASS],
                    text: snapshot(fmtDiffEvent(d)),
                    context: null,
                    meta: null,
                }),
            ]),
        ),
    );
}

function diffRow(field: string, b: unknown, a: unknown): Instance {
    const changed = JSON.stringify(b ?? null) !== JSON.stringify(a ?? null);
    const rowClasses = [AUDIT_BA_ROW_CLASS];
    if (changed) rowClasses.push(AUDIT_BA_ROW_CHANGED_CLASS);
    return div({ classes: rowClasses, context: null, meta: null }, [
        span({ classes: [AUDIT_BA_FIELD_CLASS], text: field, context: null, meta: null }),
        span({ classes: [AUDIT_BA_BEFORE_CLASS], text: snapshot(fmtDiff(b)), context: null, meta: null }),
        span({ classes: [AUDIT_BA_ARROW_CLASS], text: "→", context: null, meta: null }),
        span({ classes: [AUDIT_BA_AFTER_CLASS], text: snapshot(fmtDiff(a)), context: null, meta: null }),
    ]);
}

export function buildDiff(entry: ClanAuditEntry): Instance {
    const before = (entry.payload?.before ?? null) as Record<string, unknown> | null;
    const after = (entry.payload?.after ?? null) as Record<string, unknown> | null;
    if (after === null) return emptyDiff("No before/after detail.");
    const fields = new Set<string>();
    if (before) for (const k of Object.keys(before)) fields.add(k);
    for (const k of Object.keys(after)) fields.add(k);
    if (fields.size === 0) return emptyDiff("No fields changed.");
    const rows: Instance[] = [];
    for (const field of fields) rows.push(diffRow(field, before?.[field], after[field]));
    return div({ classes: [AUDIT_DIFF_LIST_CLASS], context: null, meta: null }, rows);
}

export function buildRawPayload(entry: ClanAuditEntry): Instance {
    return div({ classes: [AUDIT_RAW_CLASS], context: null, meta: null }, [
        pre({
            classes: [AUDIT_RAW_PRE_CLASS],
            text: JSON.stringify(entry.payload ?? {}, null, 2),
            context: null,
            meta: null,
        }),
    ]);
}
