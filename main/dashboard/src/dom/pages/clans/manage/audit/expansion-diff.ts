import { div, paragraph, pre, snapshot, span, type Instance, baseProps, textProps } from "../../../../factory";
import type { ClanAuditEntry, ClanRosterDiff } from "../../../../../state/clans/clans-client/index.js";
import { fmtDiff, fmtDiffEvent } from "../../../../../state/clans/audit/formatter-audit.js";
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
            div(baseProps([AUDIT_DIFF_ROW_CLASS]), [
                span(textProps([AUDIT_DIFF_MEMBER_CLASS], d.memberName)),
                span(textProps([AUDIT_DIFF_EVENT_CLASS], snapshot(fmtDiffEvent(d)))),
            ]),
        ),
    );
}

function diffRow(field: string, b: unknown, a: unknown): Instance {
    const changed = JSON.stringify(b ?? null) !== JSON.stringify(a ?? null);
    const rowClasses = [AUDIT_BA_ROW_CLASS];
    if (changed) rowClasses.push(AUDIT_BA_ROW_CHANGED_CLASS);
    return div(baseProps(rowClasses), [
        span(textProps([AUDIT_BA_FIELD_CLASS], field)),
        span(textProps([AUDIT_BA_BEFORE_CLASS], snapshot(fmtDiff(b)))),
        span(textProps([AUDIT_BA_ARROW_CLASS], "→")),
        span(textProps([AUDIT_BA_AFTER_CLASS], snapshot(fmtDiff(a)))),
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
    return div(baseProps([AUDIT_DIFF_LIST_CLASS]), rows);
}

export function buildRawPayload(entry: ClanAuditEntry): Instance {
    return div(baseProps([AUDIT_RAW_CLASS]), [
        pre(textProps([AUDIT_RAW_PRE_CLASS], JSON.stringify(entry.payload ?? {}, null, 2))),
    ]);
}
