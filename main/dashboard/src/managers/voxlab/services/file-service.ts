import { anchor } from "../../../dom/factory/index.js";

const REVOKE_DELAY_MS = 60_000;
const JSON_EXT = ".json";
const JSON_MIME = "application/json";

export class FileService {
    async readText(file: File): Promise<string> {
        return file.text();
    }

    downloadBlob(payload: string, fileName: string, mimeType = JSON_MIME): void {
        const blob = new Blob([payload], { type: mimeType });
        this.saveBlob(blob, fileName);
    }

    saveBlob(blob: Blob, fileName: string): void {
        const url = URL.createObjectURL(blob);
        const link = anchor({
            href: url,
            download: fileName,
            rel: "noopener",
            ariaLabel: `download ${fileName}`,
            context: `download blob as ${fileName}`,
            meta: ["action"],
        });
        link.mount(document.body);
        link.el.click();
        link.destroy();
        setTimeout(() => URL.revokeObjectURL(url), REVOKE_DELAY_MS);
    }

    isJsonFile(file: File): boolean {
        return file.name.toLowerCase().endsWith(JSON_EXT) || file.type === JSON_MIME;
    }
}
