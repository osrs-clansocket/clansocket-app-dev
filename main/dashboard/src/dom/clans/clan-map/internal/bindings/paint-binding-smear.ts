import { updateSmearState, type SmearState } from "../../paint/calculators/motion-smear-calculator.js";
import { viewportToComposite } from "../../paint/calculators/viewport-calculator.js";
import type { BlipPositionAnimator } from "../../paint/animators/blip-position-animator.js";
import type { CanvasRefs } from "../state.js";

const MOTION_BLUR_MIN_SPEED = 8;
const MOTION_BLUR_MAX_PX = 1.2;
const MOTION_BLUR_SCALE = 0.025;

export interface SmearTracker {
    state: SmearState | null;
    lastPaintTime: number;
    residualRafId: number;
}

function applySmearBlur(refs: CanvasRefs, blurPx: number): void {
    const filterValue = blurPx > 0 ? `blur(${blurPx}px)` : "";
    refs.bg.style.filter = filterValue;
    refs.overlay.style.filter = filterValue;
}

function scheduleSmearResidual(smearTracker: SmearTracker, onTileReady: () => void): void {
    smearTracker.residualRafId = window.requestAnimationFrame(() => {
        smearTracker.residualRafId = 0;
        onTileReady();
    });
}

interface AdvanceSmearArgs {
    smearTracker: SmearTracker;
    blipAnimator: BlipPositionAnimator;
    refs: CanvasRefs;
    onTileReady: () => void;
    view: ReturnType<typeof viewportToComposite>;
    viewport: { x: number; y: number; w: number; h: number };
    now: number;
}

export function advanceSmear(a: AdvanceSmearArgs): void {
    const { smearTracker, blipAnimator, refs, onTileReady, view, viewport, now } = a;
    const paintGapMs = now - smearTracker.lastPaintTime;
    smearTracker.lastPaintTime = now;
    const next = updateSmearState({
        view,
        viewport,
        paintGapMs,
        prev: smearTracker.state,
        threshold: MOTION_BLUR_MIN_SPEED,
        maxBlurPx: MOTION_BLUR_MAX_PX,
        blurScale: MOTION_BLUR_SCALE,
    });
    smearTracker.state = next;
    applySmearBlur(refs, next.blurPx);
    if (next.blurPx > 0 || blipAnimator.hasActive(now)) {
        scheduleSmearResidual(smearTracker, onTileReady);
    }
}
