import type { RasterOpts } from "./types/types-raster.js";

function validateImageData(img: RasterOpts["imageData"] | undefined): void {
    if (!img || typeof img !== "object") {
        throw new Error(`rasterToMesh: options.imageData is required (got ${typeof img})`);
    }
    if (!Number.isFinite(img.width) || img.width <= 0 || !Number.isFinite(img.height) || img.height <= 0) {
        throw new Error(
            `rasterToMesh: imageData has invalid dimensions ${img.width}x${img.height} (must be positive finite)`,
        );
    }
    const expectedLength = img.width * img.height * 4;
    if (!img.data || img.data.length !== expectedLength) {
        throw new Error(
            `rasterToMesh: imageData.data length ${img.data?.length ?? 0} does not match width*height*4 (${expectedLength})`,
        );
    }
}

export function validateInput(options: RasterOpts): void {
    if (!options || typeof options !== "object") {
        throw new Error(`rasterToMesh: options object is required (got ${typeof options})`);
    }
    validateImageData(options.imageData);
}
