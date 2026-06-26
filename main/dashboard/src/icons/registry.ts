export interface IconFamilyConfig {
    readonly baseClass: string;
    readonly label: string;
    readonly license: string;
    readonly attribution: string | null;
    readonly kind: "font" | "raster" | "svg";
    readonly resolveSrc?: (name: string) => string | null;
}

export interface IconFamilyDef {
    prefix: string;
    config: IconFamilyConfig;
    glyphLoader: () => Promise<readonly string[]>;
}

const defs: IconFamilyDef[] = [];
const byPrefix = new Map<string, IconFamilyDef>();

export function defineIconFamily(def: IconFamilyDef): void {
    defs.push(def);
    byPrefix.set(def.prefix, def);
}

export function iconFamilyDefs(): readonly IconFamilyDef[] {
    return defs;
}

export function iconFamily(prefix: string): IconFamilyDef | undefined {
    return byPrefix.get(prefix);
}
