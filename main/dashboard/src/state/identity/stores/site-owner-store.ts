import { signal, type ReadSignal } from "../../../dom/factory/reactive";

const isOwner$ = signal<boolean>(false);
const logoVersion$ = signal<string>("");
let started = false;

async function loadOwnerStatus(): Promise<void> {
    const { ownerStatus } = await import("../../site/site-client.js");
    const s = await ownerStatus();
    isOwner$.set(s.isOwner);
    if (typeof s.logoVersion === "string") logoVersion$.set(s.logoVersion);
}

function ensure(): void {
    if (started) return;
    started = true;
    const fire = (): void => {
        void loadOwnerStatus();
    };
    const ric = (window as unknown as { requestIdleCallback?: (cb: () => void) => void }).requestIdleCallback;
    if (typeof ric === "function") ric(fire);
    else setTimeout(fire, 0);
}

export const siteOwnerStore = {
    get isOwner$(): ReadSignal<boolean> {
        ensure();
        return isOwner$;
    },
    logoVersion(): string {
        ensure();
        return logoVersion$();
    },
};
