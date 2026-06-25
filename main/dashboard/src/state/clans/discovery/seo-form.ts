import type { ManageClanSeo, SeoPatch } from "../clans-client/index.js";

export interface FormFields {
    title: string;
    description: string;
    image: string;
    isPublic: boolean;
}

export function emptyForm(): FormFields {
    return { title: "", description: "", image: "", isPublic: false };
}

export function fromSeo(seo: ManageClanSeo): FormFields {
    return {
        title: seo.title ?? "",
        description: seo.description ?? "",
        image: seo.image ?? "",
        isPublic: seo.isPublic,
    };
}

function nullIfBlank(s: string): string | null {
    return s.length === 0 ? null : s;
}

export function diffPatch(current: FormFields, original: FormFields): SeoPatch {
    const patch: SeoPatch = {};
    if (current.title !== original.title) patch.title = nullIfBlank(current.title);
    if (current.description !== original.description) patch.description = nullIfBlank(current.description);
    if (current.image !== original.image) patch.image = nullIfBlank(current.image);
    if (current.isPublic !== original.isPublic) patch.isPublic = current.isPublic;
    return patch;
}

export function patchHasChanges(patch: SeoPatch): boolean {
    return Object.keys(patch).length > 0;
}
