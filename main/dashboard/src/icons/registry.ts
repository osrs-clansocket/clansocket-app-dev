export interface IconFamilyConfig {
    readonly baseClass: string;
    readonly label: string;
    readonly license: string;
    readonly attribution: string | null;
    readonly kind: "font" | "raster";
    readonly resolveSrc?: (name: string) => string | null;
}

export interface IconFamilyDef<TPathsMap = unknown> {
    prefix: string;
    config: IconFamilyConfig;
    pathsLoader?: () => Promise<TPathsMap>;
    cssLoader?: () => Promise<unknown>;
    glyphLoader: () => Promise<Record<string, number>>;
}

const defs: IconFamilyDef[] = [];
const byPrefix = new Map<string, IconFamilyDef>();

export function defineIconFamily<T>(def: IconFamilyDef<T>): void {
    defs.push(def as IconFamilyDef);
    byPrefix.set(def.prefix, def as IconFamilyDef);
}

export function iconFamilyDefs(): readonly IconFamilyDef[] {
    return defs;
}

export function iconFamily(prefix: string): IconFamilyDef | undefined {
    return byPrefix.get(prefix);
}
