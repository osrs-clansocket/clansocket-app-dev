import type {
    CardKind,
    FlowCardConfig,
    FlowEdge,
} from "../../dom/pages/clans/manage/flow-builder/flow-card-types.js";
import { defaultCard } from "./card-defaults.js";
import {
    edgesCurrent,
    isOccupied,
    placementById,
    placementsCurrent,
    setEdges,
    setPlacements,
    setPlacementsAndEdges,
} from "./placement-helpers.js";
import { outputHandlesFor } from "../flows/node-handles.js";

function withPatched(id: string, patch: Readonly<Record<string, unknown>>): void {
    setPlacements(
        placementsCurrent().map((p) =>
            p.config.id === id ? { ...p, config: { ...p.config, ...patch } as FlowCardConfig } : p,
        ),
    );
}

function firstHandleId(config: FlowCardConfig): string {
    const handles = outputHandlesFor(config);
    return handles[0]?.id ?? "next";
}

function makeEdge(fromId: string, fromHandle: string, toId: string): FlowEdge {
    return {
        id: `${fromId}:${fromHandle}->${toId}`,
        from_node_id: fromId,
        from_handle_id: fromHandle,
        to_node_id: toId,
    };
}

function pickPosition(fromRow: number, fromCol: number, handleIndex: number): { row: number; col: number } {
    if (handleIndex === 0) {
        let col = fromCol + 1;
        while (isOccupied(fromRow, col)) col += 1;
        return { row: fromRow, col };
    }
    if (handleIndex === 1) {
        let row = fromRow + 1;
        while (isOccupied(row, fromCol)) row += 1;
        return { row, col: fromCol };
    }
    let row = fromRow + (handleIndex - 1);
    const col = fromCol + 1;
    while (isOccupied(row, col)) row += 1;
    return { row, col };
}

function addNodeWithEdge(fromId: string, handleId: string, kind: CardKind, handleIndex: number): void {
    const from = placementById(fromId);
    if (!from) return;
    const { row, col } = pickPosition(from.row, from.col, handleIndex);
    const newCard = defaultCard(kind);
    const placement = { config: newCard, row, col };
    const edge = makeEdge(fromId, handleId, newCard.id);
    setPlacementsAndEdges([...placementsCurrent(), placement], [...edgesCurrent(), edge]);
}

export function addDownstream(fromId: string, handleId: string, kind: CardKind = "action"): void {
    const from = placementById(fromId);
    if (!from) return;
    const handles = outputHandlesFor(from.config);
    const handleIndex = Math.max(0, handles.findIndex((h) => h.id === handleId));
    addNodeWithEdge(fromId, handleId, kind, handleIndex);
}

function humanizeExit(cls: string): string {
    const spaced = cls.split(/[_-]/g).filter((s) => s.length > 0);
    if (spaced.length === 0) return cls;
    return spaced.map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join(" ");
}

function pickExitPosition(fromRow: number, fromCol: number, exitIndex: number): { row: number; col: number } {
    let row = fromRow + exitIndex;
    const col = fromCol + 1;
    while (isOccupied(row, col)) row += 1;
    return { row, col };
}

export function openExitAndAdd(fromId: string, cls: string): void {
    const from = placementById(fromId);
    if (!from) return;
    if (from.config.kind !== "action") return;
    const action = from.config;
    const alreadyOpen = action.openExits.includes(cls);
    const handles = outputHandlesFor(action);
    const exitIndex = alreadyOpen
        ? handles.findIndex((h) => h.id === cls)
        : action.openExits.length;
    const placements = placementsCurrent().map((p) =>
        p.config.id === fromId
            ? { ...p, config: { ...action, openExits: alreadyOpen ? action.openExits : [...action.openExits, cls] } }
            : p,
    );
    setPlacements(placements);
    const fresh = { ...defaultCard("action"), name: humanizeExit(cls) };
    const { row, col } = pickExitPosition(from.row, from.col, Math.max(0, exitIndex));
    const placement = { config: fresh, row, col };
    const edge = makeEdge(fromId, cls, fresh.id);
    setPlacementsAndEdges([...placementsCurrent(), placement], [...edgesCurrent(), edge]);
}

export function closeExitAndRemove(fromId: string, cls: string): void {
    const from = placementById(fromId);
    if (!from) return;
    if (from.config.kind !== "action") return;
    const action = from.config;
    const wired = edgesCurrent().filter((e) => e.from_node_id === fromId && e.from_handle_id === cls);
    const targetIds = new Set(wired.map((e) => e.to_node_id));
    const placements = placementsCurrent()
        .filter((p) => !targetIds.has(p.config.id))
        .map((p) =>
            p.config.id === fromId
                ? { ...p, config: { ...action, openExits: action.openExits.filter((c) => c !== cls) } }
                : p,
        );
    const edges = edgesCurrent().filter(
        (e) =>
            !(e.from_node_id === fromId && e.from_handle_id === cls) &&
            !targetIds.has(e.from_node_id) &&
            !targetIds.has(e.to_node_id),
    );
    setPlacementsAndEdges(placements, edges);
}

