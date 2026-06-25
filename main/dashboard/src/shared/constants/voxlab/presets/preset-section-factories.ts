export function surface(tint: string, opacity: number, metalness: number, roughness: number): Record<string, unknown> {
    return { tint, opacity, metalness, roughness };
}

export function shading(smoothShading: boolean, flatShading: boolean): Record<string, unknown> {
    return { smoothShading, flatShading };
}

export function emissive(emissiveColor: string, emissiveIntensity: number): Record<string, unknown> {
    return { emissiveColor, emissiveIntensity };
}

export function coatSheen(args: {
    clearcoat: number;
    clearcoatRoughness: number;
    ior: number;
    sheen: number;
    sheenColor: string;
    anisotropy: number;
}): Record<string, unknown> {
    return { ...args };
}

export function ambient(ambientIntensity: number): Record<string, unknown> {
    return { ambientIntensity };
}

export function keyLight(args: {
    keyIntensity: number;
    keyPositionX: number;
    keyPositionY: number;
    keyPositionZ: number;
    shadowBias: number;
    shadowRadius: number;
}): Record<string, unknown> {
    return { ...args };
}

export function fillLight(args: {
    fillIntensity: number;
    fillColor: string;
    fillPositionX: number;
    fillPositionY: number;
    fillPositionZ: number;
}): Record<string, unknown> {
    return { ...args };
}

export function world(backgroundColor: string, toneMapping: string, exposure: number): Record<string, unknown> {
    return { backgroundColor, toneMapping, exposure };
}

export function bloom(
    bloomEnabled: boolean,
    bloomStrength: number,
    bloomRadius: number,
    bloomThreshold: number,
): Record<string, unknown> {
    return { bloomEnabled, bloomStrength, bloomRadius, bloomThreshold };
}

export function outline(
    outlineEnabled: boolean,
    outlineColor: string,
    outlineThickness: number,
): Record<string, unknown> {
    return { outlineEnabled, outlineColor, outlineThickness };
}

export function vignette(
    vignetteEnabled: boolean,
    vignetteAmount: number,
    vignetteColor: string,
): Record<string, unknown> {
    return { vignetteEnabled, vignetteAmount, vignetteColor };
}

export function contrast(contrastEnabled: boolean, contrastAmount: number): Record<string, unknown> {
    return { contrastEnabled, contrastAmount };
}

export function chromaticAberration(
    chromaticAberrationEnabled: boolean,
    chromaticAberrationAmount: number,
): Record<string, unknown> {
    return { chromaticAberrationEnabled, chromaticAberrationAmount };
}

export function quality(fxaaEnabled: boolean, msaaSamples: number, supersample: number): Record<string, unknown> {
    return { fxaaEnabled, msaaSamples, supersample };
}
