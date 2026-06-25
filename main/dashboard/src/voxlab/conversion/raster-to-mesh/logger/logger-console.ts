import type { LogLevel } from "./logger-formatter.js";

export const IS_BROWSER =
    typeof globalThis !== "undefined" && typeof (globalThis as { window?: unknown }).window !== "undefined";

export function writeConsole(level: LogLevel, args: unknown[]): void {
    if (level === "error") {
        console.error(...args);
    } else if (level === "warn") {
        console.warn(...args);
    } else {
        console.log(...args);
    }
}
