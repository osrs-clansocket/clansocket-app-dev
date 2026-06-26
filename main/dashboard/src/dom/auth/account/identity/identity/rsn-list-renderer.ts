import { createInstance, paragraph, type Instance, textProps } from "../../../../factory/index.js";
import { ACCOUNT_EMPTY_CLASS } from "../../../../../shared/constants/account-constants.js";
import type { Identification } from "../../../../../state/identity/identity-client/index.js";
import { buildDisplacedBanner, buildVerifiedRow } from "./rows.js";
import { buildPendingRow } from "./rows-pending.js";

export interface RsnListRenderer {
    render: (data: Identification | null) => void;
}

interface RendererState {
    bannerInst: Instance | null;
    emptyInst: Instance | null;
    failedInst: Instance | null;
}

function destroyAndNull(inst: Instance | null): null {
    if (inst !== null) inst.destroy();
    return null;
}

function syncRowPool(
    rowPool: Map<string, Instance>,
    data: Identification,
    refresh: () => void,
    status: Instance,
): void {
    const live = new Set<string>();
    for (const r of data.verifiedRsns) {
        const key = `verified:${r.rsn}`;
        live.add(key);
        if (!rowPool.has(key)) rowPool.set(key, buildVerifiedRow(r, refresh, status));
    }
    for (const req of data.pendingRequests) {
        const key = `pending:${req.id}`;
        live.add(key);
        if (!rowPool.has(key)) rowPool.set(key, buildPendingRow(req, refresh, status));
    }
    for (const [key, inst] of rowPool) {
        if (!live.has(key)) {
            inst.destroy();
            rowPool.delete(key);
        }
    }
}

function syncBanner(state: RendererState, data: Identification): void {
    const showDisplaced = data.verifiedRsns.some((r) => r.displaced);
    state.bannerInst = destroyAndNull(state.bannerInst);
    if (showDisplaced) state.bannerInst = buildDisplacedBanner(data.verifiedRsns);
}

function syncEmpty(state: RendererState, isEmpty: boolean): void {
    if (isEmpty && state.emptyInst === null) {
        state.emptyInst = paragraph(textProps([ACCOUNT_EMPTY_CLASS], "No verified rsns yet."));
        return;
    }
    if (!isEmpty) state.emptyInst = destroyAndNull(state.emptyInst);
}

function assembleChildren(state: RendererState, rowPool: Map<string, Instance>, data: Identification): Instance[] {
    const children: Instance[] = [];
    if (state.bannerInst !== null) children.push(state.bannerInst);
    if (state.emptyInst !== null) children.push(state.emptyInst);
    for (const r of data.verifiedRsns) {
        const inst = rowPool.get(`verified:${r.rsn}`);
        if (inst !== undefined) children.push(inst);
    }
    for (const req of data.pendingRequests) {
        const inst = rowPool.get(`pending:${req.id}`);
        if (inst !== undefined) children.push(inst);
    }
    return children;
}

function ensureFailed(state: RendererState): Instance {
    if (state.failedInst === null) {
        state.failedInst = paragraph(textProps([ACCOUNT_EMPTY_CLASS], "Failed to load."));
    }
    return state.failedInst;
}

function placeChildrenInto(host: Instance, children: readonly Instance[]): void {
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

function clearRsnPool(rowPool: Map<string, Instance>, state: RendererState): void {
    for (const inst of rowPool.values()) inst.destroy();
    rowPool.clear();
    state.bannerInst = destroyAndNull(state.bannerInst);
}

export function rsnListRenderer(host: Instance, refresh: () => void, status: Instance): RsnListRenderer {
    const rowPool = new Map<string, Instance>();
    const state: RendererState = { bannerInst: null, emptyInst: null, failedInst: null };
    function render(data: Identification | null): void {
        if (data === null) {
            clearRsnPool(rowPool, state);
            state.emptyInst = destroyAndNull(state.emptyInst);
            placeChildrenInto(host, [ensureFailed(state)]);
            return;
        }
        state.failedInst = destroyAndNull(state.failedInst);
        syncRowPool(rowPool, data, refresh, status);
        syncBanner(state, data);
        syncEmpty(state, data.verifiedRsns.length === 0 && data.pendingRequests.length === 0);
        placeChildrenInto(host, assembleChildren(state, rowPool, data));
    }
    return { render };
}
