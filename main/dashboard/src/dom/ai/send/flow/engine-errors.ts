import { AUTH_ERROR_STATUS, AUTH_ERROR_TOKEN } from "./types.js";

export function isAuthError(message: string): boolean {
    return message === AUTH_ERROR_TOKEN || message.includes(AUTH_ERROR_STATUS);
}

export function isChainAbort(err: unknown): boolean {
    return err instanceof Error && err.name === "AbortError";
}
