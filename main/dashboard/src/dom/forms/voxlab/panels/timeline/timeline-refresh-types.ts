import type { Instance } from "../../../../factory/index.js";
import type { TimelineSource } from "./timeline-component-types.js";

export interface RefreshDeps {
    source: TimelineSource | null;
    play: Instance<HTMLButtonElement>;
    loop: Instance<HTMLButtonElement>;
    smoothing: Instance<HTMLButtonElement>;
    scrubber: Instance<HTMLInputElement>;
    markerRail: Instance;
    timeReadout: Instance;
}
