export type BrushMode = "paint" | "erase";

export interface BrushState {
    color: string;
    radius: number;
    falloffSigma: number;
    opacity: number;
    mode: BrushMode;
    paintMode: boolean;
    eyedropper: boolean;
    mirrorX: boolean;
    mirrorY: boolean;
    mirrorZ: boolean;
    hideBackFaces: boolean;
}

export interface BrushChange {
    color: string;
    radius: number;
    falloffSigma: number;
    opacity: number;
    mode: BrushMode;
    paintMode: boolean;
    eyedropper: boolean;
    mirrorX: boolean;
    mirrorY: boolean;
    mirrorZ: boolean;
    hideBackFaces: boolean;
}
