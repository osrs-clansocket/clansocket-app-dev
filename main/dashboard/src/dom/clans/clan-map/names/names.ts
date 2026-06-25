import { div } from "../../../factory/layout-ops";
import { effect, type ReadSignal, type Signal } from "../../../factory/reactive/index.js";
import type { Instance } from "../../../factory/core";
import { isPositionActive, type PositionsState } from "../../../../state/clans/stores/positions-store.js";
import { viewportToComposite } from "../paint/calculators/viewport-calculator.js";
import type { BlipPositionAnimator } from "../paint/animators/blip-position-animator.js";
import type { AtlasBox } from "../../../../shared/types/view-types.js";
import { MAP_NAMES_CLASS, MAP_NAME_CARD_HOVERED_CLASS } from "../../../../shared/constants/clan/clan-map-constants.js";
import { IS_HIDDEN_CLASS } from "../../../../shared/constants/state-modifier-constants.js";
import { buildCard, type CardRefs } from "./names-card.js";
import { purgeStaleCards, upsertCardIn, type NamesRow } from "./names-patch.js";

export interface MapNamesProps {
    positions$: ReadSignal<PositionsState>;
    viewport$: ReadSignal<AtlasBox>;
    canvasDims$: ReadSignal<{ w: number; h: number }>;
    activePlane$: ReadSignal<number>;
    visible$: Signal<boolean>;
    lastKnownVisible$: ReadSignal<boolean>;
    hoveredBlipHash$: ReadSignal<string | null>;
    paintTick$: ReadSignal<number>;
    blipAnimator: BlipPositionAnimator;
}

interface RowProcessArgs {
    props: MapNamesProps;
    root: Instance;
    pool: Map<string, CardRefs>;
    row: NamesRow;
    ps: PositionsState;
    view: ReturnType<typeof viewportToComposite>;
    dpr: number;
    perfNowMs: number;
    live: Set<string>;
}

function processNamesRow(a: RowProcessArgs): void {
    const { props, root, pool, row, ps, view, dpr, perfNowMs, live } = a;
    live.add(row.account_hash);
    const interp = props.blipAnimator.getInterpolated(row.account_hash, perfNowMs);
    const worldX = interp === null ? row.location_x : interp.x;
    const worldY = interp === null ? row.location_y : interp.y;
    const ix = (worldX - ps.mapMeta!.origin_world_x) * ps.mapMeta!.pixels_per_tile;
    const iy = (ps.mapMeta!.top_world_y - worldY) * ps.mapMeta!.pixels_per_tile;
    upsertCardIn(
        { root, pool, row, px: (ix * view.scale + view.offsetX) / dpr, py: (iy * view.scale + view.offsetY) / dpr },
        buildCard,
    );
}

function makeUpdateEffect(props: MapNamesProps, root: Instance, pool: Map<string, CardRefs>): () => void {
    return () => {
        const visible = props.visible$();
        root.el.classList.toggle(IS_HIDDEN_CLASS, !visible);
        if (!visible) return;
        const ps = props.positions$();
        const dims = props.canvasDims$();
        const plane = props.activePlane$();
        const showLastKnown = props.lastKnownVisible$();
        props.paintTick$();
        if (ps.mapMeta === null) return;
        const view = viewportToComposite(props.viewport$(), dims.w, dims.h);
        const dpr = window.devicePixelRatio || 1;
        const perfNowMs = performance.now();
        const live = new Set<string>();
        for (const row of ps.byHash.values()) {
            if (row.location_plane !== plane || (!showLastKnown && !isPositionActive(row))) continue;
            processNamesRow({ props, root, pool, row, ps, view, dpr, perfNowMs, live });
        }
        purgeStaleCards(pool, live);
    };
}

export function clanMapNames(props: MapNamesProps): Instance {
    const root = div({ classes: [MAP_NAMES_CLASS], context: null, meta: null });
    const pool = new Map<string, CardRefs>();
    root.trackDispose(effect(makeUpdateEffect(props, root, pool)));
    root.trackDispose(
        effect(() => {
            const hovered = props.hoveredBlipHash$();
            for (const [hash, card] of pool) {
                card.instance.el.classList.toggle(MAP_NAME_CARD_HOVERED_CLASS, hash === hovered);
            }
        }),
    );
    return root;
}

export { combatLines, type CombatLine } from "./names-combat.js";
export { prayerSpriteSrc } from "./names-card.js";
