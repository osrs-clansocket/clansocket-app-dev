import { div, paragraph, signal, type Instance, baseProps, textProps } from "../../../../factory";
import type { ReadSignal } from "../../../../factory/reactive/index.js";
import { womStoreFor } from "../../../../../state/wom/stores/wom-store.js";
import type { WomGroupDetails } from "../../../../../state/wom/clients/wom-client.js";
import { womDetailsStore } from "../../../../../state/wom/stores/wom-details-store.js";
import { LOADING_CLASS, LOADING_TEXT, ROOT_CLASS } from "./index-constants.js";
import type { LinkedShellHandle } from "./index-shell.js";

export interface WomTabState {
    slug: string;
    store: ReturnType<typeof womStoreFor>;
    detailsStore: ReturnType<typeof womDetailsStore>;
    detailsSignal: ReadSignal<WomGroupDetails | null>;
    feedbackSignal: ReturnType<typeof signal<string>>;
    showLinkForm: ReturnType<typeof signal<boolean>>;
    host: Instance;
    linkedShellRef: { v: LinkedShellHandle | null };
    mountedKindRef: { v: "loading" | "not-linked" | "linked" };
    mountedLinkerKeyRef: { v: string };
}

export function freshWomTab(slug: string): WomTabState {
    const store = womStoreFor(slug);
    const detailsStore = womDetailsStore(slug, () => store.status$().linked);
    return {
        slug,
        store,
        detailsStore,
        detailsSignal: detailsStore.details$,
        feedbackSignal: signal<string>(""),
        showLinkForm: signal<boolean>(false),
        host: div(baseProps([ROOT_CLASS]), [paragraph(textProps([LOADING_CLASS], LOADING_TEXT))]),
        linkedShellRef: { v: null },
        mountedKindRef: { v: "loading" },
        mountedLinkerKeyRef: { v: "" },
    };
}
