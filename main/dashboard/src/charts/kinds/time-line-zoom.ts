import { ENABLED } from "./flags";

export function buildZoomConfig(minimal: boolean) {
    if (minimal) return undefined;
    return {
        pan: { enabled: ENABLED, mode: "x" as const },
        zoom: {
            wheel: { enabled: ENABLED },
            pinch: { enabled: ENABLED },
            mode: "x" as const,
        },
    };
}
