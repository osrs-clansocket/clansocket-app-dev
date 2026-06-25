export type LogLevel = "trace" | "debug" | "info" | "warn" | "error";

export interface RemediationHint {
    pattern: string;
    action: string;
    docsUrl?: string;
}

export interface LogContext {
    remediation?: RemediationHint;
    error?: Error;
    [key: string]: unknown;
}

export const LEVEL_ORDER: Record<LogLevel, number> = { trace: 0, debug: 1, info: 2, warn: 3, error: 4 };

export interface FormatInput {
    level: LogLevel;
    message: string;
    context: LogContext | undefined;
    verbose: boolean;
}
