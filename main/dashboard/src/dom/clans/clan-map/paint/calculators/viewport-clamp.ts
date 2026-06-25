export function clampAspectPreserving(
    targetW: number,
    targetH: number,
    minDim: number,
    maxDim: number,
): { w: number; h: number } {
    let w = targetW;
    let h = targetH;
    const scaleUp = Math.max(minDim / w, minDim / h);
    if (scaleUp > 1) {
        w = w * scaleUp;
        h = h * scaleUp;
    }
    const scaleDown = Math.min(maxDim / w, maxDim / h);
    if (scaleDown < 1) {
        w = w * scaleDown;
        h = h * scaleDown;
    }
    return { w, h };
}
