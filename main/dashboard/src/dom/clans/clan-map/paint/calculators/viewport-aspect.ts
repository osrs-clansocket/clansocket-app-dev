export function aspectFit(
    minHeight: number,
    minWidth: number,
    canvasAspect: number,
    maxDim: number,
): { w: number; h: number } {
    let h = Math.max(minHeight, minWidth / canvasAspect);
    let w = h * canvasAspect;
    if (w > maxDim || h > maxDim) {
        const scaleDown = Math.min(maxDim / w, maxDim / h);
        w = w * scaleDown;
        h = h * scaleDown;
    }
    return { w, h };
}
