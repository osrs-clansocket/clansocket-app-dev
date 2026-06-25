import type { BufferAttribute, Vector3 } from "three";

export function axisCenterMass(
    positions: BufferAttribute,
    targetVertices: ReadonlySet<number>,
    scratch: Vector3,
): { x: number; y: number; z: number } {
    let cx = 0,
        cy = 0,
        cz = 0;
    for (const idx of targetVertices) {
        scratch.fromBufferAttribute(positions, idx);
        cx += scratch.x;
        cy += scratch.y;
        cz += scratch.z;
    }
    const count = targetVertices.size;
    return { x: cx / count, y: cy / count, z: cz / count };
}
