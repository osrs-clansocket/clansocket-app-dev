import type { VectorOpts } from "./types.js";

export function validateInput(options: VectorOpts): void {
    if (!options || typeof options !== "object") {
        throw new Error(`vectorToMesh: options object required, got ${typeof options}`);
    }
    const src = options.source;
    if (!src || typeof src !== "object") {
        throw new Error(`vectorToMesh: source required, got ${typeof src}`);
    }
    if (src.kind === "svg-text" && typeof src.svgText !== "string") {
        throw new Error(`vectorToMesh: svg-text source must include svgText string, got ${typeof src.svgText}`);
    }
    if (src.kind === "svg-path" && typeof src.pathData !== "string") {
        throw new Error(`vectorToMesh: svg-path source must include pathData string, got ${typeof src.pathData}`);
    }
}
