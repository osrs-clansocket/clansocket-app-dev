import type { SnapshotPart } from "./snapshot-path-types.js";

export class SnapshotRegistry {
    private readonly parts = new Map<string, SnapshotPart>();

    register<T>(part: SnapshotPart<T>): void {
        this.parts.set(part.name, part as SnapshotPart);
    }

    deregister(name: string): void {
        this.parts.delete(name);
    }

    get(name: string): SnapshotPart | undefined {
        return this.parts.get(name);
    }

    all(): ReadonlyArray<SnapshotPart> {
        return [...this.parts.values()];
    }

    has(name: string): boolean {
        return this.parts.has(name);
    }

    allPathStrings(): ReadonlyArray<string> {
        const out: string[] = [];
        for (const part of this.parts.values()) {
            for (const spec of part.paths) {
                out.push(`${part.name}.${spec.suffix}`);
            }
        }
        return out;
    }
}

export const snapshotRegistry = new SnapshotRegistry();
