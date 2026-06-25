import { anchor } from "../../../factory";

export function triggerDownload(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    // eslint-disable-next-line lvi/require-aria-label
    const a = anchor({
        href: url,
        download: filename,
        context: "hidden data-export download trigger",
        meta: ["action"],
    });
    a.mount(document.body);
    a.el.click();
    a.destroy();
    URL.revokeObjectURL(url);
}
