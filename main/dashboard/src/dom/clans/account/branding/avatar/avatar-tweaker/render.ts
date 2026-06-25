import type { BrandingController } from "../../branding-controller/index.js";
import { CANVAS_CENTER, CANVAS_MASK_RADIUS, CANVAS_PX, DEGREES_TO_RAD } from "./constants.js";
import { makeRendererChecker } from "./render-checker.js";

export interface PreviewState {
    image: HTMLImageElement | null;
    loaded: boolean;
}

function drawCenteredRect(ctx: CanvasRenderingContext2D, w: number, h: number, r: number): void {
    ctx.beginPath();
    ctx.moveTo(r, 0);
    ctx.lineTo(w - r, 0);
    ctx.quadraticCurveTo(w, 0, w, r);
    ctx.lineTo(w, h - r);
    ctx.quadraticCurveTo(w, h, w - r, h);
    ctx.lineTo(r, h);
    ctx.quadraticCurveTo(0, h, 0, h - r);
    ctx.lineTo(0, r);
    ctx.quadraticCurveTo(0, 0, r, 0);
    ctx.closePath();
}

function drawCenteredImage(
    ctx: CanvasRenderingContext2D,
    img: HTMLImageElement,
    t: BrandingController["transform"],
): void {
    const longer = Math.max(img.naturalWidth, img.naturalHeight);
    const factor = (CANVAS_PX * t.scale) / longer;
    const w = img.naturalWidth * factor;
    const h = img.naturalHeight * factor;
    ctx.translate(CANVAS_CENTER + t.translateX, CANVAS_CENTER + t.translateY);
    ctx.rotate(t.rotate * DEGREES_TO_RAD);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, -w / 2, -h / 2, w, h);
}

export function createRenderer(
    ctx: CanvasRenderingContext2D | null,
    canvasEl: HTMLCanvasElement,
    ctrl: BrandingController,
    previewState: PreviewState,
): () => void {
    if (!ctx) return () => undefined;
    const paintChecker = makeRendererChecker(ctx, canvasEl);
    return (): void => {
        ctx.clearRect(0, 0, CANVAS_PX, CANVAS_PX);
        ctx.save();
        drawCenteredRect(ctx, CANVAS_PX, CANVAS_PX, CANVAS_MASK_RADIUS);
        ctx.clip();
        paintChecker();
        const img = previewState.image;
        if (previewState.loaded && img && img.naturalWidth > 0 && img.naturalHeight > 0) {
            drawCenteredImage(ctx, img, ctrl.transform);
        }
        ctx.restore();
    };
}
