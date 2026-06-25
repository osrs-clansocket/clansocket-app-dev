import type { BufferAttribute, Vector3 } from "three";

export function axisMaxRadius(
    positions: BufferAttribute,
    targetVertices: ReadonlySet<number>,
    center: { x: number; y: number; z: number },
    scratch: Vector3,
): number {
    let maxDistSq = 0;
    for (const idx of targetVertices) {
        scratch.fromBufferAttribute(positions, idx);
        const dx = scratch.x - center.x;
        const dy = scratch.y - center.y;
        const dz = scratch.z - center.z;
        const distSq = dx * dx + dy * dy + dz * dz;
        if (distSq > maxDistSq) maxDistSq = distSq;
    }
    return Math.sqrt(maxDistSq);
}
