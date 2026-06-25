import {
    IS_BROWSER,
    LEVEL_ORDER,
    formatBrowser,
    formatNode,
    writeConsole,
    type FormatInput,
    type LogContext,
    type LogLevel,
} from "./logger/logger-formatter.js";

export type { LogLevel, LogContext, RemediationHint } from "./logger/logger-formatter.js";

export interface PackageLogger {
    setVerbose(verbose: boolean): void;
    isVerbose(): boolean;
    setMinLevel(level: LogLevel): void;
    trace(message: string, context?: LogContext): void;
    debug(message: string, context?: LogContext): void;
    info(message: string, context?: LogContext): void;
    warn(message: string, context?: LogContext): void;
    error(message: string, context?: LogContext): void;
}

export interface LoggerOptions {
    verbose?: boolean;
    minLevel?: LogLevel;
}

class MeshLogger implements PackageLogger {
    private verbose: boolean;
    private minLevel: number;

    constructor(opts: LoggerOptions = {}) {
        this.verbose = opts.verbose ?? false;
        this.minLevel = LEVEL_ORDER[opts.minLevel ?? "info"];
    }

    setVerbose(verbose: boolean): void {
        this.verbose = verbose;
    }

    isVerbose(): boolean {
        return this.verbose;
    }

    setMinLevel(level: LogLevel): void {
        this.minLevel = LEVEL_ORDER[level];
    }

    private write(level: LogLevel, message: string, context?: LogContext): void {
        if (LEVEL_ORDER[level] < this.minLevel) return;
        const input: FormatInput = { level, message, context, verbose: this.verbose };
        if (IS_BROWSER) {
            writeConsole(level, formatBrowser(input));
            if (this.verbose && context?.error?.stack) console.log(context.error.stack);
        } else {
            writeConsole(level, [formatNode(input)]);
        }
    }

    trace(message: string, context?: LogContext): void {
        this.write("trace", message, context);
    }
    debug(message: string, context?: LogContext): void {
        this.write("debug", message, context);
    }
    info(message: string, context?: LogContext): void {
        this.write("info", message, context);
    }
    warn(message: string, context?: LogContext): void {
        this.write("warn", message, context);
    }
    error(message: string, context?: LogContext): void {
        this.write("error", message, context);
    }
}

export { MeshLogger as Logger };

export function createLogger(opts?: LoggerOptions): PackageLogger {
    return new MeshLogger(opts);
}

export const DEFAULT_LOGGER: PackageLogger = createLogger();
