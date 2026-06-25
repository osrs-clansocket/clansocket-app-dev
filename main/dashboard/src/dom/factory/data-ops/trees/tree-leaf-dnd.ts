import { wireDragSource, wireDropTarget, type DragPayload, type DropPosition } from "./tree-dnd.js";
import type { Instance } from "../../core/index.js";

export interface DndReorder {
    dragged: DragPayload;
    targetKey: string;
    position: DropPosition;
}

export interface DndNodeRest {
    key: string;
    label: string;
    icon?: Instance | null;
    dragKind?: string;
    acceptDrops?: ReadonlyArray<string>;
    onReorder?: (event: DndReorder) => void;
}

export function wireNodeDnd(el: HTMLElement, node: DndNodeRest, allowInto: boolean): void {
    if (node.dragKind !== undefined) {
        wireDragSource(el, { key: node.key, kind: node.dragKind });
    }
    if (node.acceptDrops !== undefined && node.onReorder !== undefined) {
        const onReorder = node.onReorder;
        const key = node.key;
        wireDropTarget(el, {
            allowInto,
            accepts: new Set(node.acceptDrops),
            onDrop: (payload, position) => {
                onReorder({ position, dragged: payload, targetKey: key });
            },
        });
    }
}
