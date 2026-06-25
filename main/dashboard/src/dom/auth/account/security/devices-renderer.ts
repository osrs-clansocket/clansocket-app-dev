import { createInstance, paragraph, type Instance } from "../../../factory/index.js";
import type { PasskeyDevice } from "../../../../state/passkey/client/index.js";
import { ACCOUNT_EMPTY_CLASS } from "../../../../shared/constants/account-constants.js";

export interface DevicesRenderer {
    render: (devices: PasskeyDevice[]) => void;
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

function reconcileDevicePool(
    rowPool: Map<string, Instance>,
    devices: PasskeyDevice[],
    buildRow: (d: PasskeyDevice) => Instance,
): void {
    const live = new Set<string>();
    for (const d of devices) {
        live.add(d.id);
        if (!rowPool.has(d.id)) rowPool.set(d.id, buildRow(d));
    }
    for (const [id, inst] of rowPool) {
        if (!live.has(id)) {
            inst.destroy();
            rowPool.delete(id);
        }
    }
}

function orderRowsFor(devices: PasskeyDevice[], rowPool: Map<string, Instance>): Instance[] {
    const ordered: Instance[] = [];
    for (const d of devices) {
        const inst = rowPool.get(d.id);
        if (inst !== undefined) ordered.push(inst);
    }
    return ordered;
}

export function createDevicesRenderer(host: Instance, buildRow: (d: PasskeyDevice) => Instance): DevicesRenderer {
    const rowPool = new Map<string, Instance>();
    const emptyRef: { inst: Instance | null } = { inst: null };
    const renderEmpty = (): void => {
        for (const inst of rowPool.values()) inst.destroy();
        rowPool.clear();
        if (emptyRef.inst === null)
            emptyRef.inst = paragraph({ classes: [ACCOUNT_EMPTY_CLASS], text: "None.", context: null, meta: null });
        placeChildrenInto(host, [emptyRef.inst]);
    };
    const render = (devices: PasskeyDevice[]): void => {
        if (devices.length === 0) {
            renderEmpty();
            return;
        }
        if (emptyRef.inst !== null) {
            emptyRef.inst.destroy();
            emptyRef.inst = null;
        }
        reconcileDevicePool(rowPool, devices, buildRow);
        placeChildrenInto(host, orderRowsFor(devices, rowPool));
    };
    return { render };
}
