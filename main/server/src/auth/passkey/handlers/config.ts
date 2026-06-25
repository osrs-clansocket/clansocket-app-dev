import type { Request } from "express";

export { issueSession } from "./session-issuer.js";

function isProduction(): boolean {
    return process.env.NODE_ENV === "production";
}

export function rpId(req: Request): string {
    const env = process.env.WEBAUTHN_RP_ID;
    if (env) return env;
    if (isProduction()) {
        throw new Error("WEBAUTHN_RP_ID must be set in production");
    }
    return req.hostname ?? "localhost";
}

export function rpName(): string {
    if (!process.env.WEBAUTHN_RP_NAME) throw new Error("WEBAUTHN_RP_NAME env var required");
    return process.env.WEBAUTHN_RP_NAME;
}

export function expectedOrigin(req: Request): string {
    if (process.env.WEBAUTHN_ORIGIN) return process.env.WEBAUTHN_ORIGIN;
    if (isProduction()) {
        throw new Error("WEBAUTHN_ORIGIN must be set in production");
    }
    const proto = req.header("x-forwarded-proto") ?? req.protocol;
    const host = req.get("host") ?? "localhost";
    return `${proto}://${host}`;
}
