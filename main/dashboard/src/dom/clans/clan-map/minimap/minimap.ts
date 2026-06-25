import { div } from "../../../factory/layout-ops";
import { effect, signal, type ReadSignal, type Signal } from "../../../factory/reactive/index.js";
import type { Instance } from "../../../factory/core";
import type { PositionsState } from "../../../../state/clans/stores/positions-store.js";
import { clampToAtlas } from "../internal/atlas-clamper.js";
import { makeViewportAnimator } from "../internal/animators/viewport-animator.js";
import { MAP_MINIMAP_CLASS, MAP_MINIMAP_WRAP_CLASS } from "../../../../shared/constants/clan/clan-map-constants.js";
import { IS_COLLAPSED_CLASS, IS_FOLLOW_LOCKED_CLASS } from "../../../../shared/constants/state-modifier-constants.js";
import type { AtlasBox } from "../../../../shared/types/view-types.js";
import { wirePaintLoop } from "./minimap-paint.js";
import { wirePointerDrag, wireWheelZoom } from "./minimap-input.js";
import { buildMinimapSurface, buildToggleBtn } from "./minimap-chrome.js";

export interface MinimapProps {
    positions$: ReadSignal<PositionsState>;
    viewport$: Signal<AtlasBox>;
    activePlane$: Signal<number>;
    mode$: Signal<"auto" | "manual">;
    alertedHashes$: ReadSignal<ReadonlySet<string>>;
    paintTick$: ReadSignal<number>;
    followedHash$: ReadSignal<string | null>;
}

export function clanMapMinimap(props: MinimapProps): Instance<HTMLElement> {
    const { bg, overlay } = buildMinimapSurface(props.activePlane$);
    wirePaintLoop(props, overlay);
    const animator = makeViewportAnimator(props.viewport$, clampToAtlas);
    wirePointerDrag(props, overlay, animator);
    wireWheelZoom(props, overlay, animator);
    overlay.trackDispose(
        effect(() => {
            overlay.el.classList.toggle(IS_FOLLOW_LOCKED_CLASS, props.followedHash$() !== null);
        }),
    );
    const collapsed$ = signal<boolean>(false);
    const wrap = div({ classes: [MAP_MINIMAP_WRAP_CLASS], context: null, meta: null }, [bg, overlay]);
    const toggleBtn = buildToggleBtn(collapsed$);
    const root = div({ classes: [MAP_MINIMAP_CLASS], context: null, meta: null }, [wrap, toggleBtn]);
    root.trackDispose(
        effect(() => {
            root.el.classList.toggle(IS_COLLAPSED_CLASS, collapsed$());
        }),
    );
    return root;
}
