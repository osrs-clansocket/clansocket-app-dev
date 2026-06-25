import { createInstance, div, effect, paragraph, type Instance } from "../../../factory";
import { consentsStore } from "../../../../state/identity/stores/consents-store.js";
import type { ConsentRecord } from "../../../../state/identity/consent/consent-client.js";
import { buildPendingRow, buildResolvedRow } from "./rows.js";
import { FORM_HINT } from "../../../forms/form-classes.js";
import { ACCOUNT_EMPTY_CLASS, ACCOUNT_LIST_CLASS } from "../../../../shared/constants/account-constants.js";

const FOOTER_HINT = "Cancel anything pending here. Older requests stay listed as ur record.";

interface ConsentsRenderer {
    render: (rows: ConsentRecord[]) => void;
}

function placeConsentChildren(host: Instance, children: readonly Instance[]): void {
    let nextEl: ChildNode | null = host.el.firstChild;
    for (const child of children) {
        if (child.el === nextEl) nextEl = nextEl?.nextSibling ?? null;
        else host.addBefore(child, nextEl);
    }
    while (nextEl !== null) {
        const drop = nextEl;
        nextEl = nextEl.nextSibling;
        createInstance(drop as HTMLElement).detach();
    }
}

function reconcileConsentPool(
    rowPool: Map<string, Instance>,
    rows: ConsentRecord[],
    refresh: () => void,
    status: Instance,
): void {
    const live = new Set<string>();
    for (const r of rows) {
        const key = String(r.id);
        live.add(key);
        if (!rowPool.has(key)) {
            rowPool.set(key, r.status === "pending" ? buildPendingRow(r, refresh, status) : buildResolvedRow(r));
        }
    }
    for (const [key, inst] of rowPool) {
        if (!live.has(key)) {
            inst.destroy();
            rowPool.delete(key);
        }
    }
}

function orderConsentRows(rows: ConsentRecord[], rowPool: Map<string, Instance>): Instance[] {
    const ordered: Instance[] = [];
    for (const r of rows) {
        const inst = rowPool.get(String(r.id));
        if (inst !== undefined) ordered.push(inst);
    }
    return ordered;
}

function makeRenderEmpty(
    host: Instance,
    rowPool: Map<string, Instance>,
    emptyRef: { inst: Instance | null },
): () => void {
    return (): void => {
        for (const inst of rowPool.values()) inst.destroy();
        rowPool.clear();
        if (emptyRef.inst === null)
            emptyRef.inst = paragraph({
                classes: [ACCOUNT_EMPTY_CLASS],
                text: "No consent records yet.",
                context: null,
                meta: null,
            });
        placeConsentChildren(host, [emptyRef.inst]);
    };
}

function createConsentsRenderer(host: Instance, refresh: () => void, status: Instance): ConsentsRenderer {
    const rowPool = new Map<string, Instance>();
    const emptyRef: { inst: Instance | null } = { inst: null };
    const renderEmpty = makeRenderEmpty(host, rowPool, emptyRef);
    const render = (rows: ConsentRecord[]): void => {
        if (rows.length === 0) {
            renderEmpty();
            return;
        }
        if (emptyRef.inst !== null) {
            emptyRef.inst.destroy();
            emptyRef.inst = null;
        }
        reconcileConsentPool(rowPool, rows, refresh, status);
        placeConsentChildren(host, orderConsentRows(rows, rowPool));
    };
    return { render };
}

import { accountPanel } from "../account-panel.js";
import { defineAccountPanel } from "../registry.js";

defineAccountPanel({ key: "consent", order: 80, build: () => buildConsentPanel() });

export function buildConsentPanel(): Instance {
    const status = paragraph({ classes: [FORM_HINT], text: "", context: null, meta: null });
    status.el.hidden = true;
    const host = div({ classes: [ACCOUNT_LIST_CLASS], context: null, meta: null });
    const root = accountPanel({
        title: "Requests",
        body: [host, status],
        footer: [paragraph({ classes: [FORM_HINT], text: FOOTER_HINT, context: null, meta: null })],
    });
    const renderer = createConsentsRenderer(host, () => void consentsStore.refresh(), status);
    root.trackDispose(effect(() => renderer.render(consentsStore.list$())));
    return root;
}
