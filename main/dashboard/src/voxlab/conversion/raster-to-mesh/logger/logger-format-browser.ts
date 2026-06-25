import { LEVEL_COLORS, MODULE_COLOR_BROWSER, MODULE_NAME } from "./logger-format-colors.js";
import type { FormatInput } from "./logger-format-types.js";
import { formatRemediation, formatTimestamp } from "./logger-format-utils.js";

export function formatBrowser(input: FormatInput): [string, ...string[]] {
    const ts = formatTimestamp();
    const c = LEVEL_COLORS[input.level].browser;
    const remediation = formatRemediation(input.context?.remediation);
    const fmt = `%c[${ts}] %c${MODULE_NAME} %c${input.level.toUpperCase()}%c ${input.message}${remediation}`;
    return [
        fmt,
        "color: #94a3b8",
        `color: ${MODULE_COLOR_BROWSER}; font-weight: bold`,
        `color: ${c}; font-weight: bold`,
        "color: inherit",
    ];
}
