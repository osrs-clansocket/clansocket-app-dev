export function findRoots(inDegree: Record<string, number>): string[] {
    const roots: string[] = [];
    for (const [id, deg] of Object.entries(inDegree)) {
        if (deg === 0) roots.push(id);
    }
    return roots;
}
