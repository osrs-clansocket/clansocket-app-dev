import type { DataRightsError } from "./types.js";

export interface DataExport {
    blob: Blob;
    filename: string;
}

export type ExportResult = ({ ok: true } & DataExport) | ({ ok: false } & DataRightsError);
