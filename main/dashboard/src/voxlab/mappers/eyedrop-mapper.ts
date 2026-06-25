import { Triangle, Vector3, type BufferAttribute, type Intersection } from "three";

const BYTE_MAX_EYEDROP = 255;

const scratchBary = new Vector3();
const scratchA = new Vector3();
const scratchB = new Vector3();
const scratchC = new Vector3();

function eyedropToHex(r: number, g: number, b: number): string {
    const clamp = (channel: number): number =>
        Math.max(0, Math.min(BYTE_MAX_EYEDROP, Math.round(channel * BYTE_MAX_EYEDROP)));
    const rHex = clamp(r).toString(16).padStart(2, "0");
    const gHex = clamp(g).toString(16).padStart(2, "0");
    const bHex = clamp(b).toString(16).padStart(2, "0");
    return `#${rHex}${gHex}${bHex}`;
}

function sampleColor(colors: BufferAttribute, i: number): [number, number, number] {
    return [colors.getX(i), colors.getY(i), colors.getZ(i)];
}

function eyedropBary(a: number, b: number, c: number, bary: Vector3): number {
    return a * bary.x + b * bary.y + c * bary.z;
}

export function eyedropMapper(
    intersection: Intersection,
    positions: BufferAttribute,
    colors: BufferAttribute,
): string | null {
    if (!intersection.face) return null;
    const { a, b, c } = intersection.face;
    scratchA.fromBufferAttribute(positions, a);
    scratchB.fromBufferAttribute(positions, b);
    scratchC.fromBufferAttribute(positions, c);
    Triangle.getBarycoord(intersection.point, scratchA, scratchB, scratchC, scratchBary);
    const [ar, ag, aB] = sampleColor(colors, a);
    const [br, bg, bB] = sampleColor(colors, b);
    const [cr, cg, cB] = sampleColor(colors, c);
    const r = eyedropBary(ar, br, cr, scratchBary);
    const g = eyedropBary(ag, bg, cg, scratchBary);
    const bChannel = eyedropBary(aB, bB, cB, scratchBary);
    return eyedropToHex(r, g, bChannel);
}