export function connectExisting(fromId: string, handleId: string, toId: string): void {
    if (fromId === toId) return;
    const dup = edgesCurrent().some(
        (e) => e.from_node_id === fromId && e.from_handle_id === handleId && e.to_node_id === toId,
    );
    if (dup) return;
    setEdges([...edgesCurrent(), makeEdge(fromId, handleId, toId)]);
}

export function addRight(fromId: string): void {
    const from = placementById(fromId);
    if (!from) return;
    addNodeWithEdge(fromId, firstHandleId(from.config), "action", 0);
}

export function addBelow(fromId: string): void {
    const from = placementById(fromId);
    if (!from) return;
    addNodeWithEdge(fromId, firstHandleId(from.config), "action", 1);
}

export function addParallelSibling(siblingId: string): void {
    const sibling = placementById(siblingId);
    if (!sibling) return;
    const inbound = edgesCurrent().find((e) => e.to_node_id === siblingId);
    if (!inbound) {
        addNodeWithEdge(siblingId, firstHandleId(sibling.config), "action", 1);
        return;
    }
    const fresh = defaultCard("action");
    let row = sibling.row + 1;
    const col = sibling.col;
    while (isOccupied(row, col)) row += 1;
    const placement = { config: fresh, row, col };
    const edge = makeEdge(inbound.from_node_id, inbound.from_handle_id, fresh.id);
    setPlacementsAndEdges([...placementsCurrent(), placement], [...edgesCurrent(), edge]);
}

export function removeCard(id: string): void {
    const target = placementById(id);
    if (target && target.row === 0 && target.col === 0) return;
    const inboundEdges = edgesCurrent().filter((e) => e.to_node_id === id);
    const openExitsToClose = new Map<string, Set<string>>();
    for (const edge of inboundEdges) {
        const source = placementById(edge.from_node_id);
        if (!source || source.config.kind !== "action") continue;
        if (!source.config.openExits.includes(edge.from_handle_id)) continue;
        const set = openExitsToClose.get(source.config.id) ?? new Set<string>();
        set.add(edge.from_handle_id);
        openExitsToClose.set(source.config.id, set);
    }
    const placements = placementsCurrent()
        .filter((p) => p.config.id !== id)
        .map((p) => {
            const close = openExitsToClose.get(p.config.id);
            if (!close || p.config.kind !== "action") return p;
            const action = p.config;
            return {
                ...p,
                config: { ...action, openExits: action.openExits.filter((c) => !close.has(c)) },
            };
        });
    const edges = edgesCurrent().filter((e) => e.from_node_id !== id && e.to_node_id !== id);
    setPlacementsAndEdges(placements, edges);
}

export function updateCard(id: string, patch: Readonly<Record<string, unknown>>): void {
    withPatched(id, patch);
}

function collectDownstreamReachable(rootId: string, allEdges: readonly FlowEdge[]): Set<string> {
    const reachable = new Set<string>();
    const queue: string[] = [rootId];
    while (queue.length > 0) {
        const current = queue.shift()!;
        for (const edge of allEdges) {
            if (edge.from_node_id !== current) continue;
            if (reachable.has(edge.to_node_id)) continue;
            reachable.add(edge.to_node_id);
            queue.push(edge.to_node_id);
        }
    }
    return reachable;
}

export function changeCardKind(id: string, kind: CardKind): void {
    const target = placementById(id);
    if (!target) return;
    const fresh = defaultCard(kind);
    const downstream = collectDownstreamReachable(id, edgesCurrent());
    const placements = placementsCurrent()
        .filter((p) => !downstream.has(p.config.id))
        .map((p) =>
            p.config.id === id
                ? { ...p, config: { ...fresh, id: target.config.id, name: target.config.name } as FlowCardConfig }
                : p,
        );
    const edges = edgesCurrent().filter(
        (e) => e.from_node_id !== id && !downstream.has(e.from_node_id) && !downstream.has(e.to_node_id),
    );
    setPlacementsAndEdges(placements, edges);
}

export function changeActionOperation(id: string, patch: Readonly<Record<string, unknown>>): void {
    const target = placementById(id);
    if (!target) return;
    if (target.config.kind !== "action") {
        withPatched(id, patch);
        return;
    }
    const downstream = collectDownstreamReachable(id, edgesCurrent());
    const placements = placementsCurrent()
        .filter((p) => !downstream.has(p.config.id))
        .map((p) => (p.config.id === id ? { ...p, config: { ...p.config, ...patch } as FlowCardConfig } : p));
    const edges = edgesCurrent().filter(
        (e) => e.from_node_id !== id && !downstream.has(e.from_node_id) && !downstream.has(e.to_node_id),
    );
    setPlacementsAndEdges(placements, edges);
}
