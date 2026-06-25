import { CANVAS_PX, CHECKER_FALLBACK_A, CHECKER_FALLBACK_B, CHECKER_TILE_PX } from "./constants.js";

export function makeRendererChecker(ctx: CanvasRenderingContext2D, canvasEl: HTMLCanvasElement): () => void {
    return (): void => {
        const computed = getComputedStyle(canvasEl);
        const colorA = computed.getPropertyValue("--base-graphite-900").trim() || CHECKER_FALLBACK_A;
        const colorB = computed.getPropertyValue("--base-graphite-500").trim() || CHECKER_FALLBACK_B;
        for (let y = 0; y < CANVAS_PX; y += CHECKER_TILE_PX) {
            for (let x = 0; x < CANVAS_PX; x += CHECKER_TILE_PX) {
                const tileX = Math.floor(x / CHECKER_TILE_PX);
                const tileY = Math.floor(y / CHECKER_TILE_PX);
                ctx.fillStyle = (tileX + tileY) % 2 === 0 ? colorA : colorB;
                ctx.fillRect(x, y, CHECKER_TILE_PX, CHECKER_TILE_PX);
            }
        }
    };
}
