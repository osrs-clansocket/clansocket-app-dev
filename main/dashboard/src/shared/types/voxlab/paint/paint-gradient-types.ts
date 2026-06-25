export type GradientType = "linear" | "radial";
export type GradientAxis = "x" | "y" | "z";
export type GradientTarget = "front" | "back" | "sides" | "all";

export interface GradientStop {
    color: string;
    position: number;
}

export interface GradientSpec {
    stops: GradientStop[];
    type: GradientType;
    axis: GradientAxis;
    target: GradientTarget;
}

export type GradientApply = GradientSpec;
