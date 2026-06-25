import { SVGPathData, SVGPathDataTransformer, type SVGCommand } from "svg-pathdata";
import type { Point2D } from "../raster-to-mesh/types/types-geom.js";
import { finalizeCurrent } from "./path-finalize.js";
import type { ParseState } from "./path-parse-state.js";
import { processCommand } from "./path-dispatch.js";

function commandsToRings(cmds: readonly SVGCommand[], tolerance: number): Point2D[][] {
    const state: ParseState = {
        rings: [],
        current: [],
        startPoint: null,
        pen: { x: 0, y: 0 },
        tolerance,
    };
    for (const cmd of cmds) processCommand(state, cmd);
    finalizeCurrent(state);
    return state.rings;
}

export function pathToRings(d: string, tolerance: number): Point2D[][] {
    const normalized = new SVGPathData(d)
        .toAbs()
        .transform(SVGPathDataTransformer.NORMALIZE_ST())
        .transform(SVGPathDataTransformer.NORMALIZE_HVZ())
        .transform(SVGPathDataTransformer.A_TO_C());
    return commandsToRings(normalized.commands, tolerance);
}
