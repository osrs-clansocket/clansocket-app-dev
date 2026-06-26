import express from "express";
import fs from "fs";
import path from "path";
import { HEADER_CONTENT_TYPE, MIME_JSON } from "./shared/http/http-mime.js";
import { HTTP_NOT_FOUND } from "./shared/http/http-status.js";

const MIME_BY_EXT: Record<string, string> = {
    ".js": "application/javascript",
    ".css": "text/css",
    ".html": "text/html",
    ".json": MIME_JSON,
    ".svg": "image/svg+xml",
};

export function attachStaticServe(app: express.Express, dist: string, dashboardUrl: string): void {
    if (process.env.NODE_ENV !== "production") {
        app.use((_req, res) => {
            res.status(HTTP_NOT_FOUND).json({
                error: "frontend_not_served_in_dev",
                message: `This port serves /api/* and /ws/* only. Open ${dashboardUrl} for the SPA with HMR.`,
            });
        });
        return;
    }
    app.use((req, res, next) => {
        const accept = req.headers["accept-encoding"] ?? "";
        const filePath = path.join(dist, req.path);
        if (accept.includes("br") && fs.existsSync(filePath + ".br")) {
            req.url += ".br";
            res.setHeader("Content-Encoding", "br");
            const mime = MIME_BY_EXT[path.extname(filePath)];
            if (mime) res.setHeader(HEADER_CONTENT_TYPE, mime);
        }
        next();
    });
    app.use(express.static(dist, { maxAge: "1y", immutable: true, index: false }));
    app.get("/{*splat}", (_req, res) => res.sendFile(path.join(dist, "index.html")));
}
