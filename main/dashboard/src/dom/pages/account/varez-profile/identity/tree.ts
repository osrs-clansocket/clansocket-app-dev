export interface TreeNode {
    name: string;
    fullKey: string | null;
    value: string | null;
    children: TreeNode[];
}

export function emptyNode(name: string): TreeNode {
    return { name, fullKey: null, value: null, children: [] };
}

function ensureChildNode(
    parent: TreeNode,
    seg: string,
    childIndex: WeakMap<TreeNode, Map<string, TreeNode>>,
): TreeNode {
    const byName = childIndex.get(parent)!;
    let child = byName.get(seg);
    if (!child) {
        child = emptyNode(seg);
        parent.children.push(child);
        byName.set(seg, child);
        childIndex.set(child, new Map());
    }
    return child;
}

export function buildTree(identity: Record<string, string>): TreeNode {
    const root = emptyNode("");
    const childIndex = new WeakMap<TreeNode, Map<string, TreeNode>>();
    childIndex.set(root, new Map());
    for (const key of Object.keys(identity).sort()) {
        const segments = key.split(".");
        let node = root;
        for (let i = 0; i < segments.length; i++) {
            const child = ensureChildNode(node, segments[i]!, childIndex);
            if (i === segments.length - 1) {
                child.fullKey = key;
                child.value = identity[key]!;
            }
            node = child;
        }
    }
    return root;
}

export function buildTreeLink(depth: number, isLast: boolean): string {
    if (depth === 0) return "";
    const parts: string[] = [];
    for (let i = 0; i < depth - 1; i++) parts.push("│  ");
    parts.push(isLast ? "└─ " : "├─ ");
    return parts.join("");
}
