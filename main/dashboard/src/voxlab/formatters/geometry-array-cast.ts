export function asFloat32(arr: ArrayLike<number>): Float32Array {
    return arr instanceof Float32Array ? arr : Float32Array.from(arr);
}

export function asUint32(arr: ArrayLike<number>): Uint32Array {
    return arr instanceof Uint32Array ? arr : Uint32Array.from(arr);
}

export function copyFloat32(arr: ArrayLike<number>): Float32Array {
    return Float32Array.from(arr);
}
