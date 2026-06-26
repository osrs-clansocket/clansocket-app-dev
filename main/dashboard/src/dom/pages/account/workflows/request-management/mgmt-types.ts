import type { Instance } from "../../../../factory";
import type { createChipController } from "./chips.js";
import type { createSearchController } from "./search-dropdown.js";

export interface ReqMgmtRefs {
    openBtn: Instance<HTMLButtonElement>;
    formElRef: { el: Instance | null };
    clanInput: Instance<HTMLInputElement>;
    chips: ReturnType<typeof createChipController>;
    search: ReturnType<typeof createSearchController>;
    rsnInput: Instance<HTMLInputElement>;
    statusEl: Instance;
    errorEl: Instance;
}
