import type { AtlasBox } from "../../../../../shared/types/view-types.js";

export interface ViewportAnimRefs {
    rafId: number;
    lastWrite: AtlasBox | null;
}
