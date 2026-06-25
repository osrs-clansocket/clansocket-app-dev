import staticIcons from "../../state/static-icons.json";
import { BoundedCache } from "../../state/caches/bounded-cache.js";
import { nextFloat, nextInt } from "../../shared/random/non-crypto-random.js";

const TWO_PI = Math.PI * 2;
const VY_MIN = 0.15;
const VY_RANGE = 0.3;
const ALPHA_MIN = 0.35;
const ALPHA_RANGE = 0.4;
const SWAY_AMP = 0.45;
const SIZE_MIN = 10;
const SIZE_RANGE = 8;
const TIME_SCALE = 0.0008;
const EDGE_RATIO = 0.18;
const RESPAWN_PAD = 16;
const ROT_SPEED_RANGE = 0.015;
const HALF = 0.5;

const ICON_PATHS: readonly string[] = staticIcons as readonly string[];
const imageCache = new BoundedCache<string, HTMLImageElement>({
    tag: "render",
    maxEntries: 128,
});

let activeIcons: readonly string[] = ICON_PATHS;

export function setIconCount(n: number): void {
    if (n <= 0 || n >= ICON_PATHS.length) {
        activeIcons = ICON_PATHS;
        return;
    }
    const pool = [...ICON_PATHS];
    const picked: string[] = [];
    for (let i = 0; i < n; i += 1) {
        const idx = nextInt(pool.length);
        picked.push(pool[idx]!);
        pool.splice(idx, 1);
    }
    activeIcons = picked;
    for (const path of activeIcons) preloadOne(path);
}

function preloadOne(path: string): void {
    if (imageCache.has(path)) return;
    const img = new Image();
    img.decoding = "async";
    img.loading = "lazy";
    img.src = path;
    imageCache.set(path, img);
}

interface Particle {
    x: number;
    y: number;
    vy: number;
    size: number;
    phase: number;
    alpha: number;
    rotation: number;
    rotSpeed: number;
    iconIdx: number;
}

interface Frame {
    ctx: CanvasRenderingContext2D;
    w: number;
    h: number;
    t: number;
}

function iconCount(): number {
    return activeIcons.length;
}

function getCachedImage(path: string): HTMLImageElement {
    let img = imageCache.get(path);
    if (img) return img;
    img = new Image();
    img.decoding = "async";
    img.loading = "lazy";
    img.src = path;
    imageCache.set(path, img);
    return img;
}

function createParticle(w: number, h: number): Particle {
    return {
        x: nextFloat() * w,
        y: nextFloat() * h,
        vy: -(VY_MIN + nextFloat() * VY_RANGE),
        size: SIZE_MIN + nextFloat() * SIZE_RANGE,
        phase: nextFloat() * TWO_PI,
        alpha: ALPHA_MIN + nextFloat() * ALPHA_RANGE,
        rotation: nextFloat() * TWO_PI,
        rotSpeed: (nextFloat() - HALF) * ROT_SPEED_RANGE,
        iconIdx: nextInt(iconCount()),
    };
}

function stepParticle(p: Particle, w: number, h: number, t: number): void {
    p.y += p.vy;
    p.x += Math.sin(t * TIME_SCALE + p.phase) * SWAY_AMP;
    p.rotation += p.rotSpeed;
    if (p.y < -RESPAWN_PAD) {
        p.y = h + RESPAWN_PAD;
        p.x = nextFloat() * w;
        p.iconIdx = nextInt(iconCount());
    }
}

function edgeAlpha(p: Particle, h: number): number {
    const edge = h * EDGE_RATIO;
    const fadeIn = Math.min(1, (h - p.y) / edge);
    const fadeOut = Math.min(1, p.y / edge);
    return p.alpha * Math.max(0, Math.min(fadeIn, fadeOut));
}

function paintParticle(f: Frame, p: Particle): void {
    const a = edgeAlpha(p, f.h);
    if (a <= 0) return;
    const path = activeIcons[p.iconIdx];
    if (!path) return;
    const img = getCachedImage(path);
    if (!img.complete || img.naturalWidth === 0) return;
    f.ctx.save();
    f.ctx.globalAlpha = a;
    f.ctx.translate(p.x, p.y);
    f.ctx.rotate(p.rotation);
    const half = p.size * HALF;
    f.ctx.drawImage(img, -half, -half, p.size, p.size);
    f.ctx.restore();
}

function drawFrame(f: Frame, parts: Particle[]): void {
    f.ctx.clearRect(0, 0, f.w, f.h);
    for (const p of parts) {
        stepParticle(p, f.w, f.h, f.t);
        paintParticle(f, p);
    }
}

export { createParticle, drawFrame };
export type { Particle, Frame };
