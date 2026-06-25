export type FrameKey = "icon" | "hero";

const ICON_FRAME_ASPECT = 1;
const HERO_FRAME_ASPECT = 3.5;

export const FRAME_ASPECTS: Record<FrameKey, number> = {
    icon: ICON_FRAME_ASPECT,
    hero: HERO_FRAME_ASPECT,
};

export const DEFAULT_FRAME_ASPECT = ICON_FRAME_ASPECT;

export function resolveFrameAspect(key: string | null | undefined): number {
    if (typeof key === "string" && key in FRAME_ASPECTS) {
        return FRAME_ASPECTS[key as FrameKey];
    }
    return DEFAULT_FRAME_ASPECT;
}
