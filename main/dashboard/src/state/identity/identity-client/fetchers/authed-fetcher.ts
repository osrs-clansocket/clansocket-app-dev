import { getCorrelationId } from "../trackers/correlation-tracker.js";

const HEADER_CONTENT_TYPE = "content-type";
const MIME_JSON = "application/json";

function buildInit(init: RequestInit): RequestInit {
    const headers = new Headers(init.headers ?? {});
    if (init.body && typeof init.body === "string" && !headers.has(HEADER_CONTENT_TYPE)) {
        headers.set(HEADER_CONTENT_TYPE, MIME_JSON);
    }
    const correlationId = getCorrelationId();
    if (correlationId !== null && !headers.has("X-Caused-By")) {
        headers.set("X-Caused-By", correlationId);
    }
    return { ...init, headers, credentials: "same-origin" };
}

export async function authedFetch(path: string, init: RequestInit = {}): Promise<Response> {
    return fetch(path, buildInit(init));
}
