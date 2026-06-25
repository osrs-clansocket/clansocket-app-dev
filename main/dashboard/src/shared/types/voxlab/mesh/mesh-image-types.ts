export interface ImagePixels {
    data: Uint8ClampedArray;
    width: number;
    height: number;
}

export interface LoadedImage extends ImagePixels {
    fileName: string;
    fileSize: number;
}
