const THUMBNAIL_TARGET_PX = 512;

export function drawCentered(ctx: CanvasRenderingContext2D, img: HTMLImageElement): void {
    const scale = Math.min(THUMBNAIL_TARGET_PX / img.width, THUMBNAIL_TARGET_PX / img.height);
    const w = img.width * scale;
    const h = img.height * scale;
    ctx.drawImage(img, (THUMBNAIL_TARGET_PX - w) / 2, (THUMBNAIL_TARGET_PX - h) / 2, w, h);
}
