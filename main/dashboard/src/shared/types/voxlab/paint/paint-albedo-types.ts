export type AlbedoSource = "source-image" | "uploaded" | "none";

export interface AlbedoSettings {
    source: AlbedoSource;
    uploadedDataUrl: string | null;
}

export type AlbedoChange = AlbedoSettings;
