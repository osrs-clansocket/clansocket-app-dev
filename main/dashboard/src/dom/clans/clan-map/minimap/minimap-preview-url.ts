export function previewUrl(plane: number): string {
    if (plane === 0) return "/resources/osrs/image_world_map/preview_world.webp";
    return `/resources/osrs/image_world_map/preview_world_z${plane}.webp`;
}
