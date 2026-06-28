import type {
    CardKind,
    FlowCardConfig,
} from "../../dom/pages/clans/manage/flow-builder/flow-card-types.js";
import { defaultActionCard, defaultCard } from "./card-defaults.js";
import {
    isOccupied,
    placementById,
    placementsCurrent,
    setPlacements,
} from "./placement-helpers.js";

function withPatched(id: string, patch: Readonly<Record<string, unknown>>): void {
    setPlacements(
        placementsCurrent().map((p) =>
            p.config.id === id ? { ...p, config: { ...p.config, ...patch } as FlowCardConfig } : p,
        ),
    );
}

export function addRight(fromId: string): void {
    const from = placementById(fromId);
    if (!from) return;
    let col = from.col + 1;
    while (isOccupied(from.row, col)) col += 1;
    setPlacements([...placementsCurrent(), { config: defaultActionCard(), row: from.row, col }]);
}

export function addBelow(fromId: string): void {
    const from = placementById(fromId);
    if (!from) return;
    let row = from.row + 1;
    while (isOccupied(row, from.col)) row += 1;
    setPlacements([...placementsCurrent(), { config: defaultActionCard(), row, col: from.col }]);
}

export function removeCard(id: string): void {
    const target = placementById(id);
    if (target && target.row === 0 && target.col === 0) return;
    setPlacements(placementsCurrent().filter((p) => p.config.id !== id));
}

export function updateCard(id: string, patch: Readonly<Record<string, unknown>>): void {
    withPatched(id, patch);
}

export function changeCardKind(id: string, kind: CardKind): void {
    const target = placementById(id);
    if (!target) return;
    const fresh = defaultCard(kind);
    withPatched(id, { ...fresh, id: target.config.id, name: target.config.name });
}
