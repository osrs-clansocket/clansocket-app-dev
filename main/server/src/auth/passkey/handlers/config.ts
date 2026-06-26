import type { Request } from "express";
import { envOrFallback } from "./reader-env.js";

export { issueSession } from "./session-issuer.js";

export function rpId(req: Request): string {
    return envOrFallback(
        "WEBAUTHN_RP_ID",
        "WEBAUTHN_RP_ID must be set in production",
        () => req.hostname ?? "localhost",
    );
}

export function rpName(): string {
    if (!process.env.WEBAUTHN_RP_NAME) throw new Error("WEBAUTHN_RP_NAME env var required");
    return process.env.WEBAUTHN_RP_NAME;
}

export function expectedOrigin(req: Request): string {
    return envOrFallback("WEBAUTHN_ORIGIN", "WEBAUTHN_ORIGIN must be set in production", () => {
        const proto = req.header("x-forwarded-proto") ?? req.protocol;
        const host = req.get("host") ?? "localhost";
        return `${proto}://${host}`;
    });
}
