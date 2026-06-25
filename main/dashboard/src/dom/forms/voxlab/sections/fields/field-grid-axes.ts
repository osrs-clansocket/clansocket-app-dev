import { DEFAULT_EFFECTS } from "../../../../../shared/constants/voxlab/effect-constants.js";

export interface GridAxesFields {
    gridEnabled: boolean;
    gridColor: string;
    gridSize: number;
    gridDivisions: number;
    gridFloorY: number;
    axesLength: number;
}

export const DEFAULT_GRID_AXES: GridAxesFields = {
    gridEnabled: true,
    gridColor: DEFAULT_EFFECTS.gridColor,
    gridSize: DEFAULT_EFFECTS.gridSize,
    gridDivisions: DEFAULT_EFFECTS.gridDivisions,
    gridFloorY: DEFAULT_EFFECTS.gridFloorY,
    axesLength: DEFAULT_EFFECTS.axesLength,
};
