import "../../../../../styles/pages/clans/manage/review-queue/clan-review-queue-page.css";
import {
    div,
    span,
    button,
    baseProps,
    textProps,
    signal,
    effect,
    BTN_VARIANT_OUTLINE,
    BTN_VARIANT_PRIMARY,
    type Instance,
} from "../../../../factory";
import { clansStore } from "../../../../../state/clans/stores/clans-store.js";
import {
    listReviewQueue,
    approveReview,
    cancelReview,
    type ReviewQueueRow,
} from "./review-queue-client.js";

const ROOT_CLASS = "clans-manage__review-queue";
const HEADER_CLASS = "clans-manage__review-queue-header";
const LIST_CLASS = "clans-manage__review-queue-list";
const ROW_CLASS = "clans-manage__review-queue-row";
const META_CLASS = "clans-manage__review-queue-meta";
const ACTIONS_CLASS = "clans-manage__review-queue-actions";
const EMPTY_CLASS = "clans-manage__review-queue-empty";

function resolveClanId(slug: string): string {
    const found = clansStore.managed$().find((c) => c.slug === slug);
    return found ? found.id : slug;
}

function buildRow(clanId: string, row: ReviewQueueRow, onChange: () => void): Instance {
    const meta = div(baseProps([META_CLASS]), [
        span(textProps([], `Flow: ${row.flow_name}`)),
        span(textProps([], `Op: ${row.operation_ref ?? "(unknown)"}`)),
        span(textProps([], `Node: ${row.action_id}`)),
    ]);
    const approveBtn = button({
        variant: BTN_VARIANT_PRIMARY,
        text: "Approve",
        context: "approve the pending manual action",
        meta: ["action"],
        onClick: async () => {
            await approveReview(clanId, row.id, null);
            onChange();
        },
    });
    const cancelBtn = button({
        variant: BTN_VARIANT_OUTLINE,
        text: "Cancel",
        context: "cancel the pending manual action",
        meta: ["action", "destructive"],
        onClick: async () => {
            await cancelReview(clanId, row.id, null);
            onChange();
        },
    });
    const actions = div(baseProps([ACTIONS_CLASS]), [approveBtn, cancelBtn]);
    return div(baseProps([ROW_CLASS]), [meta, actions]);
}

export function build(slug: string): HTMLElement {
    const clanId = resolveClanId(slug);
    const rowsSignal = signal<readonly ReviewQueueRow[]>([]);
    const refresh = async (): Promise<void> => {
        const rows = await listReviewQueue(clanId);
        rowsSignal.set(rows);
    };
    void refresh();
    const header = div(baseProps([HEADER_CLASS]), [
        span(textProps([], "Pending manual approvals")),
        button({
            variant: BTN_VARIANT_OUTLINE,
            text: "Refresh",
            context: "refresh the pending review list",
            meta: ["action"],
            onClick: () => {
                void refresh();
            },
        }),
    ]);
    const listHost = div(baseProps([LIST_CLASS]));
    effect(() => {
        const rows = rowsSignal();
        if (rows.length === 0) {
            listHost.setChildren(span(textProps([EMPTY_CLASS], "No pending approvals.")));
            return;
        }
        listHost.setChildren(...rows.map((r) => buildRow(clanId, r, () => void refresh())));
    });
    const host = div(baseProps([ROOT_CLASS]), [header, listHost]);
    return host.el;
}
