import { isObject } from "../is-object.js";

function splitPostFx(parts: Record<string, unknown>, pfx: Record<string, unknown>): void {
    if (parts.vignette === undefined) {
        parts.vignette = {
            vignetteEnabled: !!pfx.vignetteEnabled,
            vignetteAmount: typeof pfx.vignetteAmount === "number" ? pfx.vignetteAmount : 0.4,
            vignetteColor: typeof pfx.vignetteColor === "string" ? pfx.vignetteColor : "#000000",
        };
    }
    if (parts.contrast === undefined) {
        parts.contrast = {
            contrastEnabled: !!pfx.contrastEnabled,
            contrastAmount: typeof pfx.contrastAmount === "number" ? pfx.contrastAmount : 0.2,
        };
    }
    if (parts.chromaticAberration === undefined) {
        parts.chromaticAberration = {
            chromaticAberrationEnabled: !!pfx.chromaticAberrationEnabled,
            chromaticAberrationAmount:
                typeof pfx.chromaticAberrationAmount === "number" ? pfx.chromaticAberrationAmount : 0.3,
        };
    }
}

export function migrate10to11(raw: Record<string, unknown>): Record<string, unknown> {
    const parts = isObject(raw.parts) ? { ...(raw.parts as Record<string, unknown>) } : {};
    if (isObject(parts.postFx)) {
        splitPostFx(parts, parts.postFx as Record<string, unknown>);
        delete parts.postFx;
    }
    return { ...raw, schemaVersion: 11, parts };
}
