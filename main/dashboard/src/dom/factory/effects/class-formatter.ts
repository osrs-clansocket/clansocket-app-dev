import { memoize } from "../../../state/caches/memoize.js";

const FX_PREFIX = "fx-";
const MAX_ENTRIES = 128;

export const effectClass = memoize(
    (name: string): string => (name.startsWith(FX_PREFIX) ? name : `${FX_PREFIX}${name}`),
    {
        tag: "render",
        maxEntries: MAX_ENTRIES,
        keyOf: (name) => name,
    },
);
