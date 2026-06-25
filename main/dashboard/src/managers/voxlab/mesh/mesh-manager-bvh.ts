import { BufferGeometry, Mesh } from "three";

let bvhInstalled = false;

export async function installBvhPatch(): Promise<void> {
    if (bvhInstalled) return;
    const { acceleratedRaycast, computeBoundsTree, disposeBoundsTree } = await import("three-mesh-bvh");
    BufferGeometry.prototype.computeBoundsTree = computeBoundsTree;
    BufferGeometry.prototype.disposeBoundsTree = disposeBoundsTree;
    Mesh.prototype.raycast = acceleratedRaycast;
    bvhInstalled = true;
}
