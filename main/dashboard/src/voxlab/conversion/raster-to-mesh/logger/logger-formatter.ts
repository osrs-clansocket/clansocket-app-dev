import { IS_BROWSER as _IS_BROWSER, writeConsole as _writeConsole } from "./logger-console.js";
export const IS_BROWSER = _IS_BROWSER;
export const writeConsole = _writeConsole;
import type {
    FormatInput as _FormatInput,
    LogContext as _LogContext,
    LogLevel as _LogLevel,
    RemediationHint as _RemediationHint,
} from "./logger-format-types.js";
export type FormatInput = _FormatInput;
export type LogContext = _LogContext;
export type LogLevel = _LogLevel;
export type RemediationHint = _RemediationHint;
import { LEVEL_ORDER as _LEVEL_ORDER } from "./logger-format-types.js";
export const LEVEL_ORDER = _LEVEL_ORDER;
import { formatNode as _formatNode } from "./logger-format-node.js";
export const formatNode = _formatNode;
import { formatBrowser as _formatBrowser } from "./logger-format-browser.js";
export const formatBrowser = _formatBrowser;
