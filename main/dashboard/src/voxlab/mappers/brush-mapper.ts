import { Vector3, type BufferAttribute } from "three";
import { HALVING_FACTOR } from "../../shared/constants/voxlab/texture-paint-constants.js";

export interface BrushHit {
    vertexIndex: number;
    weight: number;
}

export interface BrushMapperOptions {
    normals?: BufferAttribute;
    cameraPos?: Vector3;
    hideBackFaces?: boolean;
}

const scratchV = new Vector3();
const scratchDir = new Vector3();
const scratchNormal = new Vector3();
const sharedHits: BrushHit[] = [];

interface VertexCheckerArgs {
    hitWorldPoint: Vector3;
    positions: BufferAttribute;
    radiusSq: number;
    denom: number;
    hideBackFaces: boolean;
    normals: BufferAttribute | undefined;
    cameraPos: Vector3 | undefined;
}

function makeVertexChecker(a: VertexCheckerArgs): (i: number) => void {
    const { hitWorldPoint, positions, radiusSq, denom, hideBackFaces, normals, cameraPos } = a;
    return (i: number) => {
        scratchV.fromBufferAttribute(positions, i);
        const distSq = scratchV.distanceToSquared(hitWorldPoint);
        if (distSq > radiusSq) return;
        if (hideBackFaces && normals && cameraPos) {
            scratchNormal.fromBufferAttribute(normals, i);
            scratchDir.copy(scratchV).sub(cameraPos);
            if (scratchDir.dot(scratchNormal) > 0) return;
        }
        sharedHits.push({ vertexIndex: i, weight: Math.exp(-distSq / denom) });
    };
}

function runBrushCheck(
    checkVertex: (i: number) => void,
    candidateIndices: ReadonlyArray<number> | null,
    positionsCount: number,
): void {
    if (candidateIndices !== null) {
        for (const i of candidateIndices) checkVertex(i);
    } else {
        for (let i = 0; i < positionsCount; i++) checkVertex(i);
    }
}

export interface BrushMapperArgs {
    hitWorldPoint: Vector3;
    positions: BufferAttribute;
    radius: number;
    falloffSigma: number;
    candidateIndices: ReadonlyArray<number> | null;
    options?: BrushMapperOptions;
}

export function brushMapper(args: BrushMapperArgs): BrushHit[] {
    const { hitWorldPoint, positions, radius, falloffSigma, candidateIndices, options } = args;
    sharedHits.splice(0);
    const radiusSq = radius * radius;
    const sigmaWorld = falloffSigma * radius;
    const denom = HALVING_FACTOR * (sigmaWorld * sigmaWorld);
    const hideBackFaces =
        options?.hideBackFaces === true && options.normals !== undefined && options.cameraPos !== undefined;
    const checkVertex = makeVertexChecker({
        hitWorldPoint,
        positions,
        radiusSq,
        denom,
        hideBackFaces,
        normals: options?.normals,
        cameraPos: options?.cameraPos,
    });
    runBrushCheck(checkVertex, candidateIndices, positions.count);
    return sharedHits;
}

const CELL_KEY_RANGE = 1024;
const CELL_KEY_OFFSET = 512;
const CELL_KEY_RANGE_SQ = CELL_KEY_RANGE * CELL_KEY_RANGE;

export class VertexHashGrid {
    private readonly cells = new Map<number, number[]>();
    private readonly resultBuffer: number[] = [];

    constructor(
        positions: BufferAttribute,
        private readonly cellSize: number,
    ) {
        const v = new Vector3();
        for (let i = 0; i < positions.count; i++) {
            v.fromBufferAttribute(positions, i);
            const key = this.cellKey(v.x, v.y, v.z);
            const list = this.cells.get(key);
            if (list) {
                list.push(i);
            } else {
                this.cells.set(key, [i]);
            }
        }
    }

    queryRadius(point: Vector3, radius: number): number[] {
        this.resultBuffer.length = 0;
        const cellsRadius = Math.ceil(radius / this.cellSize);
        const cx = Math.floor(point.x / this.cellSize);
        const cy = Math.floor(point.y / this.cellSize);
        const cz = Math.floor(point.z / this.cellSize);
        for (let dx = -cellsRadius; dx <= cellsRadius; dx++) {
            for (let dy = -cellsRadius; dy <= cellsRadius; dy++) {
                for (let dz = -cellsRadius; dz <= cellsRadius; dz++) {
                    this.collectCell(cx + dx, cy + dy, cz + dz);
                }
            }
        }
        return this.resultBuffer;
    }

    private collectCell(x: number, y: number, z: number): void {
        const list = this.cells.get(this.cellKey(x, y, z));
        if (list === undefined) return;
        for (const idx of list) this.resultBuffer.push(idx);
    }

    private cellKey(x: number, y: number, z: number): number {
        return this.gridKey(
            Math.floor(x / this.cellSize),
            Math.floor(y / this.cellSize),
            Math.floor(z / this.cellSize),
        );
    }

    private gridKey(gx: number, gy: number, gz: number): number {
        return (
            (gx + CELL_KEY_OFFSET) * CELL_KEY_RANGE_SQ +
            (gy + CELL_KEY_OFFSET) * CELL_KEY_RANGE +
            (gz + CELL_KEY_OFFSET)
        );
    }
}
