import { SVGPathData, type SVGCommand } from "svg-pathdata";
import { handleClosePath, handleCubic, handleLineTo, handleMoveTo, handleQuadratic } from "./path-command-handlers.js";
import type { ParseState } from "./path-parse-state.js";

type CommandHandlers = Partial<{
    [T in SVGCommand["type"]]: (state: ParseState, cmd: Extract<SVGCommand, { type: T }>) => void;
}>;

const COMMAND_HANDLERS: CommandHandlers = {
    [SVGPathData.MOVE_TO]: (s, c) => handleMoveTo(s, c.x, c.y),
    [SVGPathData.LINE_TO]: (s, c) => handleLineTo(s, c.x, c.y),
    [SVGPathData.CURVE_TO]: (s, c) => handleCubic(s, { x1: c.x1, y1: c.y1, x2: c.x2, y2: c.y2, x: c.x, y: c.y }),
    [SVGPathData.QUAD_TO]: (s, c) => handleQuadratic(s, { x1: c.x1, y1: c.y1, x: c.x, y: c.y }),
    [SVGPathData.CLOSE_PATH]: (s) => handleClosePath(s),
};

export function processCommand(state: ParseState, cmd: SVGCommand): void {
    const handler = COMMAND_HANDLERS[cmd.type] as ((state: ParseState, cmd: SVGCommand) => void) | undefined;
    handler?.(state, cmd);
}
