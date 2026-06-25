import type { Group, Mesh } from "three";
import { disposeMaterial } from "./mesh-manager-material.js";

export function disposeMesh(group: Group, mesh: Mesh): void {
    // eslint-disable-next-line lvi/no-raw-dom -- three.js Group.remove, not DOM
    group.remove(mesh);
    if (typeof mesh.geometry.disposeBoundsTree === "function") mesh.geometry.disposeBoundsTree();
    mesh.geometry.dispose();
    disposeMaterial(mesh.material);
}
