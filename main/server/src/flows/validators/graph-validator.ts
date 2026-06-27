import { BaseValidator } from "./base/base-validator.js";
import { registerValidator } from "./validator-registry.js";
import type { ValidatorContext, ValidatorFinding, ValidatorResult } from "./validator-types.js";

class GraphValidator extends BaseValidator {
    public readonly id = "graph-validator";

    public run(ctx: ValidatorContext): ValidatorResult {
        const adjacency = this.buildAdjacency(ctx);
        const cycles = this.findCycles(adjacency);
        if (cycles.length === 0) return this.ok();
        const findings: ValidatorFinding[] = cycles.map((cycle) =>
            this.finding("error", `graph cycle detected through nodes: ${cycle.join(" -> ")}`, {
                node_id: cycle[0],
                suggestion: "remove the back-edge; loops live at flow-level metadata only",
            }),
        );
        return { findings };
    }

    private buildAdjacency(ctx: ValidatorContext): Map<string, string[]> {
        const adjacency = new Map<string, string[]>();
        for (const node of ctx.definition.nodes) adjacency.set(node.id, []);
        for (const edge of ctx.definition.edges) {
            const bucket = adjacency.get(edge.from_node_id);
            if (bucket) bucket.push(edge.to_node_id);
        }
        return adjacency;
    }

    private findCycles(adjacency: Map<string, string[]>): string[][] {
        const cycles: string[][] = [];
        const visiting = new Set<string>();
        const visited = new Set<string>();
        for (const nodeId of adjacency.keys()) {
            if (!visited.has(nodeId)) this.dfsCycle(nodeId, adjacency, visiting, visited, [], cycles);
        }
        return cycles;
    }

    private dfsCycle(
        nodeId: string,
        adjacency: Map<string, string[]>,
        visiting: Set<string>,
        visited: Set<string>,
        stack: string[],
        cycles: string[][],
    ): void {
        visiting.add(nodeId);
        stack.push(nodeId);
        const neighbors = adjacency.get(nodeId) ?? [];
        for (const neighbor of neighbors) {
            if (visiting.has(neighbor)) {
                const start = stack.indexOf(neighbor);
                cycles.push([...stack.slice(start), neighbor]);
                continue;
            }
            if (!visited.has(neighbor)) {
                this.dfsCycle(neighbor, adjacency, visiting, visited, stack, cycles);
            }
        }
        stack.pop();
        visiting.delete(nodeId);
        visited.add(nodeId);
    }
}

registerValidator(new GraphValidator());
