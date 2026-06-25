import { GRAY_NODE, LEVEL_COLORS, MODULE_COLOR_NODE, MODULE_NAME, RESET_NODE } from "./logger-format-colors.js";
import type { FormatInput } from "./logger-format-types.js";
import { formatRemediation, formatTimestamp } from "./logger-format-utils.js";

export function formatNode(input: FormatInput): string {
    const ts = formatTimestamp();
    const c = LEVEL_COLORS[input.level].node;
    const stack = input.verbose && input.context?.error?.stack ? `\n${input.context.error.stack}` : "";
    const remediation = formatRemediation(input.context?.remediation);
    return `${GRAY_NODE}[${ts}]${RESET_NODE} ${MODULE_COLOR_NODE}${MODULE_NAME}${RESET_NODE} ${c}${input.level.toUpperCase()}${RESET_NODE} ${input.message}${remediation}${stack}`;
}
