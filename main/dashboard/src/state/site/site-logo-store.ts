import { createFetchStore } from "../stores/lazy-store.js";
import { logoRecord } from "./site-client.js";
import type { InitialState } from "../../managers/voxlab/app/voxlab-editor.js";

const NEVER_AUTO_REFRESH = (): (() => void) => () => undefined;

export const siteLogoStore = createFetchStore<InitialState | null, "logo$">({
    key: "logo$",
    initial: null,
    load: async () => logoRecord(),
    subscribe: NEVER_AUTO_REFRESH,
});
