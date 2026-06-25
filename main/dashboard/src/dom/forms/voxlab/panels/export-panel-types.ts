export type ExportFormat = "png" | "webp" | "apng" | "gif" | "png-sequence";

export const ANIMATION_FORMATS: ReadonlySet<ExportFormat> = new Set<ExportFormat>(["apng", "gif", "png-sequence"]);

export const FORMAT_OPTIONS: ReadonlyArray<{ value: ExportFormat; label: string }> = [
    { value: "png", label: "PNG (single frame, alpha)" },
    { value: "webp", label: "WebP (single frame, alpha)" },
    { value: "apng", label: "APNG (animation, clean alpha) — recommended" },
    { value: "gif", label: "GIF (animation, 1-bit alpha via magenta key)" },
    { value: "png-sequence", label: "PNG sequence (zip)" },
];

export interface CaptureRequest {
    format: "png" | "webp";
    width: number;
    height: number;
}

export interface BakeRequest {
    format: "apng" | "gif" | "png-sequence";
    width: number;
    height: number;
    fps: number;
}

export const DEFAULT_WIDTH = 1024;
export const DEFAULT_HEIGHT = 1024;
export const DEFAULT_FPS = 30;
export const MIN_DIMENSION = 16;
export const MAX_DIMENSION = 4096;
export const MIN_FPS = 1;
export const MAX_FPS = 120;
export const STEP_DIM = 16;
export const STEP_FPS = 1;
export const RADIX_DEC = 10;
