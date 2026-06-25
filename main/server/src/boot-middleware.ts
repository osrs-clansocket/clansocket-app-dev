import express from "express";
import { randomUUID } from "node:crypto";
import { auditContext, readCausedHeader } from "./shared/audit-context.js";
import { HTTP_BAD_REQUEST, HTTP_INTERNAL_ERROR } from "./shared/http/http-status.js";

function jsonErrorMiddleware(
    err: unknown,
    _req: express.Request,
    res: express.Response,
    next: express.NextFunction,
): void {
    const e = err as { type?: string; statusCode?: number; status?: number; message?: string } | null;
    if (!e) {
        next(err);
        return;
    }
    const code = e.statusCode ?? e.status ?? 0;
    if (code >= HTTP_BAD_REQUEST && code < HTTP_INTERNAL_ERROR) {
        res.status(code).json({ error: "bad_request" });
        return;
    }
    if (e.type === "entity.parse.failed" || e.type === "entity.too.large" || e.type === "encoding.unsupported") {
        res.status(HTTP_BAD_REQUEST).json({ error: "bad_request" });
        return;
    }
    next(err);
}

function auditContextMiddleware(req: express.Request, _res: express.Response, next: express.NextFunction): void {
    const causedBy = readCausedHeader(req.headers["x-caused-by"]);
    auditContext.run({ causedBy, requestId: randomUUID(), startMs: Date.now() }, () => next());
}

export function attachBootMiddleware(app: express.Express): void {
    app.use(
        express.json({
            limit: "4mb",
            verify: (req: any, _res, buf: Buffer) => {
                req.rawBody = buf;
            },
        }),
    );
    app.use(jsonErrorMiddleware);
    app.use(auditContextMiddleware);
}
