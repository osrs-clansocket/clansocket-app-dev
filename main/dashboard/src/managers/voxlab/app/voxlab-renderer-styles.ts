let voxlabCssLoaded = false;

export async function ensureVoxlabCss(): Promise<void> {
    if (voxlabCssLoaded) return;
    voxlabCssLoaded = true;
    await import("../../../styles/pages/voxlab/index.css");
}

export const CLS_STAGE = "voxlab-renderer-stage";
export const CLS_CANVAS = "voxlab-renderer-canvas";
export const STYLE_STAGE = "position: relative; width: 100%; height: 100%;";
export const STYLE_CANVAS = "display: block; width: 100%; height: 100%;";
