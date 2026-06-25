import type { CookieOptions, Request } from "express";

export function isHttps(req: Request): boolean {
    return req.protocol === "https" || req.header("x-forwarded-proto") === "https";
}

export interface SecureCookieArgs {
    req: Request;
    maxAge: number;
    path?: string;
}

export function secureCookieOptions(args: SecureCookieArgs): CookieOptions {
    return {
        httpOnly: true,
        secure: isHttps(args.req),
        sameSite: "lax",
        maxAge: args.maxAge,
        path: args.path ?? "/",
    };
}
