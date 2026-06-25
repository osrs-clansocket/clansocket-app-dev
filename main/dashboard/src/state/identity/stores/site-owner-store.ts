import { signal, type ReadSignal } from "../../../dom/factory/reactive";
import { ownerStatus } from "../../site/site-client.js";

const isOwner$ = signal<boolean>(false);
const logoVersion$ = signal<string>("");
let started = false;

function ensure(): void {
    if (started) return;
    started = true;
    void ownerStatus().then((s) => {
        isOwner$.set(s.isOwner);
        if (typeof s.logoVersion === "string") logoVersion$.set(s.logoVersion);
    });
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
