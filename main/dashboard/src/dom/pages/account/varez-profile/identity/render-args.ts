import type { Instance } from "../../../../factory";
import type { TreeNode } from "./tree.js";

export interface NodeRenderArgs {
    host: Instance;
    node: TreeNode;
    depth: number;
    isLast: boolean;
    parentPrefix: string;
    rerender: () => void;
}
