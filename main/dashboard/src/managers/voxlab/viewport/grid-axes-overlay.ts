import { AxesHelper, Color, GridHelper, Group } from "three";
import {
    AXES_LENGTH,
    GOLD_COLOR,
    GRID_DIVISIONS,
    GRID_FLOOR_Y,
    GRID_SIZE,
} from "../../../shared/constants/voxlab/viewport-constants.js";

const GRID_LINE_COLOR = 0x444444;

function disposeMat(material: unknown): void {
    if (Array.isArray(material)) for (const m of material) (m as { dispose: () => void }).dispose();
    else (material as { dispose: () => void }).dispose();
}

export class GridAxesOverlay {
    readonly group = new Group();
    private grid: GridHelper;
    private axes: AxesHelper;
    private size = GRID_SIZE;
    private divisions = GRID_DIVISIONS;
    private color: number = GOLD_COLOR;
    private axesLength = AXES_LENGTH;

    constructor() {
        this.grid = new GridHelper(GRID_SIZE, GRID_DIVISIONS, GOLD_COLOR, GRID_LINE_COLOR);
        this.axes = new AxesHelper(AXES_LENGTH);
        this.grid.position.y = GRID_FLOOR_Y;
        this.group.add(this.grid);
        this.group.add(this.axes);
    }

    setVisible(visible: boolean): void {
        this.group.visible = visible;
    }

    setGridColor(color: number | string): void {
        const c = new Color(color);
        this.color = c.getHex();
        const mat = this.grid.material;
        if (Array.isArray(mat)) for (const m of mat) (m as { color?: Color }).color?.set(c);
        else (mat as { color?: Color }).color?.set(c);
    }

    setFloorY(y: number): void {
        this.grid.position.y = y;
    }

    setGridSize(size: number): void {
        if (size === this.size) return;
        this.size = size;
        this.rebuildGrid();
    }

    setGridDivisions(divisions: number): void {
        const next = Math.max(2, Math.round(divisions));
        if (next === this.divisions) return;
        this.divisions = next;
        this.rebuildGrid();
    }

    setAxesLength(length: number): void {
        if (length === this.axesLength) return;
        this.axesLength = length;
        // eslint-disable-next-line lvi/no-raw-dom -- three.js Group.remove, not DOM
        this.group.remove(this.axes);
        this.axes.geometry.dispose();
        disposeMat(this.axes.material);
        this.axes = new AxesHelper(length);
        this.group.add(this.axes);
    }

    dispose(): void {
        this.grid.geometry.dispose();
        disposeMat(this.grid.material);
        this.axes.geometry.dispose();
        disposeMat(this.axes.material);
        this.group.clear();
    }

    private rebuildGrid(): void {
        const previousY = this.grid.position.y;
        // eslint-disable-next-line lvi/no-raw-dom -- three.js Group.remove, not DOM
        this.group.remove(this.grid);
        this.grid.geometry.dispose();
        disposeMat(this.grid.material);
        this.grid = new GridHelper(this.size, this.divisions, this.color, GRID_LINE_COLOR);
        this.grid.position.y = previousY;
        this.group.add(this.grid);
    }
}
