export type ClanIconKind = "builtin" | "image" | "voxlab";

export interface IconTransform {
    scale: number;
    rotate: number;
    translateX: number;
    translateY: number;
}

export interface BrandingUpdate {
    iconKind: ClanIconKind | null;
    iconValue: string | null;
    color: string | null;
}

type UploadFailureReason = "too_large" | "bad_mime" | "process_failed" | "no_file" | "upload_failed";
type CustomizeFailureReason = "source_not_tweakable" | "no_pristine_icon" | "bake_failed" | "failed";

export type UploadResult =
    | { ok: true; update: BrandingUpdate }
    | {
          ok: false;
          reason: UploadFailureReason;
          maxBytes?: number;
          mime?: string;
      };

export type CustomizeResult =
    | { ok: true; imageVersion: number; transform: IconTransform }
    | {
          ok: false;
          reason: CustomizeFailureReason;
          sourceExt?: string;
          detail?: string;
      };

type UploadErrorBody = { error?: string; maxBytes?: number; mime?: string };

const UPLOAD_ERROR_MAP: Record<string, (b: UploadErrorBody) => UploadResult> = {
    too_large: (b) => ({ ok: false, reason: "too_large", maxBytes: b.maxBytes }),
    bad_mime: (b) => ({ ok: false, reason: "bad_mime", mime: b.mime }),
    process_failed: () => ({ ok: false, reason: "process_failed" }),
    no_file: () => ({ ok: false, reason: "no_file" }),
};

export function mapUploadError(body: UploadErrorBody): UploadResult | null {
    const fn = UPLOAD_ERROR_MAP[body.error ?? ""];
    return fn ? fn(body) : null;
}

export function mapCustomizeError(body: {
    error?: string;
    sourceExt?: string;
    detail?: string;
}): CustomizeResult | null {
    switch (body.error) {
        case "source_not_tweakable":
            return { ok: false, reason: "source_not_tweakable", sourceExt: body.sourceExt };
        case "no_pristine_icon":
            return { ok: false, reason: "no_pristine_icon" };
        case "bake_failed":
            return { ok: false, reason: "bake_failed", detail: body.detail };
        default:
            return null;
    }
}

export async function readErrorBody<T>(res: Response): Promise<T | null> {
    try {
        return (await res.json()) as T;
    } catch {
        return null;
    }
}
