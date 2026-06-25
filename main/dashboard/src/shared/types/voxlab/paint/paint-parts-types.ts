export type MeshPart = "front" | "back" | "sides";

export interface PartsPaintState {
    front: string | null;
    back: string | null;
    sides: string | null;
}

export interface PartsFill {
    part: MeshPart;
    color: string;
}

export interface PartsReset {
    part: MeshPart;
}

export interface PartsSectionState {
    color: string;
}
