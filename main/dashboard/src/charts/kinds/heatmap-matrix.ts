import { MatrixController, MatrixElement } from "chartjs-chart-matrix";
import { Chart } from "../plugins";

export const MATRIX_TYPE = "matrix" as const;
export type MatrixKind = typeof MATRIX_TYPE;

let registered = false;

export function ensureMatrixRegistered(): void {
    if (registered) return;
    Chart.register(MatrixController, MatrixElement);
    registered = true;
}
