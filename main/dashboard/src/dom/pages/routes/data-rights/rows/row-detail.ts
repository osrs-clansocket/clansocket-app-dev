import {
    BTN_VARIANT_OUTLINE,
    button,
    div,
    icon,
    paragraph,
    span,
    type Instance,
    baseProps,
    textProps,
} from "../../../../factory/index.js";
import { glassSecret } from "../../../../forms/glass/inputs/glass-secret.js";
import type { BrowseResponse, Scope } from "../../../../../state/data-rights/data-rights-client/index.js";
import { rowSummary } from "../../../../../state/data-rights/summary.js";
import { resolveColumnAsset } from "../../../../../state/data-rights/assets/asset-resolver.js";
import { buildAssetIcon, buildExpandIcon, formatValue } from "./row-detail-codepanel.js";
import {
    DR_DETAIL_BODY_CLASS,
    DR_DETAIL_PANE_CLASS,
    DR_EMPTY_CLASS,
    DR_FIELD_CLASS,
    DR_FIELD_LABEL_CLASS,
    DR_FIELD_TEXT_CLASS,
    DR_FIELD_VALUE_CLASS,
    DR_PANE_HEADER_CLASS,
    DR_PANE_TITLE_CLASS,
    DR_SECURITY_NOTE_BODY_CLASS,
    DR_SECURITY_NOTE_CLASS,
    DR_SECURITY_NOTE_ICON_CLASS,
    DR_SECURITY_NOTE_TEXT_CLASS,
    DR_SECURITY_NOTE_TITLE_CLASS,
} from "../../../../../shared/constants/rights-constants.js";
import { GLASS_PANE_INNER_CLASS } from "../../../../../shared/constants/glass-constants.js";

const LONG_VALUE_THRESHOLD = 80;

export interface RowDetailState {
    scope: Scope;
    table: string;
    row: Record<string, unknown> | null;
    info: BrowseResponse | null;
}

export interface RowDetailHandlers {
    onBack?: () => void;
}

function buildFieldValue(col: string, text: string, isSecret: boolean, assetSrc: string | null): Instance {
    const needsExpand = text.length > LONG_VALUE_THRESHOLD || text.includes("\n");
    const valueChildren: Instance[] = [];
    const assetInst = buildAssetIcon(assetSrc, col);
    if (assetInst !== null) valueChildren.push(assetInst);
    if (isSecret) valueChildren.push(glassSecret(text));
    else valueChildren.push(span({ text, classes: [DR_FIELD_TEXT_CLASS], context: null, meta: null }));
    if (needsExpand) valueChildren.push(buildExpandIcon(col, text, isSecret));
    return div(baseProps([DR_FIELD_VALUE_CLASS]), valueChildren);
}

interface BuildFieldArgs {
    table: string;
    col: string;
    value: unknown;
    row: Record<string, unknown>;
    secrets: Set<string>;
}

function buildField(args: BuildFieldArgs): Instance {
    const { table, col, value, row, secrets } = args;
    const text = formatValue(value);
    const isSecret = secrets.has(col) && text !== "—";
    const assetSrc = resolveColumnAsset(table, col, value, row);
    return div(baseProps([DR_FIELD_CLASS]), [
        span(textProps([DR_FIELD_LABEL_CLASS], col)),
        buildFieldValue(col, text, isSecret, assetSrc),
    ]);
}

function headerTitle(state: RowDetailState): string {
    if (!state.row || !state.info) return "Row";
    return rowSummary({
        table: state.table,
        row: state.row,
        pkCols: state.info.pkCols,
        tsCol: state.info.tsCol,
        secretColumns: state.info.secretColumns,
    }).primary;
}

function buildHeader(state: RowDetailState, handlers: RowDetailHandlers): Instance {
    const children: Instance[] = [];
    if (handlers.onBack) {
        children.push(
            button({
                variant: BTN_VARIANT_OUTLINE,
                text: "← Rows",
                context: "go back to the row list",
                meta: ["nav", "data"],
                onClick: () => handlers.onBack!(),
            }),
        );
    }
    children.push(span(textProps([DR_PANE_TITLE_CLASS], headerTitle(state))));
    return div(baseProps([DR_PANE_HEADER_CLASS]), children);
}

function buildSecurityNote(excluded: readonly string[]): Instance {
    const text = `${excluded.length} field(s) hidden from this view: ${excluded.join(", ")}. These hold cryptographic material (hashes, keys, challenge tokens) that cant be reversed — withholding them from your own view limits exposure if your account is ever breached.`;
    return div(baseProps([DR_SECURITY_NOTE_CLASS]), [
        icon({
            name: "shield-lock-fill",
            classes: [DR_SECURITY_NOTE_ICON_CLASS],
            context: null,
            meta: null,
        }),
        div(baseProps([DR_SECURITY_NOTE_BODY_CLASS]), [
            span(textProps([DR_SECURITY_NOTE_TITLE_CLASS], "Kept private for your security")),
            paragraph({ text, classes: [DR_SECURITY_NOTE_TEXT_CLASS], context: null, meta: null }),
        ]),
    ]);
}

export function buildRowDetail(state: RowDetailState, handlers: RowDetailHandlers): Instance {
    if (!state.row || !state.info) {
        return div(baseProps([GLASS_PANE_INNER_CLASS, DR_DETAIL_PANE_CLASS]), [
            paragraph(textProps([DR_EMPTY_CLASS], "Select a row to view.")),
        ]);
    }
    const secrets = new Set(state.info.secretColumns);
    const cols = Object.keys(state.row);
    const fields = cols.map((c) =>
        buildField({ table: state.table, col: c, value: state.row![c], row: state.row!, secrets }),
    );
    const bodyChildren: Instance[] = [];
    if (state.info.excludedColumns.length > 0) bodyChildren.push(buildSecurityNote(state.info.excludedColumns));
    bodyChildren.push(...fields);
    const body = div(baseProps([DR_DETAIL_BODY_CLASS]), bodyChildren);
    return div(baseProps([GLASS_PANE_INNER_CLASS, DR_DETAIL_PANE_CLASS]), [buildHeader(state, handlers), body]);
}
